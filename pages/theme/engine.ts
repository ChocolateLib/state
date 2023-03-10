
import { initSettings } from "../settings"
import { DocumentHandler } from "../document";
import { createStateNumber, State, StateEnumList, StateEnumOptions, StateNumberOptions } from "../../src";
import { bottomGroups, DefaultThemes, engines } from "./shared";
import { EListener } from "../events";
import { material_hardware_mouse_rounded, material_image_edit_rounded, material_action_touch_app_rounded, material_device_light_mode_rounded, material_device_dark_mode_rounded } from "@chocolatelibui/icons";
import { createStateEnum } from "../../src/state";

let settings = initSettings("@chocolatelibui/theme", 'Theme/UI', 'Settings for UI elements and and color themes');

export const enum ScrollbarMode {
    THIN = 'thin',
    MEDIUM = 'medium',
    WIDE = 'wide',
}

let scrollbarMode = {
    [ScrollbarMode.THIN]: { name: 'Thin', description: "Thin modern scrollbar" },
    [ScrollbarMode.MEDIUM]: { name: 'Medium', description: "Normal scrollbar" },
    [ScrollbarMode.WIDE]: { name: 'Wide', description: "Large touch friendly scrollbar" },
}

export const enum AnimationMode {
    ALL = 'all',
    MOST = 'most',
    SOME = 'some',
    NONE = 'none',
}

let animationMode = {
    [AnimationMode.ALL]: { name: 'All', description: "All animations" },
    [AnimationMode.MOST]: { name: 'Most', description: "All but the heaviest animations" },
    [AnimationMode.SOME]: { name: 'Some', description: "Only the lightest animations" },
    [AnimationMode.NONE]: { name: 'None', description: "No animations" },
}

export const enum AutoThemeMode {
    Off = 'off',
    OS = 'os',
}

let autoThemeMode = {
    [AutoThemeMode.Off]: { name: 'Off', description: "Mouse input" },
    [AutoThemeMode.OS]: { name: 'OS Linked', description: "Pen input" },
}
let themes = {
    [DefaultThemes.Light]: { name: 'Light', description: "Don't set touch mode automatically", icon: material_device_light_mode_rounded },
    [DefaultThemes.Dark]: { name: 'Dark', description: "Change touch mode on first ui interaction", icon: material_device_dark_mode_rounded },
}

export const enum InputMode {
    MOUSE = 'mouse',
    PEN = 'pen',
    TOUCH = 'touch'
}
let inputMode = {
    [InputMode.MOUSE]: { name: 'Mouse', description: "Mouse input", icon: material_hardware_mouse_rounded },
    [InputMode.PEN]: { name: 'Pen', description: "Pen input", icon: material_image_edit_rounded },
    [InputMode.TOUCH]: { name: 'Touch', description: "Touch input", icon: material_action_touch_app_rounded }
}

export const enum AutoInputMode {
    OFF = 'off',
    FIRST = 'first',
    EVERY = 'every'
}
let autoInputMode = {
    [AutoInputMode.OFF]: { name: 'Off', description: "Don't set touch mode automatically" },
    [AutoInputMode.FIRST]: { name: 'First Interaction', description: "Change touch mode on first ui interaction" },
    [AutoInputMode.EVERY]: { name: 'Every Interaction', description: "Change touch mode on every ui interaction" }
}

export class ThemeEngine {
    /**Reference to document handler*/
    private _handler: DocumentHandler;
    private _listener: EListener<"added", DocumentHandler, Document>;

    readonly scrollbar: State<ScrollbarMode, StateEnumOptions<typeof scrollbarMode>>;

    readonly animations: State<AnimationMode, StateEnumOptions<typeof animationMode>>;

    readonly theme: State<string, StateEnumOptions<typeof themes>>;
    readonly autoThemeMode: State<AutoThemeMode, StateEnumOptions<typeof autoThemeMode>>;

    readonly scale: State<number, StateNumberOptions>;
    private _scale: number;
    readonly scaleMouse: State<number, StateNumberOptions>;
    readonly scalePen: State<number, StateNumberOptions>;
    readonly scaleTouch: State<number, StateNumberOptions>;
    readonly inputMode: State<InputMode, StateEnumOptions<typeof inputMode>>;
    readonly autoInputMode: State<AutoInputMode, StateEnumOptions<typeof autoInputMode>>;
    private _autoInputListenerEvery = (event: PointerEvent) => {
        switch (event.pointerType) {
            case 'mouse': this.inputMode.set(InputMode.MOUSE); break;
            case 'pen': this.inputMode.set(InputMode.PEN); break;
            default:
            case 'touch': this.inputMode.set(InputMode.TOUCH); break;
        }
    }

