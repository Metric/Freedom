import { gather } from "./dom";

export function collect(c: any) {
    const stack = gather(c);
    while (stack.length) {
        const nc: any = stack.pop();
        const children = gather(nc);
        children.forEach((c) => stack.unshift(c));
        if (nc.__fc && !nc.__fskip) nc.__fc.componentWillUnmount();
    }
    if (c?.__fc && !c?.__fskip) c.__fc.componentWillUnmount();
    c?.parentNode?.removeChild(c);
}

export function isSameNodeType(node: any, value: any) {
    if (!node) return false;
    return node.nodeName.toLowerCase() === value?.nodeName.toLowerCase();
}

export const idiff = (old: any, value: any) => {
    const children = gather(old);
    if (Array.isArray(value)) {
        if (children.length === value.length) {
            while (children.length && value.length) diff(children.pop(), value.pop());
        } else if (children.length < value.length) {
            for (let i = 0; i < children.length; ++i) diff(children[i], value[i]);
            for (let i = children.length; i < value.length; ++i) old.appendChild(value[i]);
        } else if (children.length > value.length) {
            while (children.length > value.length) collect(children.pop());
            while (children.length && value.length) diff(children.pop(), value.pop());
        }
        return old;
    }
    if (children.length > 1 && value) {
        while (children.length > 1) collect(children.pop());
        diff(children[0], value);
    } else if (children.length && !value) {
        while (children.length) collect(children.pop());
    } else if (!children.length && value) {
        old.appendChild(value);
    } else if (children.length === 1 && value) {
        diff(children[0], value);
    }
    return old;
};

export const diff = (old: any, value: any) => {
    if (isSameNodeType(old, value)) {
        if (old.nodeName.toLowerCase() === "#text" || old.nodeName.toLowerCase() === "#comment") {
            if (old.nodeValue !== value.nodeValue) old.nodeValue = value.nodeValue;
            return old;
        }

        const attrs = {};
        for (let i = 0; i < value.attributes.length; ++i) {
            const attr = value.attributes[i];
            attrs[attr.name] = attr.value;
            if (attr.name[0] !== "o" && attr.name[1] !== "n") old.setAttribute(attr.name, attr.value);
        }
        for (let k in value.customAttributes || {}) attrs[k] = value.customAttributes[k];
        if (old.__fc) old.__fc.setProps(attrs);

        idiff(old, gather(value));

        return old;
    }

    if (value) {
        old?.parentNode?.replaceChild(value, old);
        collect(old);
        value.__fskip = false;
    } else collect(old);

    return value;
};
