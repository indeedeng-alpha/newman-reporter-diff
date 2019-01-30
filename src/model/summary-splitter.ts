import _ = require("lodash");
import newman = require("newman");
import { Item, Request, Response } from "./diff-model";
import { loggerfactory } from "../util/logging";

const log = loggerfactory.getLogger("newman.diff.model.summary-splitter");

function unwrapHeaders(headers: any[]): Record<string, string> {
    return _.reduce(headers, (result: any, headerPair) => {
        result[headerPair.key] = headerPair.value;
        return result;
    }, {});
}

/*
 * provided types like NewmanRunExecution are incomplete, using 'any' instead for now (Future work: define expected types)
 */
export interface NewmanExecutionWithRequestResponse extends newman.NewmanRunExecution {
    request: any;
    response: any;
}

/**
 * splits/reformats a large newman summary object into a list of Item
 * @param execution the summary from newman
 */
export function itemFromExecution(execution: NewmanExecutionWithRequestResponse): Item {

    const item: any = execution.item;
    if (!item) {
        return {} as Item;
    }
    const request = execution.request;
    const response: any | undefined = execution.response;

    const httpCode = response ? response.code : 500;
    const responseHeaders = response ? unwrapHeaders(response.headers.members) : {};
    const rawPayload = response ? String(response.stream) : "";
    log.debug("Raw response" + rawPayload);

    return new Item(
        item.name,
        new Request(item.request.method, request.url.toString(), unwrapHeaders(request.headers.members), item.body),
        new Response(httpCode, responseHeaders, rawPayload)
    );
}
