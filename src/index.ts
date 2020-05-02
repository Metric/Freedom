import { createElement, setAccessorSelf, getProps } from "./dom";
import { Component } from "./component";

export function render(base: HTMLElement) {
    let n: string = null,
        bc: any = base;
    const stack = new Array<any>();
    if (!bc) return;
    if (bc.children) {
        for (let i = 0; i < base.children.length; ++i) {
            stack.unshift(base.children.item(i));
        }
    }

    n = bc.nodeName.toLowerCase();
    if (!bc.__fc) {
        if (window[n]) new window[n](bc);
        else if (!bc.__fparent) setAccessorSelf(bc, getProps(bc), null);
    }

    while (stack.length) {
        const c: any = stack.pop();
        n = c.nodeName.toLowerCase();
        if (!c.__fc) {
            if (window[n]) new window[n](c);
            else if (!c.__fparent) setAccessorSelf(c, getProps(c), null);
        }
        for (let i = 0; i < c.children.length; ++i) {
            stack.unshift(c.children.item(i));
        }
    }
}

const React = {
    createElement: createElement,
    hydrate: render,
    render: render,
};

export default React;
export { Component };
