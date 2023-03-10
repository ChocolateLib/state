import { ThemeEngine } from "./engine";
import { VariableGroup } from "./variables";

export const enum DefaultThemes {
    Light = 'light',
    Dark = 'dark'
}

export let engines: ThemeEngine[] = [];

export let bottomGroups: { [key: string]: VariableGroup } = {};