    readonly textScale: State<number, StateNumberOptions>;
    readonly textScaleMouse: State<number, StateNumberOptions>;
    readonly textScalePen: State<number, StateNumberOptions>;
    readonly textScaleTouch: State<number, StateNumberOptions>;

    constructor(documentHandler: DocumentHandler, namespace: string = '', name: string = '', description: string = '') {
        let localSettings = (namespace ? settings.makeSubGroup(namespace + '-', name, description) : settings);
        if (!localSettings) {
            throw new Error('Creating settings group for theme engine failed');
        }

        let { state: scrollbarState, set: scrollbarSet } = createStateEnum(ScrollbarMode.THIN, (value) => {
            this.applyScrollbar(value);
            scrollbarSet(value)
        }, { name: 'Scrollbar', description: 'Size of scrollbar', enums: scrollbarMode });
        this.scrollbar = scrollbarState;
        localSettings.addState('scrollbar', scrollbarState, scrollbarSet);

        let { state: animationsState, set: animationsSet } = createStateEnum(AnimationMode.ALL, (value) => {
            this.applyAnimation(value);
            animationsSet(value)
        }, { name: 'Animations', description: 'Amount of animations in the ui', enums: animationMode });
        this.animations = animationsState;
        localSettings.addState('animations', animationsState, animationsSet);

        let { state: themeState, set: themeSet } = createStateEnum((window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? <string>DefaultThemes.Dark : <string>DefaultThemes.Light), (value) => {
            this.applyTheme(value);
            themeSet(value)
        }, { name: 'Theme', description: 'Color theme of UI', enums: themes });
        this.theme = themeState;
        localSettings.addState('theme', themeState, themeSet);

        let { state: autoThemeModeState, set: autoThemeModeSet } = createStateEnum(AutoThemeMode.OS, (value) => {
            this.applyTheme(value);
            autoThemeModeSet(value)
        }, { name: 'Automatic Theme Change', description: 'Toggle for automatically changing theme', enums: autoThemeMode });
        this.autoThemeMode = autoThemeModeState;
        localSettings.addState('autoTheme', autoThemeModeState, autoThemeModeSet);

        let { state: inputModeState, set: inputModeSet } = createStateEnum(InputMode.MOUSE, async (value) => {
            switch (value) {
                case InputMode.MOUSE: this.scale.set(await this.scaleMouse); break;
                case InputMode.PEN: this.scale.set(await this.scalePen); break;
                case InputMode.TOUCH: this.scale.set(await this.scaleTouch); break;
            }
            this.applyInput(value);
            inputModeSet(value)
        }, { name: 'Automatic Theme Change', description: 'Toggle for automatically changing theme', enums: inputMode });
        this.inputMode = inputModeState;
        localSettings.addState('inputMode', inputModeState, inputModeSet);

        let { state: autoInputModeState, set: autoInputModeSet } = createStateEnum(AutoInputMode.EVERY, (value) => {
            this.applyAutoInput(value);
            autoInputModeSet(value)
        }, { name: 'Automatic Touch Mode', description: 'Mode for automatically changing touch mode', enums: autoInputMode });
        this.autoInputMode = autoInputModeState;
        localSettings.addState('autoTouch', autoInputModeState, autoInputModeSet);

        let { state: scaleState, set: scaleSet } = createStateNumber(1, async (value) => {
            this._scale = value * 16;
            this.applyScale(value);
            switch (await this.inputMode) {
                case InputMode.MOUSE: this.scaleMouse.set(value); break;
                case InputMode.PEN: this.scalePen.set(value); break;
                case InputMode.TOUCH: this.scaleTouch.set(value); break;
            }
            scaleSet(value);
        }, { min: 0.5, max: 4, decimals: 1 });
        this.scale = scaleState

        let { state: scaleMouseState, set: scaleMouseSet } = createStateNumber(1, async (value) => {
            if (await this.inputMode === InputMode.MOUSE) { textScaleSet(value); }
            scaleMouseSet(value);
        }, { name: 'UI Scale Mouse', description: 'The scale of the UI for mouse usage', min: 0.5, max: 4, decimals: 1, step: { size: 0.1 } });
        this.scaleMouse = scaleMouseState
        localSettings.addState('scaleMouse', this.scaleMouse, scaleMouseSet);

        let { state: scalePenState, set: scalePenSet } = createStateNumber(1, async (value) => {
            if (await this.inputMode === InputMode.PEN) { textScaleSet(value); }
            scalePenSet(value);
        }, { name: 'UI Scale Pen', description: 'The scale of the UI for pen usage', min: 0.5, max: 4, decimals: 1, step: { size: 0.1 } });
        this.scalePen = scalePenState
        localSettings.addState('scalePen', this.scalePen, scalePenSet);

        let { state: scaleTouchState, set: scaleTouchSet } = createStateNumber(1, async (value) => {
            if (await this.inputMode === InputMode.MOUSE) { textScaleSet(value); }
            scaleTouchSet(value);
        }, { name: 'UI Scale Touch', description: 'The scale of the UI for touch usage', min: 0.5, max: 4, decimals: 1, step: { size: 0.1 } });
        this.scaleTouch = scaleTouchState
        localSettings.addState('scaleTouch', this.scaleTouch, scaleTouchSet);


        let { state: textScaleState, set: textScaleSet } = createStateNumber(1, async (value) => {
            this.applyTextScale(value);
            switch (await this.inputMode) {
                case InputMode.MOUSE: textScaleMouseSet(value); break;
                case InputMode.PEN: textScalePenSet(value); break;
                case InputMode.TOUCH: textScaleTouchSet(value); break;
            }
            textScaleSet(value);
        }, { min: 0.5, max: 4, decimals: 1 });
        this.textScale = textScaleState;
        let { state: textScaleMouseState, set: textScaleMouseSet } = createStateNumber(1, async (value) => {
            if (await this.inputMode === InputMode.MOUSE) { textScaleSet(value); }
            textScaleMouseSet(value);
        }, { name: 'UI Text Scale Mouse Mode', description: 'The scale of the UI text for mouse usage', min: 0.5, max: 2, decimals: 1, step: { size: 0.1 } });
        this.textScaleMouse = textScaleMouseState
        localSettings.addState('textScaleMouse', this.textScaleMouse, textScaleMouseSet);

        let { state: textScalePenState, set: textScalePenSet } = createStateNumber(1, async (value) => {
            if (await this.inputMode === InputMode.PEN) { textScaleSet(value); }
            textScalePenSet(value);
        }, { name: 'UI Text Scale Pen Mode', description: 'The scale of the UI text for pen usage', min: 0.5, max: 2, decimals: 1, step: { size: 0.1 } });
        this.textScalePen = textScalePenState
        localSettings.addState('textScalePen', this.textScalePen, textScalePenSet);

        let { state: textScaleTouchState, set: textScaleTouchSet } = createStateNumber(1, async (value) => {
            if (await this.inputMode === InputMode.TOUCH) { textScaleSet(value); }
            textScaleTouchSet(value);
        }, { name: 'UI Text Scale Touch Mode', description: 'The scale of the UI text for touch usage', min: 0.5, max: 2, decimals: 1, step: { size: 0.1 } });
        this.textScaleTouch = textScaleTouchState
        localSettings.addState('textScaleTouch', this.textScaleTouch, textScaleTouchSet);


        engines.push(this);
        this._handler = documentHandler;
        this._listener = this._handler.events.on('added', (e) => { this.applyAllToDoc(e.data); })
        documentHandler.forDocuments((doc) => { this.applyAllToDoc(doc); })
    }

