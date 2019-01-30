import { NewmanDiffReporter, registerToReporterEvents } from "./controller/reporter";



/**
 * Entry point into the newman reporter.
 * This is automatically run by starting newman with the -r diff option.
 *
 * @param newmanEventEmitter provided by newman to reporters.
 * @param reporterOptions : options passed to newman for reporters via --reporter-diff-<name> <value>
 * @param collectionRunOptions
 */
// tslint:disable
// The module.export must be exported like this for newman to successfully load the reporter.
module.exports = function(newmanEventEmitter: any, reporterOptions: any, collectionRunOptions: any) {
    return registerToReporterEvents(
        newmanEventEmitter,
        reporterOptions,
        collectionRunOptions,
        new NewmanDiffReporter(reporterOptions, collectionRunOptions));
};
