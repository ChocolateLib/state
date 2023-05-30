export class StateNumberLimits {
    readonly min: number | undefined;
    readonly max: number | undefined;
    readonly step: number | undefined;
    readonly decimals: number | undefined;
    readonly start: number | undefined;
    /**Number limiter struct
     * @param min minimum allowed number
     * @param max maximum allowed number
     * @param step allowed step size for number 0.1 allows 0,0.1,0.2,0.3... 
     * @param start start offset for step, 0.5 and step 2 allows 0.5,2.5,4.5,6.5*/
    constructor(min?: number, max?: number, step?: number, start?: number) {
        if (min !== undefined)
            this.min = min;
        if (max !== undefined)
            this.max = max;
        if (step !== undefined) {
            this.step = step;
            const match = String(step).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
            this.decimals = (match ? Math.max(0, (match[1] ? match[1].length : 0) - (match[2] ? +match[2] : 0)) : 0);
            if (start !== undefined) {
                this.start = start;
                const match = String(start).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
                this.decimals = Math.max(this.decimals, (match ? Math.max(0, (match[1] ? match[1].length : 0) - (match[2] ? +match[2] : 0)) : 0));
            }
        }
    }

    check(value: number): string | undefined {
        if ('max' in this && value > (this.max as number))
            return value + ' is bigger than the limit of ' + this.max;
        if ('min' in this && value < (this.min as number))
            return value + ' is smaller than the limit of ' + this.max;
        return undefined
    }

    limit(value: number): number {
        if (this.step)
            if (this.start)
                value = parseFloat((Math.round((value - this.start + Number.EPSILON) / this.step) * this.step + this.start).toFixed(this.decimals))
            else
                value = parseFloat((Math.round((value + Number.EPSILON) / this.step) * this.step).toFixed(this.decimals))
        return Math.min(this.max ?? Infinity, Math.max(this.min ?? -Infinity, value));
    }
}

export class StateStringLimits {
    readonly maxLength: number | undefined;
    readonly maxByteLength: number | undefined;
    /**String limiter struct
     * @param maxLength max length for string
     * @param maxByteLength max byte length for string*/
    constructor(maxLength?: number, maxByteLength?: number) {
        if (maxLength !== undefined)
            this.maxLength = maxLength;
        if (maxByteLength !== undefined)
            this.maxByteLength = maxByteLength;
    }

    check(value: string): string | undefined {
        if ('maxLength' in this && value.length > <number>this.maxLength)
            return 'the text is longer than the limit of ' + this.maxLength;
        if ('maxByteLength' in this && (new TextEncoder).encode(value).length > <number>this.maxByteLength)
            return 'the text is longer in bytes than the limit of ' + this.maxByteLength;
        return undefined
    }

    limit(value: string): string {
        if (this.maxLength && value.length > this.maxLength)
            value = value.slice(0, this.maxLength);
        if (this.maxByteLength) {
            value = (new TextDecoder).decode((new TextEncoder).encode(value).slice(0, this.maxByteLength));
            if (value.at(-1)?.charCodeAt(0) === 65533)
                value = value.slice(0, -1);
        }
        return value
    }
}

export type StateEnumEntry = {
    name: string,
    description?: string,
    icon?: () => SVGSVGElement,
}

export type StateEnumList = {
    [key: string | number]: StateEnumEntry
}

/**Checks if the given value is in an enum struct */
export const stateCheckEnum = <T extends string | number | symbol>(value: T, enums: StateEnumList): string | undefined => {
    if (value in enums)
        return undefined
    return <string>value + ' is not in list'
}