export const VALID_ATTRIBUTE_LOOKUP = {
    accept: true,
    "accept-charset": true,
    accesskey: true,
    action: true,
    align: true,
    allow: true,
    alt: true,
    async: true,
    autocapitalize: true,
    autocomplete: true,
    autofocus: true,
    autoplay: true,
    background: true,
    bgcolor: true,
    border: true,
    buffered: true,
    capture: true,
    challenge: true,
    charset: true,
    checked: true,
    cite: true,
    class: true,
    code: true,
    codebase: true,
    color: true,
    cols: true,
    colspan: true,
    content: true,
    contenteditable: true,
    contextmenu: true,
    controls: true,
    coords: true,
    crossorigin: true,
    csp: true,
    data: true,
    datetime: true,
    decoding: true,
    default: true,
    defer: true,
    dir: true,
    dirname: true,
    disabled: true,
    download: true,
    draggable: true,
    dropzone: true,
    enctype: true,
    enterkeyhint: true,
    for: true,
    form: true,
    formaction: true,
    formenctype: true,
    formmethod: true,
    formnovalidate: true,
    formtarget: true,
    headers: true,
    height: true,
    hidden: true,
    high: true,
    href: true,
    hreflang: true,
    "http-equiv": true,
    icon: true,
    id: true,
    importance: true,
    integrity: true,
    intrinsicsize: true,
    inputmode: true,
    ismap: true,
    itemprop: true,
    keytype: true,
    kind: true,
    label: true,
    lang: true,
    language: true,
    loading: true,
    list: true,
    loop: true,
    low: true,
    manifest: true,
    max: true,
    maxlength: true,
    minlength: true,
    media: true,
    method: true,
    min: true,
    multiple: true,
    muted: true,
    name: true,
    novalidate: true,
    open: true,
    optimum: true,
    pattern: true,
    ping: true,
    placeholder: true,
    poster: true,
    preload: true,
    radiogroup: true,
    readonly: true,
    referrerpolicy: true,
    rel: true,
    required: true,
    reversed: true,
    rows: true,
    rowspan: true,
    sandbox: true,
    scope: true,
    scoped: true,
    selected: true,
    shape: true,
    size: true,
    sizes: true,
    slot: true,
    span: true,
    spellcheck: true,
    src: true,
    srcdoc: true,
    srclang: true,
    srcset: true,
    start: true,
    step: true,
    style: true,
    summary: true,
    tabindex: true,
    target: true,
    title: true,
    translate: true,
    type: true,
    usemap: true,
    value: true,
    width: true,
    wrap: true,
};
export const setAccessor = (node, name, old, value, parent) => {
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
        let f = parent, p, s, spl = typeof value === "string" ? value.split(".") : value;
        let useCapture = name !== (name = name.replace(/capture$/, ""));
        name = name.toLowerCase().substring(2);
        if (old) {
            if (typeof old === "string") {
                if (!f)
                    return;
                spl = old.split(".");
                while (spl.length && f) {
                    s = spl.shift();
                    f = f[s];
                }
                if (!f)
                    return;
                node.removeEventListener(name, f, useCapture);
            }
            else
                node.removeEventListener(name, old, useCapture);
            node.removeAttribute("on" + name);
        }
        if (value) {
            if (typeof value === "string") {
                if (!f)
                    return;
                while (spl.length && f) {
                    p = f;
                    s = spl.shift();
                    f = f[s];
                }
                if (!f) {
                    console.warn(`Component: ${p.constructor.name} missing event handler for ${name} with name ${value}`);
                    return;
                }
                if (!f.bound) {
                    f = f.bind(p);
                    f.bound = true;
                    p[s] = f;
                }
                node.addEventListener(name, f, useCapture);
            }
            else
                node.addEventListener(name, value, useCapture);
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
            node.removeAttribute(name);
            custom[name] = value;
        }
        node.customAttributes = custom;
    }
};
export const setAccessorSelf = (node) => {
    if (!node.attributes)
        return;
    let parent = node.parentNode;
    while (parent) {
        if (parent.__fc) {
            parent = parent.__fc;
            break;
        }
        parent = parent.parentNode;
    }
    const attrs = Array.from(node.attributes);
    for (let i = 0; i < attrs.length; ++i) {
        const attr = attrs[i];
        setAccessor(node, attr.name, null, attr.value, parent);
    }
    const custom = node.customAttributes || {};
    for (let k in custom) {
        setAccessor(node, k, null, custom[k], parent);
    }
};
export function gather(ele) {
    if (!ele)
        return [];
    const list = new Array();
    for (let i = ele.childNodes.length - 1; i >= 0; --i) {
        const c = ele.childNodes[i];
        if (c)
            list.unshift(c);
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