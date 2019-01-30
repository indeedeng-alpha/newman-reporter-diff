import _ = require("lodash");
import undefinedError = Mocha.utils.undefinedError;

/**
 * Object Diff, return an Object that contains all fields in ob1 that are not in ob2, or different in ob2.
 * @param obj1 base object
 * @param obj2 diff target object
 */
export function objectDiff(obj1: any, obj2: any): Record<string, any> | undefined {
    if (obj2 === undefined) {
        return obj1;
    }
    const diff = _.reduce(obj1, function compareKey(result: any, value: any, key: string) {
        if (_.isPlainObject(value)) {
            const nestedDiff = objectDiff(value, obj2[key]);
            if (!_.isEmpty(nestedDiff)) {
                result[key] = nestedDiff;
            }
        } else if (!_.isEqual(value, obj2[key])) {
            result[key] = value;
        }
        return result;
    }, {});
    if (_.isEmpty(diff)) {
        return undefined;
    }
    return diff;
}
