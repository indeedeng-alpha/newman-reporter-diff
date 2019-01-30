import { expect } from "chai";
import { objectDiff } from "../../src/util/object-differ";


describe("The object-differ.objectDiff function", () => {
    it("should not find differences in similar objects", () => {
        expect(objectDiff([], [])).to.be.undefined;
        expect(objectDiff({}, [])).to.be.undefined;
        expect(objectDiff(undefined, [])).to.be.undefined;
        expect(objectDiff({}, {})).to.be.undefined;

        expect(objectDiff(["a"], ["a"])).to.be.undefined;
        expect(objectDiff([1], [1])).to.be.undefined;
        expect(objectDiff({a: 1}, {a: 1})).to.be.undefined;
        expect(objectDiff({a: 1, b: 2}, {b: 2, a: 1})).to.be.undefined;
    });

    it("should return positive differences a -> b", () => {
        expect(objectDiff([1], [])).to.have.deep.property("0", 1);
        expect(objectDiff({a: 2}, [])).to.have.deep.property("a", 2);
        // only positive differences returned
        expect(objectDiff(undefined, [1])).to.be.undefined;
        expect(objectDiff({A: 1}, {B: 1})).to.have.deep.property("A", 1);
        expect(objectDiff({A: 1}, {A: 2})).to.have.deep.property("A", 1);

        // for arrays, uses index to mark location of difference
        expect(objectDiff(["a"], ["b"])).to.have.deep.property("0", "a");
        expect(objectDiff([1], [2])).to.have.deep.property("0", 1);
        expect(objectDiff([1, 2], [2, 1])).to.have.deep.property("0", 1);
        expect(objectDiff([1, 2], [1, 3])).to.have.deep.property("1", 2);
    });
});
