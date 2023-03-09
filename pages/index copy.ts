import { createState, StateWrite } from "../src";
import { StateSetter } from "../src/shared";

let bottomGroups: { [key: string]: SettingsGroup } = {};

/**Initialises the settings for the package
 * @param packageName use import {name} from ("../package.json")
 * @param name name of group formatted for user reading
 * @param description a description of what the setting group is about*/
export let initSettings = (packageName: string, name: string, description: string) => {
    bottomGroups[packageName] = new SettingsGroup(packageName, name, description);
    return bottomGroups[packageName];
}

interface SettingOptions {
    name: string,
    description: string,
    icon?: () => SVGSVGElement,
}

interface NumberSettingOptions extends SettingOptions {
    min?: number;
    max?: number;
    decimals?: number;
}

interface EnumSettingOptions extends SettingOptions {
    min?: number;
    max?: number;
    decimals?: number;
}

/**Group of settings should never be instantiated manually use initSettings*/
export class SettingsGroup {
    private pathID: string;
    private settings: { [key: string]: StateWrite<boolean> | StateWrite<number> | StateWrite<string> } = {};
    private subGroups: { [key: string]: SettingsGroup } = {};
    readonly name: string;
    readonly description: string;

    constructor(path: string, name: string, description: string) {
        this.pathID = path;
        this.name = name;
        this.description = description;
    }

    /**Makes a settings subgroup for this group
     * @param id unique identifier for this subgroup in the parent group
     * @param name name of group formatted for user reading
     * @param description a description of what the setting group is about formatted for user reading*/
    makeSubGroup(id: string, name: string, description: string) {
        if (id in this.subGroups) {
            console.warn('Sub group already registered ' + id);
            return undefined
        } else {
            return this.subGroups[id] = new SettingsGroup(this.pathID + '/' + id, name, description);
        }
    }

    /**Makes a boolean setting*/
    async makeBooleanSetting(id: string, setter: StateSetter<boolean>, defaultValue: boolean | PromiseLike<boolean>, options: SettingOptions) {
        if (id in this.settings) { throw new Error('Settings already registered ' + id); }
        let saved = localStorage[this.pathID + '/' + id];
        let value = (saved ? JSON.parse(saved) : await defaultValue);
        if (!saved) { localStorage[this.pathID + '/' + id] = String(value); }
        return createState(value, (value) => {
            setter(value);
            localStorage[this.pathID + '/' + id] = String(value);
        }, options);
    }

    /**Makes a number setting*/
    async makeNumberSetting(id: string, setter: StateSetter<number>, defaultValue: number | PromiseLike<number>, options: NumberSettingOptions) {
        if (id in this.settings) { throw new Error('Settings already registered ' + id); }
        let saved = localStorage[this.pathID + '/' + id];
        let value = (saved ? JSON.parse(saved) : await defaultValue);
        if (!saved) { localStorage[this.pathID + '/' + id] = String(value); }
        return createState(value, (value) => {
            setter(value);
            localStorage[this.pathID + '/' + id] = String(value);
        }, options);
    }

    /**Makes a string setting*/
    async makeStringSetting(id: string, setter: StateSetter<string>, defaultValue: string | PromiseLike<string>, options: SettingOptions) {
        if (id in this.settings) { throw new Error('Settings already registered ' + id); }
        let saved = localStorage[this.pathID + '/' + id];
        let value = (saved ? JSON.parse(saved) : await defaultValue);
        if (!saved) { localStorage[this.pathID + '/' + id] = value; }
        return createState(value, (value) => {
            setter(value);
            localStorage[this.pathID + '/' + id] = value;
        }, options);
    }

    /**Makes a enum setting*/
    async makeEnumSetting(id: string, setter: StateSetter<string>, defaultValue: string | PromiseLike<string>, options: SettingOptions) {
        if (id in this.settings) { throw new Error('Settings already registered ' + id); }
        let saved = localStorage[this.pathID + '/' + id];
        let value = (saved ? JSON.parse(saved) : await defaultValue);
        if (!saved) { localStorage[this.pathID + '/' + id] = value; }
        return createState(value, (value) => {
            setter(value);
            localStorage[this.pathID + '/' + id] = value;
        }, options);
    }
}