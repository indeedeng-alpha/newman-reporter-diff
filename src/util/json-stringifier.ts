const stableStringify = require("json-stable-stringify");

/**
 * Pretty-prints Json, and sorts properties by key
 * @param value
 */
export function stringifyJson(value: any): string {
    return stableStringify(value, {
        cmp: (a: any, b: any) => {
            return a.key > b.key ? 1 : -1;
        },
        space: "  "
    });
}
