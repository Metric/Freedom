import { setAccessor, gather, extend, setAccessorSelf } from "./dom";
import { render } from "./index";
import { idiff } from "./diff";

const NODE_CACHE = new Map<string, Array<Element | Node>>();

const inNodeCache = (dom: Element) => {
    return NODE_CACHE.has(dom.nodeName.toLowerCase());
};

const assignNodeCache = (dom: Element) => {
    NODE_CACHE.set(
        dom.nodeName.toLowerCase(),
        gather(dom).map((c) => {
            const nc = c.cloneNode(true);
            (<any>nc).customAttributes = extend({}, (<any>c).customAttributes || {});
            return nc;
        })
    );
};

const cloneNodeCache = (dom: Element): Array<Element | Node> => {
    if (inNodeCache(dom)) {
        const items = NODE_CACHE.get(dom.nodeName.toLowerCase());
        const newItems = new Array<Element | Node>();
        items.forEach((c) => {
            const clone = c.cloneNode(true);
            (<any>clone).customAttributes = extend({}, (<any>c).customAttributes || {});
            dom.appendChild(clone);
            newItems.push(clone);
        });
        return newItems;
    }
    return [];
};

export function getSubComponents(dom: any): Array<Component> {
    const sub = new Array<Component>();
    const stack: Array<Element | Node> = Array.from(dom.childNodes);
    while (stack.length) {
        const c = stack.pop();
        if ((<any>c).__fc) {
            sub.unshift((<any>c).__fc);
            continue;
        }

        for (let i = 0; i < c.childNodes.length; ++i) {
            stack.unshift(c.childNodes[i]);
        }
    }
    return sub;
}

export function updateChildProps(dom: Element | Array<Element | Node>, newProps: any, parent: any) {
    let n: string = null,
        idn: string,
        cn: string,
        nn: string,
        value: any;
    if (!dom) return;
    if (Array.isArray(dom)) {
        dom.forEach((f: Element | Node) => {
            if (!(<Element>f).attributes) return;
            n = f.nodeName.toLowerCase();
            nn = (<Element>f).getAttribute("name");
            idn = (<Element>f).id ? `${n}[id="${(<Element>f).id}"]` : "";
            nn = nn ? `${n}[name="${nn}"]` : "";
            cn = (<Element>f).className ? `${n}[class="${(<Element>f).className}"]` : "";
            value = newProps[idn] || newProps[cn] || newProps[nn] || newProps[n] || null;
            if ((<any>f).__fc && value) {
                (<any>f).__fc.setProps(value);
            } else if (!(<any>f).__fc && value) {
                setAccessorSelf(<Element>f, value, parent);
                if (typeof value === "object") updateChildProps(gather(f), value, parent);
            }
        });
    } else {
        if (!dom.attributes) return;
        n = dom.nodeName.toLowerCase();
        nn = (<Element>dom).getAttribute("name");
        idn = (<Element>dom).id ? `${n}[id="${(<Element>dom).id}"]` : "";
        nn = nn ? `${n}[name="${nn}"]` : "";
        cn = (<Element>dom).className ? `${n}[class="${(<Element>dom).className}"]` : "";
        value = newProps[idn] || newProps[cn] || newProps[nn] || newProps[n] || null;
        if ((<any>dom).__fc && value) {
            (<any>dom).__fc.setProps(value);
        } else if (!(<any>dom).__fc && value) {
            setAccessorSelf(dom, value, parent);
            if (typeof value === "object") updateChildProps(gather(dom), value, parent);
        }
    }
}

export class Component {
    parent: Component;
    dom: Element;
    children: Array<Element | Node>;
    props: any;
    state: any;
    _propStateMap: Map<string, string>;

