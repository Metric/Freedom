import { Component } from "./index";

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

export const setAccessor = (node: Element, name: string, old: any, value: any, parent: Component) => {
    if (!node) return;
    if (name === "className") name = "class";
    if (name === "__html") name = "html";
    else if (name === "ref") {
        if (old) old(null);
        if (value) value(node);
    }
    //please for the love of god
    //never use this unless you really have to
    //for showing mark down or something similar
    else if (name === "html") {
        if (old !== value) {
            node.innerHTML = value;
        }
    } else if (name === "class") {
        if (!value || typeof value === "string") {
            node.className = value || "";
        } else if (value && typeof value === "object") {
            if (typeof old === "object") {
                for (let i in old) {
                    if (!(i in value)) node.classList.remove(i);
                }
            }
            for (let i in value) {
                if (value[i]) node.classList.add(i);
                else node.classList.remove(i);
            }
        }
    } else if (name === "style") {
        if (value && typeof value === "object") {
            if (typeof old === "object") {
                for (let i in old) {
                    if (!(i in value)) (<HTMLElement>node).style[i] = "";
                }
            } else (<HTMLElement>node).style.cssText = "";
            for (let i in value) (<HTMLElement>node).style[i] = value[i] || "";
        } else if (!value || typeof value === "string" || typeof old === "string") {
            (<HTMLElement>node).style.cssText = value || "";
        }
    } else if (name[0] === "o" && name[1] === "n") {
        let f, p, s, spl;
        let useCapture = name !== (name = name.replace(/capture$/, ""));
        name = name.toLowerCase().substring(2);
        if (old) {
            f = parent;
            if (typeof old === "string") {
                if (!f) return;
                spl = old.split(".");
                while (spl.length && f) {
                    s = spl.shift();
                    f = f[s];
                }
                if (!f || typeof f !== "function") return;
                node.removeEventListener(name, f, useCapture);
            } else node.removeEventListener(name, old, useCapture);
            node.removeAttribute("on" + name);
        }
        if (value) {
            f = parent;
            if (typeof value === "string") {
                if (!f) return;
                spl = value.split(".");
                p = f;
                while (spl.length && f) {
                    p = f;
                    s = spl.shift();
                    f = f[s];
                }
                if (!f || typeof f !== "function") {
                    console.warn(`Component: ${p.constructor.name} missing event handler for ${name} with name ${value}`);
                    return;
                }
                if (!f.bound) {
                    f = f.bind(p);
                    f.bound = true;
                    p[s] = f;
                }
                node.addEventListener(name, f, useCapture);
            } else node.addEventListener(name, value, useCapture);
            node.removeAttribute("on" + name);
        }
    } else if (name !== "list" && name !== "type" && name in node) {
        try {
            node[name] = value == null ? "" : value;
        } catch (e) {
            if ((value == null || value === false) && name !== "spellcheck") node.removeAttribute(name);
        }
    } else {
        const custom = (<any>node).customAttributes || {};
        if (value == null || value === false) {
            node.removeAttribute(name);
            custom[name] = null;
        } else if (typeof value !== "function" && VALID_ATTRIBUTE_LOOKUP[name]) node.setAttribute(name, value);
        else {
            let f: any = parent,
                p,
                s,
                spl;
            node.removeAttribute(name);
            if (typeof value === "function" && f) {
                if (f[value.name] && !value.bound) {
                    s = value.name;
                    value = value.bind(f);
                    value.bound = true;
                    f[s] = value;
                }
            } else if (typeof value === "string" && f) {
                spl = value.split(".");
                p = f;
                while (spl.length && f) {
                    p = f;
                    s = spl.shift();
                    f = f[s];
                }
                if (typeof f === "function" && !f.bound) {
                    f = f.bind(p);
                    f.bound = true;
                    p[s] = f;
                    value = f;
                }
            }
            custom[name] = value;
        }
        (<any>node).customAttributes = custom;
    }
};

export const getProps = (node: Element): any => {
    const props: any = {};
    if (!node || !node.attributes) return props;
    const attrs = Array.from(node.attributes);
    for (let i = 0; i < attrs.length; ++i) {
        const attr: any = attrs[i];
        props[attr.name] = attr.value;
    }
    const custom = (<any>node).customAttributes || {};
    for (let k in custom) {
        props[k] = custom[k];
    }
    return props;
};

export const setAccessorSelf = (node: Element, props: any, parent: Component) => {
    let p: any = parent;
    if (!node || !node.attributes) return;
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
    const custom = (<any>node).customAttributes || {};
    for (let k in props || {}) {
        setAccessor(node, k, node.getAttribute(k) || custom[k], props[k], parent);
    }
    (<any>node).__fparent = parent;
};

export function gather(ele: Element | Node): Array<Element | Node> {
    if (!ele) return [];
    const list: Array<Element | Node> = new Array<Element | Node>();
    for (let i = ele.childNodes.length - 1; i >= 0; --i) {
        const c = ele.childNodes[i];
        if (c) list.unshift(c);
    }
    return list;
}

export function extend(base: any, next: any) {
    base = base || {};
    next = next || {};
    for (let k in next) {
        base[k] = next[k];
    }
    return base;
}

export function createElement(name: string, attributes: any, ...children: Array<any>): Element {
    attributes = attributes || {};
    const stack = new Array<any>();
    let child,
        p: Element = document.createElement(name);
    children.forEach((c) => stack.unshift(c));
    const custom = (<any>p).customAttributes || {};
    for (let k in attributes) {
        if (VALID_ATTRIBUTE_LOOKUP[k.toLowerCase()] && typeof attributes[k] !== "function") p.setAttribute(k, attributes[k].toString());
        else custom[k] = attributes[k];
    }
    (<any>p).customAttributes = custom;
    while (stack.length) {
        child = stack.pop();
        if (Array.isArray(child)) child.forEach((c) => stack.unshift(c));
        else if (typeof child !== "object") p.appendChild(document.createTextNode(child));
        else p.appendChild(child);
    }
    return p;
}
