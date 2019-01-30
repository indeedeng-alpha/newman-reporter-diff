import * as moment from "moment";
import { loggerfactory } from "./util/logging";
import fs = require("fs");
import path = require("path");

const log = loggerfactory.getLogger("newman.diff.controller");

function mkdirSyncIgnoreExist(dirPath: string) {
    try {
        fs.mkdirSync(dirPath);
    } catch (err) {
        if (err.code !== "EEXIST") throw err;
    }
}

let folderCount = 0;

/**
 * Output of the diff reporter.
 * @param projectPath where to write output files
 * @param filesMap maps filenames to contents
 */
export function writeFiles(projectPath: string, filesMap: Record<string, string>) {
    mkdirSyncIgnoreExist(projectPath);

    const reportFoldername = path.join(projectPath, folderCount++  + "_" + moment(new Date()).format("YYYYMMDDThhmmssSSS"));
    log.info("Writing report to " + reportFoldername);

    fs.mkdirSync(reportFoldername);

    for (const filename in filesMap) {
        const payload = filesMap[filename];
        fs.writeFile(path.join(reportFoldername, filename), payload, (err) => {
            if (err) {
                console.error(err);
            }
        });
    }
}