    constructor(dom: Element, cstate: any) {
        this.dom = dom;
        this.state = cstate || {};
        this.props = {};
        this._propStateMap = new Map<string, string>();
        this.children = gather(this.dom);
        if (!inNodeCache(this.dom)) assignNodeCache(this.dom);
        (<any>this.dom).__fc = this;
        if (this.dom.parentNode && (<any>this.dom).parentNode.__fc) this.parent = (<any>this.dom).parentNode.__fc;
        else if (this.dom.parentNode && (<any>this.dom).parentNode.__fparent) this.parent = (<any>this.dom).parentNode.__fparent;
        const attrs = Array.from(dom.attributes);
        const custom = (<any>this.dom).customAttributes || {};
        for (let i = 0; i < attrs.length; ++i) {
            const c = attrs[i];
            this.props[c.name] = c.value;
            if (!(<any>this.dom).__fskip) setAccessor(this.dom, c.name, null, c.value, this);
        }
        for (let k in custom) {
            this.props[k] = custom[k];
            if (!(<any>this.dom).__fskip) setAccessor(this.dom, k, null, custom[k], this);
        }
        if (!this.children.length) {
            this.children = cloneNodeCache(this.dom);
            this._initialRender(false);
        } else {
            this._initialRender(false);
        }
    }

    childComponents(): Array<Component> {
        if (!this.dom) return [];
        return getSubComponents(this.dom);
    }

    mapPropToState(prop: string, state: string) {
        this._propStateMap.set(prop, state);
    }

    _initialProps() {
        for (let k in this.props) {
            setAccessor(this.dom, k, null, this.props[k], this);
        }
    }

    _initialRender(skip: boolean) {
        const newChildProps = this.renderProps();
        let d: any = this.render();
        if (d == null) this.dom.innerHTML = "";
        else if (typeof d !== "object") this.dom.textContent = d;
        else {
            if (newChildProps) updateChildProps(<Array<Element | Node>>d, newChildProps, this);
            if (Array.isArray(d)) {
                d = Array.from(d);
                for (let i = 0; i < d.length; ++i) {
                    d[i].__fskip = (<any>this.dom).__fskip;
                    render(d[i]);
                }
            } else {
                d.__fskip = (<any>this.dom).__fskip;
                render(d);
            }
            idiff(this.dom, d);
            render(this.dom);
        }
        if (!(<any>this.dom).__fskip && !skip) this.componentDidMount();
    }

    _render() {
        const newChildProps = this.renderProps();
        let d = this.render();
        if (d == null) {
            this.dom.innerHTML = "";
        } else if (typeof d !== "object") {
            this.dom.textContent = d;
        } else {
            if (newChildProps) updateChildProps(<Array<Element | Node>>d, newChildProps, this);
            let c = null;
            if (Array.isArray(d)) {
                d = Array.from(d);
                for (let i = 0; i < d.length; ++i) {
                    c = d[i];
                    c.__fskip = true;
                    render(c);
                }
            } else {
                (<any>d).__fskip = true;
                render(d);
            }
            idiff(this.dom, <Element | Node | Array<Element | Node>>d);
            render(this.dom);
        }
        this.componentDidUpdate();
    }

    onStateChanged(oldState: any, newState: any) {}
    onPropsChanged(oldProps: any, newProps: any) {}

    setState(s: any) {
        const update = new Promise((res, rej) => {
            const oldProps = extend({}, this.state);
            const newProps = extend({}, this.state);

            if (typeof s === "function") extend(newProps, s(this.state));
            else if (typeof s === "object") extend(newProps, s);

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

    setProps(p: any) {
        const update = new Promise((res, rej) => {
            const oldProps = extend({}, this.props);
            const newProps = extend({}, this.props);

            if (typeof p === "function") extend(newProps, p(this.props));
            else if (typeof p === "object") extend(newProps, p);

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
                const mapping: any = {};
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
                if (stateChanged) this.setState(mapping);
                else this._render();
            }
            res();
        });
        requestAnimationFrame(async () => await update);
    }

    componentDidUpdate() {}
    componentWillUnmount() {}
    componentDidMount() {}

    renderProps(): any {
        return null;
    }

    render(): Element | string | Array<Element | Node | string> {
        return this.children;
    }
}
