import { StateEnumList, StateNumberLimits, StateStringLimits } from "./types";

/**Checks if the given value is in an enum struct */
export const stateCheckEnum = <T extends string | number | symbol>(value: T, enums: StateEnumList): string | undefined => {
    if (value in enums) {
        return undefined
    }
    return <string>value + ' is not in list'
}

/**Checks if the given value withing number limits */
export const stateCheckNumber = (value: number, limits: StateNumberLimits): string | undefined => {
    if ('max' in limits && value > <number>limits.max) {
        return value + ' is bigger than the limit of ' + limits.max;
    }
    if ('min' in limits && value < <number>limits.max) {
        return value + ' is smaller than the limit of ' + limits.max;
    }
    return undefined
}

/**Limits given value to number limits*/
export const stateLimitNumber = (value: number, limits: StateNumberLimits): number => {
    if (limits.step) {
        if (limits.step.start) {
            value = (Math.round((value - limits.step.start) / limits.step.size)) * limits.step.size + limits.step.start;
        } else {
            value = (Math.round(value / limits.step.size)) * limits.step.size;
        }
    }
    return Math.min(limits.max ?? Infinity, Math.max(limits.min ?? -Infinity, value));
}

/**Checks if the given value withing string limits */
export const stateCheckString = (value: string, limits: StateStringLimits): string | undefined => {
    if ('maxLength' in limits && value.length > <number>limits.maxLength) {
        return 'the text is longer than the limit of ' + limits.maxLength;
    }
    if ('maxByteLength' in limits && (new TextEncoder).encode(value).length > <number>limits.maxByteLength) {
        return 'the text is longer in bytes than the limit of ' + limits.maxByteLength;
    }
    return undefined
}

/**Limits given value to string limits*/
export const stateLimitString = (value: string, limits: StateStringLimits): string => {
    if (limits.maxLength && value.length > limits.maxLength) {
        value = value.slice(0, limits.maxLength);
    }
    if (limits.maxByteLength) {
        value = (new TextDecoder).decode((new TextEncoder).encode(value).slice(0, limits.maxByteLength));
        if (value.at(-1)?.charCodeAt(0) === 65533) {
            value = value.slice(0, -1);
        }
    }
    return value
}