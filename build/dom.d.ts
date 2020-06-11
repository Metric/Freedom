import { Component } from "./index";
export declare const bindToParent: (value: any, parent: Component) => any;
export declare const setAccessor: (node: Element, name: string, old: any, value: any, parent: Component) => void;
export declare const getProps: (node: Element) => any;
export declare const setAccessorSelf: (node: Element, props: any, parent: Component) => void;
export declare function gather(ele: Element | Node): Array<Element | Node>;
export declare function extend(base: any, next: any): any;
export declare function createElement(name: string, attributes: any, ...children: Array<any>): Element | Array<Element>;
