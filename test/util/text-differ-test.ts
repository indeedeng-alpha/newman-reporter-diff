import { expect } from "chai";
import { textdiff } from "../../src/util/text-differ";


describe("The text-differ.textDiff function", () => {
    it("should not find differences in same strings", () => {
        expect(textdiff("", "")).to.be.empty;
        expect(textdiff("a", "a")).to.be.empty;
        expect(textdiff("a\nb", "a\nb")).to.be.empty;
    });

    it("should find differences in different strings", () => {
        expect(textdiff("a", "b")).to.equal("- a\n+ b\n");
        expect(textdiff("a\n", "b\n")).to.equal("- a\n+ b\n");
        expect(textdiff("a\na\n", "a\nb\na\n")).to.equal("  a\n+ b\n  a\n");
        expect(textdiff("a\nc\na\n", "a\nb\na\n")).to.equal("  a\n- c\n+ b\n  a\n");
    });
});
