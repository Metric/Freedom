import { createElement } from "./dom";
import { Component } from "./component";
export declare function render(base: Element): void;
declare const React: {
    createElement: typeof createElement;
    hydrate: typeof render;
    render: typeof render;
};
export declare const Freedom: {
    createElement: typeof createElement;
    render: typeof render;
};
export default React;
export { Component };
