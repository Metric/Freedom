import { setAccessor, gather, extend, setAccessorSelf } from "./dom";
import { render } from "./index";
import { idiff } from "./diff";
const NODE_CACHE = new Map();
const inNodeCache = (dom) => {
    return NODE_CACHE.has(dom.nodeName.toLowerCase());
};
const assignNodeCache = (dom) => {
    NODE_CACHE.set(dom.nodeName.toLowerCase(), gather(dom));
};
const cloneNodeCache = (dom) => {
    if (inNodeCache(dom)) {
        const items = NODE_CACHE.get(dom.nodeName.toLowerCase());
        const newItems = new Array();
        items.forEach((c) => {
            const clone = c.cloneNode(true);
            dom.appendChild(clone);
            newItems.push(clone);
        });
        return newItems;
    }
    return [];
};
export function getSubComponents(dom) {
    const sub = new Array();
    const stack = Array.from(dom.childNodes);
    while (stack.length) {
        const c = stack.pop();
        if (c.__fc) {
            sub.unshift(c.__fc);
            continue;
        }
        for (let i = 0; i < c.childNodes.length; ++i) {
            stack.unshift(c.childNodes[i]);
        }
    }
    return sub;
}
export function updateChildProps(dom, newProps, parent) {
    let n = null, idn, cn, nn, value;
    if (!dom)
        return;
    if (Array.isArray(dom)) {
        dom.forEach((f) => {
            if (!f.attributes)
                return;
            n = f.nodeName.toLowerCase();
            nn = f.getAttribute("name");
            idn = f.id ? `${n}[id="${f.id}"]` : "";
            nn = nn ? `${n}[name="${nn}"]` : "";
            cn = f.className ? `${n}[class="${f.className}"]` : "";
            value = newProps[idn] || newProps[cn] || newProps[nn] || newProps[n] || null;
            if (f.__fc && value) {
                f.__fc.setProps(value);
            }
            else if (!f.__fc && value) {
                setAccessorSelf(f, value, parent);
                if (typeof value === "object")
                    updateChildProps(gather(f), value, parent);
            }
        });
    }
    else {
        if (!dom.attributes)
            return;
        n = dom.nodeName.toLowerCase();
        nn = dom.getAttribute("name");
        idn = dom.id ? `${n}[id="${dom.id}"]` : "";
        nn = nn ? `${n}[name="${nn}"]` : "";
        cn = dom.className ? `${n}[class="${dom.className}"]` : "";
        value = newProps[idn] || newProps[cn] || newProps[nn] || newProps[n] || null;
        if (dom.__fc && value) {
            dom.__fc.setProps(value);
        }
        else if (!dom.__fc && value) {
            setAccessorSelf(dom, value, parent);
            if (typeof value === "object")
                updateChildProps(gather(dom), value, parent);
        }
    }
}
export class Component {
    constructor(dom, cstate) {
        this.dom = dom;
        this.state = cstate || {};
        this.props = {};
        this._propStateMap = new Map();
        this.children = gather(this.dom);
        this.dom.__fc = this;
        if (this.dom.parentNode && this.dom.parentNode.__fc)
            this.parent = this.dom.parentNode.__fc;
        const attrs = Array.from(dom.attributes);
        const custom = this.dom.customAttributes || {};
        for (let i = 0; i < attrs.length; ++i) {
            const c = attrs[i];
            this.props[c.name] = c.value;
            if (!this.dom.__fskip)
                setAccessor(this.dom, c.name, null, c.value, this);
        }
        for (let k in custom) {
            this.props[k] = custom[k];
            if (!this.dom.__fskip)
                setAccessor(this.dom, k, null, custom[k], this);
        }
        if (!this.children.length) {
            this.children = cloneNodeCache(this.dom);
            this._initialRender(false);
        }
        else {
            if (!inNodeCache(this.dom))
                assignNodeCache(this.dom);
            this._initialRender(false);
        }
    }
    childComponents() {
        if (!this.dom)
            return [];
        return getSubComponents(this.dom);
    }
    mapPropToState(prop, state) {
        this._propStateMap.set(prop, state);
    }
    _initialRender(skip) {
        const newChildProps = this.renderProps();
        let d = this.render();
        if (d == null)
            this.dom.innerHTML = "";
        else if (typeof d !== "object")
            this.dom.textContent = d;
        else {
            if (newChildProps)
                updateChildProps(d, newChildProps, this);
            if (Array.isArray(d))
                d = Array.from(d);
            idiff(this.dom, d);
            render(this.dom);
        }
        if (!this.dom.__fskip && !skip)
            this.componentDidMount();
    }
    _render() {
        const newChildProps = this.renderProps();
        let d = this.render();
        if (d == null) {
            this.dom.innerHTML = "";
        }
        else if (typeof d !== "object") {
            this.dom.textContent = d;
        }
        else {
            if (newChildProps)
                updateChildProps(d, newChildProps, this);
            let c = null;
            if (Array.isArray(d)) {
                d = Array.from(d);
                for (let i = 0; i < d.length; ++i) {
                    c = d[i];
                    c.__fskip = true;
                    render(c);
                }
            }
            else {
                d.__fskip = true;
                render(d);
            }
            idiff(this.dom, d);
            render(this.dom);
        }
        this.componentDidUpdate();
    }
    onStateChanged(oldState, newState) { }
    onPropsChanged(oldProps, newProps) { }
    setState(s) {
        const update = new Promise((res, rej) => {
            const oldProps = extend({}, this.state);
            const newProps = extend({}, this.state);
            if (typeof s === "function")
                extend(newProps, s(this.state));
            else if (typeof s === "object")
                extend(newProps, s);
            let didChange = false;
            for (let k in newProps) {
                if (newProps[k] !== oldProps[k]) {
                    didChange = true;
                    break;
                }
            }
            this.state = newProps;
            if (didChange) {
                this._render();
                this.onStateChanged(oldProps, newProps);
            }
            res();
        });
        requestAnimationFrame(async () => await update);
    }
    setProps(p) {
        const update = new Promise((res, rej) => {
            const oldProps = extend({}, this.props);
            const newProps = extend({}, this.props);
            if (typeof p === "function")
                extend(newProps, p(this.props));
            else if (typeof p === "object")
                extend(newProps, p);
            let didChange = false;
            for (let k in newProps) {
                if (newProps[k] !== oldProps[k]) {
                    didChange = true;
                    break;
                }
            }
            this.props = newProps;
            if (didChange) {
                this.onPropsChanged(oldProps, newProps);
                const mapping = {};
                let stateChanged = false;
                for (let k in this.props) {
                    if (oldProps[k] !== this.props[k]) {
                        setAccessor(this.dom, k, oldProps[k], this.props[k], this);
                        if (this._propStateMap.has(k)) {
                            mapping[this._propStateMap.get(k)] = this.props[k];
                            stateChanged = true;
                        }
                    }
                }
                if (stateChanged)
                    this.setState(mapping);
                else
                    this._render();
            }
            res();
        });
        requestAnimationFrame(async () => await update);
    }
    componentDidUpdate() { }
    componentWillUnmount() { }
    componentDidMount() { }
    renderProps() {
        return null;
    }
    render() {
        return this.children;
    }
}
//# sourceMappingURL=component.js.map