import { StateWrite, StateSetter } from "../../src";

let bottomGroups: { [key: string]: SettingsGroup } = {};

/**Initialises the settings for the package
 * @param packageName use import {name} from ("../package.json")
 * @param name name of group formatted for user reading
 * @param description a description of what the setting group is about*/
export let initSettings = (packageName: string, name: string, description: string) => {
    bottomGroups[packageName] = new SettingsGroup(packageName, name, description);
    return bottomGroups[packageName];
}

/**Group of settings should never be instantiated manually use initSettings*/
export class SettingsGroup {
    private pathID: string;
    private settings: { [key: string]: StateWrite<any> } = {};
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

    /**Adds a state to the settings */
    addState<T>(id: string, state: StateWrite<T>, setter: StateSetter<T>) {
        if (id in this.settings) { throw new Error('Settings already registered ' + id); }
        let saved = localStorage[this.pathID + '/' + id];
        if (saved) {
            setter(<T>JSON.parse(saved))
        }
        state.subscribe((value) => { localStorage[this.pathID + '/' + id] = String(value); })
        this.settings[id] = state;
    }
}