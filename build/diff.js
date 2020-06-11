import { gather, setAccessorSelf } from "./dom";
export function collect(c, remove = true) {
    const stack = gather(c);
    while (stack.length) {
        const nc = stack.pop();
        const children = gather(nc);
        children.forEach((c) => stack.unshift(c));
        if (nc && nc.__fc) {
            nc.__fc.componentWillUnmount();
            nc.__fc = null;
            nc.__fskip = false;
        }
    }
    if (c && c.__fc) {
        c.__fc.componentWillUnmount();
        c.__fc = null;
        c.__fskip = false;
    }
    if (c && c.parentNode && remove)
        c.parentNode.removeChild(c);
}
export function isSameNodeType(node, value) {
    if (!node || !value)
        return false;
    return node.nodeName.toLowerCase() === value.nodeName.toLowerCase();
}
export const idiff = (old, value) => {
    const children = gather(old);
    if (Array.isArray(value)) {
        if (children.length === value.length) {
            while (children.length && value.length)
                diff(children.shift(), value.shift());
        }
        else if (children.length < value.length) {
            for (let i = 0; i < children.length; ++i)
                diff(children[i], value[i]);
            for (let i = children.length; i < value.length; ++i)
                old.appendChild(value[i]);
        }
        else if (children.length > value.length) {
            while (children.length > value.length)
                collect(children.pop());
            while (children.length && value.length)
                diff(children.shift(), value.shift());
        }
        return old;
    }
    if (children.length > 1 && value) {
        while (children.length > 1)
            collect(children.pop());
        diff(children[0], value);
    }
    else if (children.length && !value) {
        while (children.length)
            collect(children.shift());
    }
    else if (!children.length && value) {
        old.appendChild(value);
    }
    else if (children.length === 1 && value) {
        diff(children[0], value);
    }
    return old;
};
export const diff = (old, value) => {
    let r = 0, c = old, v = value;
    if (isSameNodeType(c, v)) {
        if (c.nodeName.toLowerCase() === "#text" || c.nodeName.toLowerCase() === "#comment") {
            if (c.nodeValue !== v.nodeValue)
                c.nodeValue = v.nodeValue;
            return c;
        }
        const attrs = {};
        for (let i = 0; i < v.attributes.length; ++i) {
            const attr = v.attributes[i];
            attrs[attr.name] = attr.value;
        }
        for (let k in v.customAttributes || {})
            attrs[k] = v.customAttributes[k];
        if (!c.__fc && !v.__fc) {
            setAccessorSelf(c, attrs, c.__fparent);
        }
        else if (!c.__fc && v.__fc) {
            c.__fc = v.__fc;
            c.__fparent = null;
            r = 1;
        }
        else if (c.__fc && v.__fc)
            c.__fc.setProps(v.__fc.props);
        else {
            collect(c, false);
            setAccessorSelf(c, attrs, c.__fparent);
        }
        idiff(c, gather(v));
        if (r) {
            c.__fc.dom = c;
            c.__fc._initialProps();
        }
        return c;
    }
    if (v) {
        if (c && c.parentNode)
            c.parentNode.replaceChild(v, c);
        collect(c);
    }
    else
        collect(c);
    return v;
};
//# sourceMappingURL=diff.js.map