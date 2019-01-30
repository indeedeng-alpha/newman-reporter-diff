import { expect } from "chai";
import { itemFromExecution, NewmanExecutionWithRequestResponse } from "../../src/model/summary-splitter";
import { NewmanRunExecution, NewmanRunExecutionItem, NewmanRunSummary } from "newman";

function stubExecution(name: string, method: string, response: any): any {
    return {
        item: {
            name,
            request: {
                method,
            },
            response: {}
        },
        assertions: [],
        request: {
            url: "http://" + name,
            headers: {
                members: [{
                    key: "Accept",
                    value: "anything"
                }]
            }
        },
        response
    };
}

describe("The summary-splitter.itemFromExecution function", () => {
    it("should work with empty summary", () => {
        expect(itemFromExecution({} as NewmanExecutionWithRequestResponse)).to.be.empty;
    });

    it("should work when response is missing", () => {
        const stubExecution1 = stubExecution("item1", "GET", undefined);
        expect(itemFromExecution(stubExecution1)).to.be.deep.equal({
            name: stubExecution1.item.name,
            request: {
                body: undefined,
                headers: {Accept: "anything"},
                method: stubExecution1.item.request.method,
                url: stubExecution1.request.url
            },
            response: {
                code: 500,
                headers: {},
                payload: ""
            }
        });
    });

    it("should itemFromExecution summary responses into items", () => {
        const stubExecution1 = stubExecution(
            "item1",
            "GET",
            {
                headers: {
                    members: [{
                        key: "Content-Type",
                        value: "text/plain"
                    }]
                },
                stream: "Hello content",
                code: 200
            });
        expect(itemFromExecution(stubExecution1)).to.be.deep.equal({
            name: stubExecution1.item.name,
            request: {
                body: undefined,
                headers: {Accept: "anything"},
                method: stubExecution1.item.request.method,
                url: stubExecution1.request.url
            },
            response: {
                code: 200,
                headers: {
                    "Content-Type": "text/plain"
                },
                payload: "Hello content"
            }
        });
    });
});
