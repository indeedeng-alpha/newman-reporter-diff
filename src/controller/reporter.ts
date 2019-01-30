import { stringifyJson } from "../util/json-stringifier";
import { getNewmanDiffOptionFromVariables, onEachItemSet } from "./controller";
import { changeLogLevel, loggerfactory } from "../util/logging";
import { writeFiles } from "../diff-writer";
import { Item, ResponseDiff } from "../model/diff-model";
import { toShortJiraTicketString } from "../util/jira-formatter";
import { AbstractItemDiffer, JsonItemDiffer, TextualItemDiffer } from "../util/response-differ";


const log = loggerfactory.getLogger("newman.reporter.diff");

/**
 * Diff plugin class intended to be subclassed to extend / modify behaviors
 */
export class NewmanDiffReporter {

    private _projectPath: string;
    private _ignoredHeadersList: string[];
    private textualDiffer: TextualItemDiffer;
    private jsonDiffer: JsonItemDiffer;


    constructor(reporterOptions: any, collectionRunOptions: any) {
        if (reporterOptions.verbose) {
            changeLogLevel({group: "all", logLevel: "Debug"});
            log.debug(() => "Verbose logging");
        }
        log.debug(() => "Reporter Options " + stringifyJson(reporterOptions));
        log.debug(() => "Collection Run Options " + stringifyJson(collectionRunOptions));
        // contains values from data.csv
        // const iterationData = collectionRunOptions.iterationData;

        this._ignoredHeadersList = getNewmanDiffOptionFromVariables(collectionRunOptions.collection.variables, "ignoredHeadersList");
        log.debug(() => "Ignored headers: " + stringifyJson(this._ignoredHeadersList));

        this.textualDiffer = new TextualItemDiffer(this.ignoredHeadersList);
        this.jsonDiffer = new JsonItemDiffer(this.ignoredHeadersList);

        this._projectPath = reporterOptions.export || "./reports";
    }

    get projectPath(): string {
        return this._projectPath;
    }

    get ignoredHeadersList(): string[] {
        return this._ignoredHeadersList;
    }

    /**
     * Override to customize reporting of detected diffs.
     * @param responseDiff
     */
    public handleResponseDiff(responseDiff: ResponseDiff) {
        if (responseDiff) {
            // Future work: Use template engine and template file to choose format
            log.info(toShortJiraTicketString(responseDiff) + "\n\n");
            writeFiles(this.projectPath, {
                "item0.json": stringifyJson(responseDiff.item0),
                "item1.json": stringifyJson(responseDiff.item1),
                "statusDiff.txt": responseDiff.statusDiff,
                "rowsDiff.txt": responseDiff.rowsDiff,
                "headerDiff.txt": responseDiff.headerDiff,
                "payloadDiff.txt": responseDiff.payloadDiff
            });
        }
    }

    protected static getHttpContentType(headers: Record<string, string>) {
        // reads/guesses the content type of the response
        let contentType;
        if (headers) {
            contentType = headers["Content-Type"] as string;
        }
        if (!contentType) {
            contentType = "text/plain";
        }
        return contentType;
    }

    /**
     * returns a function that can diff http items with given content type.
     * Override to customize diff for specific content types.
     * @param httpContentType
     */
    protected getDiffHandler(httpContentType: string): undefined | AbstractItemDiffer {
        if (httpContentType.indexOf("tab-separated-values") > -1
            || httpContentType.indexOf("text/plain") > -1) {
            return this.textualDiffer;
        }
        if (httpContentType.indexOf("application/json") > -1) {
            return this.jsonDiffer;
        }
        // Future work: Json, xml, ...
        return undefined;
    }

    /**
     * Calculates the diff.
     * Override to customize diff detection.
     * @param items
     */
    public computeDiff(items: Item[]): ResponseDiff {
        const httpContentType0 = NewmanDiffReporter.getHttpContentType(items[0].response.headers);
        const itemDiffHandler = this.getDiffHandler(httpContentType0);
        if (itemDiffHandler === undefined) {
            throw new Error("Cannot compare items of contenttypes: " + httpContentType0);
        }
        return itemDiffHandler.compareItemPair(items[0], items[1]);
    }

}

/**
 * Entry point into the newman reporter
 * @param newmanEventEmitter provided by newman to reporters.
 * @param reporterOptions : options passed to newman for reporters via --reporter-diff-<name> <value>
 * @param collectionRunOptions
 * @param reporter the instance handling reponses
 */
export function registerToReporterEvents(newmanEventEmitter: any, reporterOptions: any, collectionRunOptions: any, reporter: NewmanDiffReporter) {
    onEachItemSet(newmanEventEmitter, items => {
        const responseDiff = reporter.computeDiff(items);
        if (!responseDiff.wasFailure() && responseDiff.hasDifferences()) {
            reporter.handleResponseDiff(responseDiff);
        }
    });
}
