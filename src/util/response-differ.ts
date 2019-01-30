import { Item, ResponseDiff } from "../model/diff-model";
import { textdiff } from "./text-differ";
import _ = require("lodash");
import { objectDiff } from "./object-differ";
import { stringifyJson } from "./json-stringifier";
import { loggerfactory } from "../util/logging";

const log = loggerfactory.getLogger("newman.diff.util.response-differ");

/**
 * Markdown-like stringification
 * @param map
 */
function stringifyFlatMap(map: Record<string, any>): string {
    if (_.isEmpty(map)) {
        return "";
    }
    const keys = _.map(map, (v: any, k: string) => k);
    keys.sort();

    return "* " + keys.map((key: string) => key + ": " + stringifyJson(map[key])).join("\n* ")
        + "\n";
}



/**
 * Provides differ for http items with textual responses that can be compared with text diff.
 */
export abstract class AbstractItemDiffer {
    private _ignoredHeadersList: string[] | undefined;

    public constructor(ignoredHeadersList: string[] | undefined) {
        this._ignoredHeadersList = ignoredHeadersList;
    }

    get ignoredHeadersList(): string[] | undefined {
        return this._ignoredHeadersList;
    }

    /**
     * creates a map as a copy of original without given ignored keys
     */
    protected static withoutKeys(mapOrValue: any, ignoreList: string[] | undefined): any {
        if (typeof mapOrValue !== "object" || mapOrValue === null) {
            return mapOrValue;
        }
        return _.reduce(mapOrValue, (result: Record<string, any>, value: string | any, key: string) => {
            if (!ignoreList || ignoreList.indexOf(key) === -1) {
                result[key] = this.withoutKeys(value, ignoreList);
            }
            return result;
        }, {});
    }

    protected computeMapDiff(map0: Record<string, any>, map1: Record<string, any>, ignoredKeys: string[] | undefined): string {
        const relevantKeys0 = AbstractItemDiffer.withoutKeys(map0, ignoredKeys);
        const relevantKeys1 = AbstractItemDiffer.withoutKeys(map1, ignoredKeys);

        // compare headers as json maps discarding certain known differences
        const headerDiff0to1 = objectDiff(relevantKeys0, relevantKeys1);
        const headerDiff1to0 = objectDiff(relevantKeys1, relevantKeys0);

        // if differences are found, provide textual diff (shows all
        // differences, even discarded ones, because they may have important context)
        return !(_.isEmpty(headerDiff0to1) && _.isEmpty(headerDiff1to0)) ?
            textdiff(stringifyFlatMap(map0), stringifyFlatMap(map1))
            : "";
    }

    public abstract compareItemPair(item0: Item, item1: Item): ResponseDiff;

}


export class TextualItemDiffer extends AbstractItemDiffer {

    public compareItemPair(item0: Item, item1: Item): ResponseDiff {
        let headerDiff = super.computeMapDiff(item0.response.headers, item1.response.headers, super.ignoredHeadersList);
        if (headerDiff.length > 0) {
            headerDiff = "Headers:\n" + headerDiff;
        }

        const item0Payload = `Body:\n${item0.response.payload}`;
        const item1Payload = `Body:\n${item1.response.payload}`;

        const payloadDiff = textdiff(item0Payload, item1Payload);

        return new ResponseDiff(
            item0,
            item1,
            textdiff(
                `Http-Status: ${item0.response.code}\n`,
                `Http-Status: ${item1.response.code}\n`),
            textdiff(`Rows: ${item0Payload ? item0Payload.trim().split("\n").length - 1 : 0}\n`,
                `Rows: ${item1Payload ? item1Payload.trim().split("\n").length - 1 : 0}\n`),
            headerDiff,
            payloadDiff
        );
    }
}

export class JsonItemDiffer extends AbstractItemDiffer {

    public compareItemPair(item0: Item, item1: Item): ResponseDiff {
        let headerDiff = super.computeMapDiff(item0.response.headers, item1.response.headers, super.ignoredHeadersList);
        if (headerDiff.length > 0) {
            headerDiff = "Headers:\n" + headerDiff;
        }

        const item0Payload = `Body:\n${stringifyJson(JSON.parse(item0.response.payload))}`;
        const item1Payload = `Body:\n${stringifyJson(JSON.parse(item1.response.payload))}`;

        const payloadDiff = textdiff(item0Payload, item1Payload);

        return new ResponseDiff(
            item0,
            item1,
            textdiff(
                `Http-Status: ${item0.response.code}\n`,
                `Http-Status: ${item1.response.code}\n`),
            textdiff(`Rows: ${item0Payload ? item0Payload.trim().split("\n").length - 1 : 0}\n`,
                `Rows: ${item1Payload ? item1Payload.trim().split("\n").length - 1 : 0}\n`),
            headerDiff,
            payloadDiff
        );
    }
}
