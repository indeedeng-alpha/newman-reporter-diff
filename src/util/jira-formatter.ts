import { ResponseDiff } from "../model/diff-model";

import { loggerfactory } from "./logging";

import _ = require("lodash");

const log = loggerfactory.getLogger("newman.reporter.diff");

/**
 * returns those lines which are not farther than distance from any index given in indices
 * Would be nicer to produce a real patch
 */
function sliceAroundIndices(lines: string[], indices: number[], distance: number): string[] {
    if (indices.length === 0) {
        return lines.slice(0, distance);
    }
    const result: string[] = [];
    // expecting low number of indices and low distance value, so using simple inefficient algorithm.
    lines.forEach((line, index) => {
        if (indices.filter(i => Math.abs(i - index) < distance).length > 0) {
            result.push(line);
        } else {
            result.push("...");
        }
    });
    return result.reduce((accumulator: string[], next: string) => {
        if (next !== "..." || accumulator.length === 0 || accumulator[accumulator.length - 1] !== "...") {
            accumulator.push(next);
        }
        return accumulator;
    }, [] as string[]);
}


/**
 * For textual diff, only show the lines n-lines away from the 1st diff
 */
export function shorten(difftext: string, distance: number): string {
    const lines = difftext.trim().split("\n");
    const firstPlus = lines.findIndex((value) => {
        return value.startsWith("+");
    });
    const firstMinus = lines.findIndex((value) => {
        return value.startsWith("-");
    });
    const linesReversed = lines.slice().reverse();
    const lastPlusReversed = linesReversed.findIndex((value) => {
        return value.startsWith("+");
    });
    const lastPlus = lastPlusReversed >= 0 ? lines.length - lastPlusReversed : -1;
    const lastMinusReversed = linesReversed.findIndex((value) => {
        return value.startsWith("-");
    });
    const lastMinus = lastMinusReversed >= 0 ? lines.length - lastMinusReversed : -1;

    const sliceIndeces = [firstMinus, firstPlus, lastMinus, lastPlus].filter(x => (x >= 0));
    return sliceAroundIndices(lines, sliceIndeces, distance).join("\n") + "\n";
}

function asJiraCode(body: string) {
    return "\n{code}\n" + body + "{code}\n";
}

function safeDecodeURI(uri: string): string {
    try {
        return decodeURI(uri);
    } catch (e) {
        log.debug(e);
        return uri;
    }
}

/**
 * Create a (relatively) short string of a diff report suitable for inserting into JIRA
 * @param responseDiff
 */
export function toShortJiraTicketString(responseDiff: ResponseDiff): string {
    const decodedUri0 = safeDecodeURI(responseDiff.item0.request.url);
    const decodedUri1 = safeDecodeURI(responseDiff.item1.request.url);
    const diffDistance = 10;

    // if header is different, other differences won't matter
    let msg = "Found relevant differences between\n\n"
        + " * " + responseDiff.item0.name + "\n"
        + "   " + responseDiff.item0.request.method + " [" + decodedUri0 + "]\n"
        + " * " + responseDiff.item1.name + "\n"
        + "   " + responseDiff.item1.request.method + " [" + decodedUri1 + "]\n\n";
    if (!_.isEmpty(responseDiff.statusDiff)) {
        msg += asJiraCode(responseDiff.statusDiff)
            // in case of errors, show error
            + ((responseDiff.item0.response.code >= 400) ? asJiraCode(responseDiff.item0.response.payload) : "")
            + ((responseDiff.item1.response.code >= 400) ? asJiraCode(responseDiff.item1.response.payload) : "");
    } else {
        msg += "Http-Status: " + responseDiff.item0.response.code + "\n"
            + asJiraCode(responseDiff.headerDiff + responseDiff.rowsDiff
                + (_.isEmpty(responseDiff.payloadDiff) ? "" :
                    responseDiff.statusDiff + "\n"
                    + "[Showing sample of differences with " + diffDistance + " lines of context]\n"
                    + shorten(responseDiff.payloadDiff, diffDistance)));
    }
    return msg;
}
