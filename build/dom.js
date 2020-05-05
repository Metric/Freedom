export const VALID_ATTRIBUTE_LOOKUP = {
    accept: 1,
    "accept-charset": 1,
    accesskey: 1,
    action: 1,
    align: 1,
    allow: 1,
    alt: 1,
    async: 1,
    autocapitalize: 1,
    autocomplete: 1,
    autofocus: 1,
    autoplay: 1,
    background: 1,
    bgcolor: 1,
    border: 1,
    buffered: 1,
    capture: 1,
    challenge: 1,
    charset: 1,
    checked: 1,
    cite: 1,
    class: 1,
    code: 1,
    codebase: 1,
    color: 1,
    cols: 1,
    colspan: 1,
    content: 1,
    contenteditable: 1,
    contextmenu: 1,
    controls: 1,
    coords: 1,
    crossorigin: 1,
    csp: 1,
    data: 1,
    datetime: 1,
    decoding: 1,
    default: 1,
    defer: 1,
    dir: 1,
    dirname: 1,
    disabled: 1,
    download: 1,
    draggable: 1,
    dropzone: 1,
    enctype: 1,
    enterkeyhint: 1,
    for: 1,
    form: 1,
    formaction: 1,
    formenctype: 1,
    formmethod: 1,
    formnovalidate: 1,
    formtarget: 1,
    headers: 1,
    height: 1,
    hidden: 1,
    high: 1,
    href: 1,
    hreflang: 1,
    "http-equiv": 1,
    icon: 1,
    id: 1,
    importance: 1,
    integrity: 1,
    intrinsicsize: 1,
    inputmode: 1,
    ismap: 1,
    itemprop: 1,
    keytype: 1,
    kind: 1,
    label: 1,
    lang: 1,
    language: 1,
    loading: 1,
    list: 1,
    loop: 1,
    low: 1,
    manifest: 1,
    max: 1,
    maxlength: 1,
    minlength: 1,
    media: 1,
    method: 1,
    min: 1,
    multiple: 1,
    muted: 1,
    name: 1,
    novalidate: 1,
    open: 1,
    optimum: 1,
    pattern: 1,
    ping: 1,
    placeholder: 1,
    poster: 1,
    preload: 1,
    radiogroup: 1,
    readonly: 1,
    referrerpolicy: 1,
    rel: 1,
    required: 1,
    reversed: 1,
    rows: 1,
    rowspan: 1,
    sandbox: 1,
    scope: 1,
    scoped: 1,
    selected: 1,
    shape: 1,
    size: 1,
    sizes: 1,
    slot: 1,
    span: 1,
    spellcheck: 1,
    src: 1,
    srcdoc: 1,
    srclang: 1,
    srcset: 1,
    start: 1,
    step: 1,
    style: 1,
    summary: 1,
    tabindex: 1,
    target: 1,
    title: 1,
    translate: 1,
    type: 1,
    usemap: 1,
    value: 1,
    width: 1,
    wrap: 1,
};
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
        }
        if (value) {
            f = bindToParent(value, parent);
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
        else if (typeof value !== "function" && VALID_ATTRIBUTE_LOOKUP[name])
            node.setAttribute(name, value);
        else {
            value = bindToParent(value, parent);
            custom[name] = value;
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
    for (let i = ele.childNodes.length - 1; i >= 0; --i) {
        const c = ele.childNodes[i];
        if (c)
            list.push(c);
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
        if (VALID_ATTRIBUTE_LOOKUP[k.toLowerCase()] && typeof attributes[k] !== "function")
            p.setAttribute(k, attributes[k].toString());
        else
            custom[k] = attributes[k];
    }
    p.customAttributes = custom;
    while (stack.length) {
        child = stack.pop();
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