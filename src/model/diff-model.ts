import _ = require("lodash");

export class Request {
    url: string;
    method: string; // http method
    headers: Record<string, string>;
    body: string; // untested yet
    constructor(method: string, url: string, headers: Record<string, string>, body: string) {
        this.method = method;
        this.url = url;
        this.headers = headers;
        this.body = body;
    }
}

export class Response {
    code: number;
    headers: Record<string, string>;
    // not sure yet about type of payload, string may work for all relevant cases...
    payload: any;
    constructor(code: number, headers: Record<string, string>, payload: any) {
        this.code = code;
        this.headers = headers;
        this.payload = payload;
    }
}

/**
 * Equivalent of a newman item for a single request/response
 */
export class Item {
    name: string;
    request: Request;
    response: Response;
    constructor(name: string, request: Request, response: Response) {
        this.name = name;
        this.request = request;
        this.response = response;
    }
}

export class ResponseDiff {
    item0: Item;
    item1: Item;
    statusDiff: string;
    rowsDiff: string;
    headerDiff: string;
    /**
     * A textual diff of the payloads. May be broken if too many unique lines are involved.
     */
    payloadDiff: string;

    constructor(item0: Item, item1: Item, statusDiff: string, rowsDiff: string, headerDiff: string, payloadDiff: string) {
        this.item0 = item0;
        this.item1 = item1;
        this.statusDiff = statusDiff;
        this.rowsDiff = rowsDiff;
        this.headerDiff = headerDiff;
        this.payloadDiff = payloadDiff;
    }

    public wasFailure(): boolean {
        return _.isEmpty(this.statusDiff) && this.item0.response.code >= 400;
    }

    public hasDifferences(): boolean {
        return !(_.isEmpty(this.statusDiff) && _.isEmpty(this.headerDiff) && _.isEmpty(this.payloadDiff));
    }

    public toString(): string {
        return (this.statusDiff || "")
            + (this.headerDiff  || "")
            + (this.payloadDiff  || "");
    }
}
