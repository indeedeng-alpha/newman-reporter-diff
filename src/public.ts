import { NewmanDiffReporter, registerToReporterEvents } from "./controller/reporter";
import { Item, Request, Response, ResponseDiff } from "./model/diff-model";
import { AbstractItemDiffer } from "./util/response-differ";
import { textdiff } from "./util/text-differ";
import { writeFiles } from "./diff-writer";

/**
 * Public API to use newman-reporter-diff as a library.
 * Defined here because in index.ts, we have to module.export a single function for newman to call.
 *
 * Usage: import { registerToReporterEvents } from "newman-reporter-diff/dist/public";
 */

export { NewmanDiffReporter, registerToReporterEvents };
export { Item, Request, Response, ResponseDiff };
export { AbstractItemDiffer };
export { textdiff };
export { writeFiles };
