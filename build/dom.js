export const bindToParent = (value, parent) => {
    let f = parent, p, s, spl;
    if (typeof value === "function" && f) {
        if (f[value.name] && !value.bound) {
            s = value.name;
            value = value.bind(f);
            value.bound = 1;
            f[s] = value;
        }
    }
    else if (typeof value === "string" && f) {
        spl = value.split(".");
        p = f;
        while (spl.length && f) {
            p = f;
            s = spl.shift();
            f = f[s];
        }
        if (typeof f === "function" && !f.bound) {
            f = f.bind(p);
            f.bound = 1;
            p[s] = f;
        }
        value = f;
    }
    return value;
};
export const setAccessor = (node, name, old, value, parent) => {
    if (!node)
        return;
    if (name === "className")
        name = "class";
    if (name === "__html")
        name = "html";
    else if (name === "ref") {
        if (old)
            old(null);
        if (value)
            value(node);
    }
    //please for the love of god
    //never use this unless you really have to
    //for showing mark down or something similar
    else if (name === "html") {
        if (old !== value) {
            node.innerHTML = value;
        }
    }
    else if (name === "class") {
        if (node instanceof SVGElement || node instanceof SVGAElement || node instanceof SVGAngle)
            return;
        if (!value || typeof value === "string") {
            node.className = value || "";
        }
        else if (value && typeof value === "object") {
            if (typeof old === "object") {
                for (let i in old) {
                    if (!(i in value))
                        node.classList.remove(i);
                }
            }
            for (let i in value) {
                if (value[i])
                    node.classList.add(i);
                else
                    node.classList.remove(i);
            }
        }
    }
    else if (name === "style") {
        if (node instanceof SVGElement || node instanceof SVGAElement || node instanceof SVGAngle)
            return;
        if (value && typeof value === "object") {
            if (typeof old === "object") {
                for (let i in old) {
                    if (!(i in value))
                        node.style[i] = "";
                }
            }
            else
                node.style.cssText = "";
            for (let i in value)
                node.style[i] = value[i] || "";
        }
        else if (!value || typeof value === "string" || typeof old === "string") {
            node.style.cssText = value || "";
        }
    }
    else if (name[0] === "o" && name[1] === "n") {
        let f = parent, p = parent, k;
        let useCapture = name !== (name = name.replace(/capture$/, ""));
        name = name.toLowerCase().substring(2);
        k = `__$${name}`;
        if (node[k]) {
            node.removeEventListener(name, node[k], useCapture);
            node.removeAttribute("on" + name);
            node[k] = null;
        }
        if (value && p) {
            f = bindToParent(value, p);
            if (!f || typeof f !== "function") {
                console.warn(`Component: ${p.constructor.name} missing event handler for ${name} with name ${value}`);
                return;
            }
            node.addEventListener(name, f, useCapture);
            node[k] = f;
            node.removeAttribute("on" + name);
        }
    }
    else if (name !== "list" && name !== "type" && name in node) {
        try {
            node[name] = value == null ? "" : value;
        }
        catch (e) {
            if ((value == null || value === false) && name !== "spellcheck")
                node.removeAttribute(name);
        }
    }
    else {
        const custom = node.customAttributes || {};
        if (value == null || value === false) {
            node.removeAttribute(name);
            custom[name] = null;
        }
        else if (typeof value === "string") {
            const fn = bindToParent(value, parent);
            if (fn) {
                custom[name] = fn;
                node.removeAttribute(name);
            }
            else
                node.setAttribute(name, value);
        }
        else {
            custom[name] = value;
            node.removeAttribute(name);
        }
        node.customAttributes = custom;
    }
};
export const getProps = (node) => {
    const props = {};
    if (!node || !node.attributes)
        return props;
    const attrs = Array.from(node.attributes);
    for (let i = 0; i < attrs.length; ++i) {
        const attr = attrs[i];
        props[attr.name] = attr.value;
    }
    const custom = node.customAttributes || {};
    for (let k in custom) {
        props[k] = custom[k];
    }
    return props;
};
export const setAccessorSelf = (node, props, parent) => {
    let p = parent;
    if (!node || !node.attributes)
        return;
    if (!p) {
        p = node.parentNode;
        while (p) {
            if (p.__fc) {
                p = p.__fc;
                break;
            }
            p = p.parentNode;
        }
        parent = p;
    }
    const custom = node.customAttributes || {};
    for (let k in props || {}) {
        setAccessor(node, k, node.getAttribute(k) || custom[k], props[k], parent);
    }
    node.__fparent = parent;
};
export function gather(ele) {
    if (!ele)
        return [];
    const list = new Array();
    for (let i = 0; i < ele.childNodes.length; ++i) {
        const c = ele.childNodes[i];
        if (c) {
            if ((c.nodeName.toLowerCase() === "#text" && !c.nodeValue.replace(/(\r\n)+|\r+|\n+|\t+|\s+/gim, "").length) ||
                c.nodeName.toLowerCase() === "#comment") {
                continue;
            }
            list.push(c);
        }
    }
    return list;
}
export function extend(base, next) {
    base = base || {};
    next = next || {};
    for (let k in next) {
        base[k] = next[k];
    }
    return base;
}
export function createElement(name, attributes, ...children) {
    attributes = attributes || {};
    if (!name)
        return children;
    const stack = new Array();
    let child, p = document.createElement(name);
    children.forEach((c) => stack.unshift(c));
    const custom = p.customAttributes || {};
    for (let k in attributes) {
        if (typeof attributes[k] === "string")
            p.setAttribute(k, attributes[k]);
        else
            custom[k] = attributes[k];
    }
    p.customAttributes = custom;
    while (stack.length) {
        child = stack.pop();
        if (!child)
            continue;
        if (Array.isArray(child))
            child.forEach((c) => stack.unshift(c));
        else if (typeof child !== "object")
            p.appendChild(document.createTextNode(child));
        else
            p.appendChild(child);
    }
    return p;
}
//# sourceMappingURL=dom.js.map