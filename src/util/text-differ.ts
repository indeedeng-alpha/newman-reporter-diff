import { Diff, diff_match_patch } from "diff-match-patch";

export function textdiff(text1: string, text2: string): string {
    const dmp = new diff_match_patch();
    // each unique line becomes a unicode char, to make the diff go fast
    const lineToCharMapper = dmp.diff_linesToChars_(text1, text2);
    const lineText1 = lineToCharMapper.chars1;
    const lineText2 = lineToCharMapper.chars2;
    const patches: Diff[] = dmp.diff_main(lineText1, lineText2, false);
    const lineArray = lineToCharMapper.lineArray;
    // patches now is an Arrays of Diff each representing a textblock that is same, removed or added, with one unicode char per line.
    if (patches.length === 0) {
        return "";
    }
    if (patches.length === 1 && patches[0][0] === 0) {
        return "";
    }
    /*
     * Due to how d-m-p works, beyond 65K unique lines it will reuse same "hashes" for different lines,
     * thus at a low probability miss differences (probably acceptable for us).
     * It will not report false positives, though, so when it reports a diff, we can be sure it is real.
     * However, building the diff string from the char representation will produce arbitrary text at this size, because
     * lineArray has more than 65K lines, but only the first 65K are referenced by the unicode chars in patches.
     */
    if (lineArray.length > 65535) {
        // see https://github.com/google/diff-match-patch/issues/54
        return "Internal error: Diff detected, but too many unique lines, cannot print full diff, only diffing start of files\n"
            + textdiff(text1.substring(0, 10000), text2.substring(0, 10000));
    }
    // create diff from patches
    dmp.diff_charsToLines_(patches, lineArray);
    return patchToPlusMinusText(patches);
}

/**
 * Creates a string containing all lines of both originals prepended with "  ", "+ " or "- "
 */
function patchToPlusMinusText(patches: Diff[]): string {
    const text = [];
    for (let x = 0; x < patches.length; x++) {
        text[x] = patchToPlusMinus(patches[x]);
    }
    return text.join("");
}

/**
 * converts all lines of a single patch to a line prepended with "  ", "+ " or "- "
 * @param patch
 */
function patchToPlusMinus(patch: Diff): string {
    let sep;
    switch (patch[0]) {
        case -1: {
            sep = "- ";
            break;
        }
        case 0: {
            sep = "  ";
            break;
        }
        case 1: {
            sep = "+ ";
            break;
        }
    }
    let lines = patch[1].split("\n");
    if (patch[1].endsWith("\n")) {
        lines = lines.slice(0, -1);
    }
    return sep + lines.join("\n" + sep) + "\n";
}
