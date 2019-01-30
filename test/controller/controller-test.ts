import { expect } from "chai";

import rewire = require("rewire");

const controllerRewired = rewire("../../src/controller/controller");
const getNewmanDiffOptionFromVariables = controllerRewired.__get__("getNewmanDiffOptionFromVariables");

function stubVariable(id: string, value: string): any {
    return {
        id,
        value
    };
}

describe("The controller.getNewmanDiffOptionsFromVariables function", () => {
    it("Should handle empty variables", () => {
        expect(getNewmanDiffOptionFromVariables(undefined, "foo"))
            .to.be.empty;
    });
    it("Should handle zero variables", () => {
        expect(getNewmanDiffOptionFromVariables([], "foo"))
            .to.be.empty;
    });

    it("Should handle variables", () => {
        expect(getNewmanDiffOptionFromVariables([
            stubVariable("foo", "bar1"),
            stubVariable("foo2", "bar2"),
            stubVariable("newman-diff:foo", "bar3")
        ], "foo"))
            .to.equal("bar3");
    });
});