    /**Run to clean up references to and from this engine*/
    destructor() {
        this._handler.events.off('added', this._listener);
        let index = engines.indexOf(this);
        if (index == -1)
            return console.warn('Theme engine already destructed');
        engines.splice(index, 1);
    }

    /**This applies the current theme to a document*/
    private async applyAllToDoc(doc: Document) {
        this.applyScrollbarToDoc(doc, await this.scrollbar);
        this.applyAnimationToDoc(doc, await this.animations);
        this.applyThemeToDoc(doc, await this.theme);
        this.applyAutoInputToDoc(doc, await this.autoInputMode);
        this.applyInputToDoc(doc, await this.inputMode);
        this.applyScaleToDoc(doc, await this.scale);
        this.applyTextScaleToDoc(doc, await this.textScale);
    }

    /**This applies the current theme to a document*/
    private applyScrollbar(scroll: ScrollbarMode) { this._handler.forDocuments((doc) => { this.applyScrollbarToDoc(doc, scroll); }); }
    private applyScrollbarToDoc(doc: Document, scroll: ScrollbarMode) {
        doc.documentElement.style.setProperty('--scrollbar', { [ScrollbarMode.THIN]: '0.4rem', [ScrollbarMode.MEDIUM]: '1rem', [ScrollbarMode.WIDE]: '1.875rem' }[scroll]);
    }

