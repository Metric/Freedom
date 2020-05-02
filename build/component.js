import { setAccessor, gather, extend } from "./dom";
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
export class Component {
    constructor(dom, cstate) {
        this.dom = dom;
        this.state = cstate || {};
        this.props = {};
        this._propStateMap = new Map();
        this.children = gather(this.dom);
        this.dom.__fc = this;
        if (this.dom.parentNode?.__fc)
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
    _stateRender(oldProps, newProps) {
        let d = this.render();
        if (d == null) {
            this.dom.innerHTML = "";
            this.componentDidUpdate();
        }
        else if (typeof d !== "object") {
            this.dom.textContent = d;
            this.componentDidUpdate();
        }
        else {
            let c = null;
            if (Array.isArray(d)) {
                d = Array.from(d);
                for (let i = 0; i < d.length; ++i) {
                    c = d[i];
                    if (c.__fc) {
                        c.__fc.setProps(this.state);
                        c.__fc._initialRender(true);
                    }
                    else {
                        getSubComponents(c).forEach((f) => {
                            f.setProps(this.state);
                            f._initialRender(true);
                        });
                        c.__fskip = true;
                        if (typeof c === "object")
                            render(c);
                    }
                }
            }
            else {
                if (d.__fc) {
                    d.__fc.setProps(this.state);
                    d.__fc._initialRender(true);
                }
                else {
                    getSubComponents(d).forEach((f) => {
                        f.setProps(this.state);
                        f._initialRender(true);
                    });
                    d.__fskip = true;
                    render(d);
                }
            }
            idiff(this.dom, d);
            render(this.dom);
        }
        this.onStateChanged(oldProps, newProps);
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
                this._stateRender(oldProps, newProps);
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
                for (let k in this.props) {
                    if (oldProps[k] !== this.props[k]) {
                        setAccessor(this.dom, k, oldProps[k], this.props[k], this);
                        if (this._propStateMap.has(k)) {
                            const mapping = {};
                            mapping[this._propStateMap.get(k)] = this.props[k];
                            this.setState(mapping);
                        }
                    }
                }
            }
            res();
        });
        requestAnimationFrame(async () => await update);
    }
    componentDidUpdate() { }
    componentWillUnmount() { }
    componentDidMount() { }
    render() {
        return this.children;
    }
}
//# sourceMappingURL=component.js.map