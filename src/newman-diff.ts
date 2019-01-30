#!/usr/bin/env node

import program = require("commander");

/**
 * Main CLI tool defines subcommands
 *
 * @param argv system args
 * @Deprecated Use as reporter
 */
function main(argv: string[]) {
    /* for each command, automagically run the script in newman-compare-<command> */
    program
        .version("0.0.1")
        // currently only one command, so subcommands currently useless.
        .command("run", "run a comparison from a folder")
        .parse(process.argv);
}

main(process.argv);
