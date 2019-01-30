import program = require("commander");
import path = require("path");
import fs = require("fs");
import newman = require("newman");
import { NewmanRunOptions } from "newman";

import { handleNewmanSummary } from "./controller/controller";
import { loggerfactory } from "./util/logging";
import { NewmanDiffReporter } from "./controller/reporter";

const log = loggerfactory.getLogger("newman.reporter.diff.controller");

/**
 * @Deprecated Use as reporter
 */
function prepareNewmanOptions(projectPath: string): NewmanRunOptions {
    const collectionsFolderAbspath = path.join(process.cwd(), projectPath);
    const collection = require(path.join(collectionsFolderAbspath, "collection.json"));
    const iterationData = path.join(collectionsFolderAbspath, "data.csv");

    // for option fields, see newman/lib/index.js
    return {
            collection,
            environment: {},
            iterationData: fs.existsSync(iterationData) ? iterationData : undefined,
            reporters: [
                "cli", // writes to stdout
                // "json", // collects json, configured in reporter. Prone to cause errors for MB-sized responses
            ],
            reporter: {
                // json: {
                //     export: path.join(reportPath, "report.json")
                // }
            }
        } as NewmanRunOptions;
}


/**
 * CLI of the run subcommand
 * @param argv
 * @Deprecated Use as reporter
 */
function main(argv: string[]) {
    program
        .arguments("<path>")
        .description("URL or path to a file or folder containing a Postman Collection.")
        .action((projectPath: string) => {

            newman.run(prepareNewmanOptions(projectPath), (err: Error | null, summary: newman.NewmanRunSummary) => {
                if (err) {
                    throw err;
                }
            }).on("done", (err: Error, summary: any) => {
                const reporter = new NewmanDiffReporter(undefined, summary.collection.variables);
                // would prefer to use onEachItemSet() but have no handle on ignoreHeaderList from collection.json
                handleNewmanSummary(summary, reporter);
            });
        })
        .parse(argv);
}

main(process.argv);
