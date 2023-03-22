import { } from "../src";

let yo: any[] = []
declare global {
    interface Window { yo: any; }
}
window.yo = yo;
