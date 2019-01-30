import { expect } from "chai";
import { stringifyJson } from "../../src/util/json-stringifier";


describe("The json-stringifier.stringifyJson function", () => {
    it("should make a sorted String", () => {
        expect(stringifyJson({b: 1, a: 2})).to.equal(
            `{
  "a": 2,
  "b": 1
}`
        );
    });
    it("should make a sorted String of 4", () => {
        expect(stringifyJson({b: 1, a: 2, d: 3, c: 4})).to.equal(
            `{
  "a": 2,
  "b": 1,
  "c": 4,
  "d": 3
}`
        );
    });
    it("should sorted nested", () => {
        expect(stringifyJson({y: {a: 2, b: 1}, x: {a: 2, b: 1}})).to.equal(
            `{
  "x": {
    "a": 2,
    "b": 1
  },
  "y": {
    "a": 2,
    "b": 1
  }
}`
        );
    });

});
