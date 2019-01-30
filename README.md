# newman-reporter-diff

This repository contains a tool to do a comparison of HTTP responses (including status, header and body differences).
It is written as a plugin to the open-source [newman](https://github.com/postmanlabs/newman) tool.

About newman, see [newman](https://www.getpostman.com/docs/v6/postman/collection_runs/command_line_integration_with_newman)

---

**This project is not maintained, use it by forking and extending it.**

---

## Example

Running:

    NODE_PATH=..:./node_modules npm run newman -- run samples/postman-echo-collection.json -r diff

yields:

    INFO [newman.reporter.diff] Found relevant differences between

     * Sample GET
       GET [https://postman-echo.com/get?foo1=bar1&foo2=bar2]
     * Sample GET2
       GET [https://postman-echo.com/get?foo1=bar1&foo2=bar5]

    Http-Status: 200

    {code}
    Headers:
    - * Content-Length: "207"
    + * Content-Length: "298"

    - Rows: 16
    + Rows: 17

    Body:
      {
        "args": {
          "foo1": "bar1",
    -     "foo2": "bar2"
    +     "foo2": "bar5"
        },
    ...
    }
    {code}


## Prerequisites

Install [npm](https://www.npmjs.com) (or [yarn](https://yarnpkg.com/lang/en/docs/install/#debian-stable), all npm commands have yarn equivalents).
In the project folder, run

    npm install

## Building

    # this creates the dist folder with the files newman will look for
    npm run build

## Running

Run without publishing

    NODE_PATH=..:./node_modules npm run newman -- run samples/github-collection.json -r diff

Run newman directly (for experimentation)

    npx newman run collection.json -e environment.json

## Testing / QA

    npm test
    npm run lint

## The collection.json format

The [Postman/newman json schema](https://schema.getpostman.com/json/collection/v2.0.0/docs/index.html) is very flexible.
In many places, both structured information and a simple String can be used, and useful defaults are used in case of missing values:


    "request": {
        "url": "https://postman-echo.com/get?foo1={{valueFromCSV}}",
    },

    "request": {
        "method": "GET",
        "header": [],
        "url": {
            "protocol": "https",
            "host": "postman-echo.com",
            "path": "get",
            "query": "q={{query}}"
        }
    }

Postman allows to use ```{{}}``` placeholders to insert variables from different resolution scopes (global, collection, environment, data, local).

## How to use this repository

Likely usage patterns are:

* Run the plugin as is.
* Checkout the plugin source, extend the code, run.
* Copy the repository, rename it to something like newman-reporter-mydiffy and run using newman -r mydiffy
* Create a new repository extending this repository to add features.

Depending on this repository without chaning the source can be done by subclassing Reporter and AbstractItemDiffer, then overwrite methods.
For that, create a project with an index.js/ts like this:

    // The module.export must be exported like this for newman to successfully load the reporter.
    module.exports = function(newmanEventEmitter: any, reporterOptions: any, collectionRunOptions: any) {
        return registerToReporterEvents(
            newmanEventEmitter,
            reporterOptions,
            collectionRunOptions,
            // using custom reporter
            new MyDiffyReporter(reporterOptions, collectionRunOptions));
    };

## How the response diffing works

### As a newman reporter

This assumes that newman is invoked with a collection.json file having 2 requests to be compared, and optionally an iteration-data file (CSV or json), defining multiple iterations (queries). 

1. When newman is run with names listed in ```--reporters diff```, newman tries to load npm module called newman-reporter-diff.
2. Newman then calls the reporters main function with an event emitter and configuration data, allowing the reporter to subscribe to newman process events (For list of events see https://github.com/postmanlabs/newman).
3. The newman-reporter-diff plugin reads collection variables provided via newman (e.g. from collection.json).
4. The newman-reporter-diff plugin reads reporter variables provided via the command line `--reporter-{reportername}-{variable}`.
5. The newman-reporter-diff plugin registers to the "request" event and stores the response for each request.
6. The newman-reporter-diff plugin registers to the "iteration" event (after running all requests with one row of iteration data) event and stores then compares all requests collected in this iteration.
   1. The plugin computes a ResponseDiff object that compares headers, status, payload
   2. The plugin writes a short summary to stdout
   3. The plugin writes diff files to a timestamped folder

### As newman wrapper

It is also possible to use the deprecated wrapper for newman instead of the newman plugin.
That makes debugging easier, and allows to define own CLI options, at the cost of having to pass-through newman options.
It wraps the newman cli to execute special Postman collections and compare the responses.

    ts-node --max_old_space_size=8192 src/newman-diff.ts

However currently the wrapper is marked as deprecated because it is less flexible to use than the reporter.

# License

[Apache License Version 2.0](LICENSE)
