import { createElement } from "./dom";
import { Component } from "./component";
export declare function render(base: HTMLElement): void;
declare const React: {
    createElement: typeof createElement;
    hydrate: typeof render;
    render: typeof render;
};
export default React;
export { Component };
