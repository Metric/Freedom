import { createElement, setAccessorSelf, getProps } from "./dom";
import { Component } from "./component";
export function render(base) {
    let n = null, bc = base;
    const stack = new Array();
    if (!bc)
        return;
    if (bc.children) {
        for (let i = 0; i < bc.children.length; ++i) {
            stack.unshift(bc.children.item(i));
        }
    }
    n = bc.nodeName.toLowerCase();
    if (!bc.__fc) {
        if (window[n])
            new window[n](bc);
        else if (!bc.__fparent)
            setAccessorSelf(bc, getProps(bc), null);
    }
    while (stack.length) {
        const c = stack.pop();
        n = c.nodeName.toLowerCase();
        if (!c.__fc) {
            if (window[n])
                new window[n](c);
            else if (!c.__fparent)
                setAccessorSelf(c, getProps(c), null);
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
export const Freedom = {
    createElement: createElement,
    render: render,
};
export default React;
export { Component };
//# sourceMappingURL=index.js.map