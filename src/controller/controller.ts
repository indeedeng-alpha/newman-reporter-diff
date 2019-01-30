import newman = require("newman");

import _ = require("lodash");
import EventEmitter = NodeJS.EventEmitter;
import { NewmanDiffReporter } from "./reporter";

import { itemFromExecution, NewmanExecutionWithRequestResponse } from "../model/summary-splitter";
import { Item } from "../model/diff-model";


const NEWMAN_OPTIONS_PREFIX = "newman-diff:";

/**
 * Reads variables from collection.json that are relevant to this reporter.
 */
export function getNewmanDiffOptionFromVariables(idTypeValueList: any[], key: string): any {
    /**
     * Input like [{"id": "newman-diff:ignoredHeadersList", "type": "any", "value": ["Keep-Alive"]}]
     */
    if (_.isEmpty(idTypeValueList)) {
        return "";
    }
    const optionsMap = _.keyBy(idTypeValueList
        .filter(option => option.id.startsWith(NEWMAN_OPTIONS_PREFIX))
        .map(option => {return {
            id: option.id.substring(NEWMAN_OPTIONS_PREFIX.length),
            value: option.value};
        }), "id");
    return (optionsMap[key] && optionsMap[key].value) || "";
}

/**
 * invokes callback on each difference between responses in the iteration, ignoring certain headers for comparison.
 * @param newmanEventEmitter as provided by newman to reporters
 * @param callback
 */
export function onEachItemSet(newmanEventEmitter: EventEmitter, callback: (items: Item[]) => any): void {
    let requestReports: any[] = [];
    // many different events are emitted, see https://github.com/postmanlabs/newman#newmanrunevents
    // collect responses, and after each iteraction, diff requests
    newmanEventEmitter.on("request", (err: Error, requestReport: any) => {
        // log.debug(() => requestReport);
        requestReports.push(requestReport);
    }).on("iteration", (err: Error, iterationReport: any) => {
        if (err) {
            console.error(err);
            throw err;
        }
        try {
            if (requestReports.length !== 2) {
                throw new Error("Comparison of responseset with size " + requestReports.length + " not implemented");
            }
            const items = requestReports.map(execution => itemFromExecution(execution as NewmanExecutionWithRequestResponse));
            callback([items[0], items[1]]);
        } catch (e) {
            console.error(e);
            throw e;
        }

        requestReports = [];

    });
}


/**
 * this deprecated function can be run after newman has run all iterations for all items (and kept all responses in memory).
 * It can best be used to run newman as a library.
 *
 * The main reason this is bad is because if any of 1000 queries fail, this will not be invoked for any.
 *
 * @param summary a full summary of inputs and outputs of the run, as provided by newman.run or the "done" event.
 * @param callback to be run for each detected diff
 * @deprecated: handling diffs at the end is a bad idea for several reasons, better to act after each iteration in the reporter.
 */
export function handleNewmanSummary(summary: newman.NewmanRunSummary, reporter: NewmanDiffReporter) {
    /*
     * raw summary written as javascript objects, contains a log of all inputs, all runs, some stats.
     * Unusable for raw diff, contains irrelevant data and duplicate data from references
     */
    const items = summary.run.executions.map((execution : any) => itemFromExecution(execution as NewmanExecutionWithRequestResponse));

    // Hack: assume report has comparison pairs only (could be implemented using iteration metadata in summary)
    const comparisonSetSize = 2;

    const ignoredHeadersList = getNewmanDiffOptionFromVariables(summary.collection.variables, "ignoredHeadersList");

    for (let i = 0; i < items.length; i += comparisonSetSize) {
        const responseDiff = reporter.computeDiff([items[i], items[i + 1]]);
        reporter.handleResponseDiff(responseDiff);
    }
}
