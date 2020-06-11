import { createElement, setAccessorSelf, getProps } from "./dom";
import { Component } from "./component";

export function render(base: Element) {
    let n: string = null,
        bc: Element = base;
    const stack = new Array<Element>();
    if (!bc) return;
    if (bc.children) {
        for (let i = 0; i < bc.children.length; ++i) {
            stack.unshift(bc.children.item(i));
        }
    }

    n = bc.nodeName.toLowerCase();
    if (!(<any>bc).__fc) {
        if (globalThis[n]) new globalThis[n](bc);
        else setAccessorSelf(bc, getProps(bc), (<any>bc).__fparent);
    }

    while (stack.length) {
        const c: any = stack.pop();
        if (!c) continue;
        n = c.nodeName.toLowerCase();
        if (!c.__fc) {
            if (globalThis[n]) new globalThis[n](c);
            else setAccessorSelf(c, getProps(c), c.__fparent);
        }
        //don't double dip if we created a component
        if (!c.__fc) {
            for (let i = 0; i < c.children.length; ++i) {
                stack.unshift(c.children.item(i));
            }
        }
    }
}

const React = {
    createElement: createElement,
    hydrate: render,
    render: render,
};

export const Freedom = {
    createElement: createElement,
    render: render,
};

export default React;
export { Component };
