import { gather } from "./dom";

export function collect(c: Element | Node) {
    const stack = gather(c);
    while (stack.length) {
        const nc: Element | Node = stack.pop();
        const children = gather(nc);
        children.forEach((c) => stack.unshift(c));
        if (nc && (<any>nc).__fc && !(<any>nc).__fskip) (<any>nc).__fc.componentWillUnmount();
    }
    if (c && (<any>c).__fc && !(<any>c).__fskip) (<any>c).__fc.componentWillUnmount();
    if (c && c.parentNode) c.parentNode.removeChild(c);
}

export function isSameNodeType(node: Element | Node, value: any) {
    if (!node || !value) return false;
    return node.nodeName.toLowerCase() === value.nodeName.toLowerCase();
}

export const idiff = (old: Element | Node, value: Element | Node | Array<Element | Node>) => {
    const children = gather(old);
    if (Array.isArray(value)) {
        if (children.length === value.length) {
            while (children.length && value.length) diff(children.shift(), value.shift());
        } else if (children.length < value.length) {
            for (let i = 0; i < children.length; ++i) diff(children[i], value[i]);
            for (let i = children.length; i < value.length; ++i) old.appendChild(value[i]);
        } else if (children.length > value.length) {
            while (children.length > value.length) collect(children.shift());
            while (children.length && value.length) diff(children.shift(), value.shift());
        }
        return old;
    }
    if (children.length > 1 && value) {
        while (children.length > 1) collect(children.shift());
        diff(children[0], value);
    } else if (children.length && !value) {
        while (children.length) collect(children.shift());
    } else if (!children.length && value) {
        old.appendChild(value);
    } else if (children.length === 1 && value) {
        diff(children[0], value);
    }
    return old;
};

export const diff = (old: Element | Node, value: Element | Node) => {
    if (isSameNodeType(old, value)) {
        if (old.nodeName.toLowerCase() === "#text" || old.nodeName.toLowerCase() === "#comment") {
            if (old.nodeValue !== value.nodeValue) old.nodeValue = value.nodeValue;
            return old;
        }

        const attrs = {};
        for (let i = 0; i < (<Element>value).attributes.length; ++i) {
            const attr = (<Element>value).attributes[i];
            attrs[attr.name] = attr.value;
            if (attr.name[0] !== "o" && attr.name[1] !== "n") (<Element>old).setAttribute(attr.name, attr.value);
        }
        for (let k in (<any>value).customAttributes || {}) attrs[k] = (<any>value).customAttributes[k];
        if ((<any>old).__fc) (<any>old).__fc.setProps(attrs);

        idiff(old, gather(value));

        return old;
    }

    if (value) {
        if (old && old.parentNode) old.parentNode.replaceChild(value, old);
        collect(old);
    } else collect(old);

    return value;
};
