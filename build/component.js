import { setAccessor, gather, extend, setAccessorSelf } from "./dom";
import { render } from "./index";
import { idiff } from "./diff";
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
    let n = null;
    if (Array.isArray(dom)) {
        dom.forEach((f) => {
            n = f.nodeName.toLowerCase();
            if (f.__fc && newProps[n]) {
                f.__fc.setProps(newProps[n]);
            }
            else if (!f.__fc && newProps[n]) {
                setAccessorSelf(f, newProps[n], parent);
                if (typeof newProps[n] === "object")
                    updateChildProps(gather(f), newProps[n] || {}, parent);
            }
        });
    }
    else {
        n = dom.nodeName.toLowerCase();
        if (dom.__fc && newProps[n]) {
            dom.__fc.setProps(newProps[n]);
        }
        else if (!dom.__fc && newProps[n]) {
            setAccessorSelf(dom, newProps[n], parent);
            if (typeof newProps[n] === "object")
                updateChildProps(gather(dom), newProps[n] || {}, parent);
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
        if (!this.children.length)
            this._initialRender(false);
        else if (!this.dom.__fskip)
            this.componentDidMount();
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
        let d = this.render();
        if (d == null)
            this.dom.innerHTML = "";
        else if (typeof d !== "object")
            this.dom.textContent = d;
        else {
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