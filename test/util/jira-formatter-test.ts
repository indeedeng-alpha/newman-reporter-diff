import { expect } from "chai";
import { shorten, toShortJiraTicketString } from "../../src/util/jira-formatter";
import { Item, ResponseDiff } from "../../src/model/diff-model";




describe("The jira-formatter.shorten function", () => {
    it("should handle empty input", () => {
        expect(shorten("", 2)).to.equal("\n");
    });
    it("should handle nodiff input", () => {
        expect(shorten("Hello", 2)).to.equal("Hello\n");
    });
    it("should handle plusonly input", () => {
        expect(shorten("+  Hello", 2)).to.equal("+  Hello\n");
    });
    it("should handle minusonly input", () => {
        expect(shorten("-  Hello", 2)).to.equal("-  Hello\n");
    });
    it("should handle long input", () => {
        const numbers0To100 = Array.from(Array(100).keys());
        const diff = numbers0To100.join("\n  ") + "\n-  "
            + numbers0To100.join("\n-  ") + "\n+  "
            + numbers0To100.join("\n+  ") + "\n";
        expect(shorten(diff, 3)).to.equal(
             "...\n"
            + "  98\n  99\n-  0\n-  1\n-  2\n"
            + "...\n"
            + "-  98\n-  99\n+  0\n+  1\n+  2\n"
            + "...\n"
            + "+  98\n+  99\n"
        );
    });
});

describe("The jira-formatter.toShortJiraTicketString differ function", () => {
    it("should shorten the diff", () => {
        const result = toShortJiraTicketString({
            item0: {
                name: "item0",
                request: {
                    method: "GET",
                    url: "url1",
                },
                response: {
                    code: 200
                }
            } as Item,
            item1: {
                name: "item1",
                request: {
                    method: "GET",
                    url: "url2",
                },
                response: {
                    code: 200
                }
            } as Item,
            statusDiff: "",
            rowsDiff: "",
            headerDiff: "",
            payloadDiff: "-  foo"
        } as ResponseDiff);
        expect(result).to.contain("GET [url1]");
        expect(result).to.contain("GET [url2]");
        expect(result).to.contain("-  foo\n{code}\n");
    });
});
