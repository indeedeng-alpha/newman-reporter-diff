import { expect } from "chai";
import { TextualItemDiffer } from "../../src/util/response-differ";
import { Item, Response } from "../../src/model/diff-model";
import rewire = require("rewire");

const responseDifferRewired = rewire("../../src/util/response-differ");
const stringifyFlatMap = responseDifferRewired.__get__("stringifyFlatMap");

describe("The response-differ.stringifyFlatMap function", () => {
    it("Should handle no headers", () => {
        expect(stringifyFlatMap(undefined))
            .to.equal("");
    });
    it("Should handle zero headers", () => {
        expect(stringifyFlatMap({}))
            .to.equal("");
    });
    it("Should render headers", () => {
        expect(stringifyFlatMap(
            {"Content-Type": "text/plain"}))
            .to.equal("* Content-Type: \"text/plain\"\n");
    });
});


function stubItem(name: string, response: Response) {
    return {
        name,
        request: {
            url: "http://name",
            method: "GET",
            headers: {named: name},
            body: ""
        },
        response
    } as Item;
}

describe("The response-differ.TextualItemDiffer.compareItemPair function", () => {
    it("should not find differences in empty items", () => {
        const resultDiff = new TextualItemDiffer([]).compareItemPair(
            stubItem("name1", {} as Response),
            stubItem("name2", {} as Response));
        expect(resultDiff.hasDifferences()).to.be.false;
    });

    it("should work with null ignorelist", () => {
        const resultDiff = new TextualItemDiffer(undefined).compareItemPair(
            stubItem("name1", {} as Response),
            stubItem("name2", {} as Response));
        expect(resultDiff.hasDifferences()).to.be.false;
    });

    it("should find differences when status codes don't match", () => {
        const resultDiff = new TextualItemDiffer([]).compareItemPair(
            stubItem("name1", {
                code: 200,
                headers: {},
                payload: "payload"
            } as Response),
            stubItem("name2", {
                code: 500,
                headers: {},
                payload: "payload"
            } as Response));
        expect(resultDiff.hasDifferences()).to.be.true;
        expect(resultDiff.statusDiff).to.equal(
            "- Http-Status: 200\n"
            + "+ Http-Status: 500\n");
    });

    it("should find differences when headers don't match", () => {
        const resultDiff = new TextualItemDiffer([]).compareItemPair(
            stubItem("name1", {
                code: 200,
                headers: {"Content-Type": "foo"},
                payload: "payload"
            } as Response),
            stubItem("name2", {
                code: 200,
                headers: {},
                payload: "payload"
            } as Response));
        expect(resultDiff.hasDifferences()).to.be.true;
        expect(resultDiff.headerDiff).to.equal(
            "Headers:\n"
             + "- * Content-Type: \"foo\"\n");
    });

    it("should not find differences when ignored headers don't match", () => {
        const resultDiff = new TextualItemDiffer(["Content-Type"]).compareItemPair(
            stubItem("name1", {
                code: 200,
                headers: {"Content-Type": "foo"},
                payload: "payload"
            } as Response),
            stubItem("name2", {
                code: 200,
                headers: {"Content-Type": "bar"},
                payload: "payload"
            } as Response));
        expect(resultDiff.headerDiff).to.be.empty;
        expect(resultDiff.hasDifferences()).to.be.false;
    });

    it("should find differences when payloads don't match", () => {
        const resultDiff = new TextualItemDiffer([]).compareItemPair(
            stubItem("name1", {
                code: 200,
                headers: {"Content-Type": "foo"},
                payload: "payload"
            } as Response),
            stubItem("name2", {
                code: 200,
                headers: {"Content-Type": "foo"},
                payload: "payload2"
            } as Response));
        expect(resultDiff.hasDifferences()).to.be.true;
        expect(resultDiff.payloadDiff).to.equal(
            "  Body:\n"
            + "- payload\n"
            + "+ payload2\n"
        );
    });

});