    /**This applies the current theme to a document*/
    private applyAnimation(anim: AnimationMode) { this._handler.forDocuments((doc) => { this.applyAnimationToDoc(doc, anim); }); }
    private applyAnimationToDoc(doc: Document, anim: AnimationMode) {
        doc.documentElement.classList.remove('anim-all', 'anim-most', 'anim-some');
        switch (anim) {
            case AnimationMode.ALL: doc.documentElement.classList.add('anim-all');
            case AnimationMode.MOST: doc.documentElement.classList.add('anim-most');
            case AnimationMode.SOME: doc.documentElement.classList.add('anim-some'); break;
        }
    }

    /**This applies the current theme to a document*/
    private applyTheme(theme: string) { this._handler.forDocuments((doc) => { this.applyThemeToDoc(doc, theme); }); }
    private applyThemeToDoc(doc: Document, theme: string) { for (const key in bottomGroups) bottomGroups[key].applyThemes(doc.documentElement.style, theme) }

    /**This applies the current scale to a document*/
    private applyScale(scale: number) { this._handler.forDocuments((doc) => { this.applyScaleToDoc(doc, scale); }); }
    private applyScaleToDoc(doc: Document, scale: number) { doc.documentElement.style.fontSize = scale * 16 + 'px'; }

    /**This applies the current scale to a document*/
    private applyTextScale(scale: number) { this._handler.forDocuments((doc) => { this.applyTextScaleToDoc(doc, scale); }); }
    private applyTextScaleToDoc(doc: Document, scale: number) { doc.documentElement.style.setProperty('--textScale', String(scale)); }

    /**Auto Input Mode */
    private applyInput(mode: InputMode) { this._handler.forDocuments((doc) => { this.applyInputToDoc(doc, mode); }); }
    private applyInputToDoc(doc: Document, mode: InputMode) {
        let style = doc.documentElement.style;
        style.setProperty('--mouse', '0');
        style.setProperty('--pen', '0');
        style.setProperty('--touch', '0');
        doc.documentElement.classList.remove('mouse', 'pen', 'touch');
        switch (mode) {
            case InputMode.MOUSE:
                style.setProperty('--mouse', '1');
                doc.documentElement.classList.add('mouse');
                break;
            case InputMode.PEN:
                style.setProperty('--pen', '1');
                doc.documentElement.classList.add('pen');
                break;
            case InputMode.TOUCH:
                style.setProperty('--touch', '1');
                doc.documentElement.classList.add('touch');
                break;
        }
    }

    /**Auto Input Mode */
    private applyAutoInput(mode: AutoInputMode) { this._handler.forDocuments((doc) => { this.applyAutoInputToDoc(doc, mode); }); }
    private applyAutoInputToDoc(doc: Document, mode: AutoInputMode) {
        doc.documentElement.removeEventListener('pointerdown', this._autoInputListenerEvery, { capture: true });
        switch (mode) {
            case AutoInputMode.FIRST:
                doc.documentElement.addEventListener('pointerdown', this._autoInputListenerEvery, { capture: true, once: true });
                break;
            case AutoInputMode.EVERY:
                doc.documentElement.addEventListener('pointerdown', this._autoInputListenerEvery, { capture: true });
                break;
        }
    }

    private async applySingleProperty(key: string, variable: { [s: string]: string }) {
        let theme = await this.theme;
        this._handler.forDocuments((doc) => {
            doc.documentElement.style.setProperty(key, variable[theme]);
        });
    }

    /**Converts the given rems to pixels */
    remToPx(rem: number) {
        return rem * this._scale;
    }
    /**Converts the given pixels to rems */
    pxToRem(px: number) {
        return px / this._scale;
    }
}

//Sets up automatic theme change based on operating system
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', async (e) => {
    for (let i = 0; i < engines.length; i++) {
        if (await engines[i].autoThemeMode === AutoThemeMode.OS) {
            engines[i].theme.set(e.matches ? DefaultThemes.Dark : DefaultThemes.Light);
        }
    }
});


export const createThemeEngine = (documentHandler: DocumentHandler, namespace?: string, name?: string, description?: string) => {
    return {
        engine: new ThemeEngine(documentHandler, namespace, name, description)
    }
} 