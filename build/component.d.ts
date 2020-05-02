export declare function getSubComponents(dom: any): any[];
export declare function updateChildProps(dom: any, newProps: any, parent: any): void;
export declare class Component {
    parent: Component;
    dom: any;
    children: Array<any>;
    props: any;
    state: any;
    _propStateMap: Map<string, string>;
    constructor(dom: HTMLElement, cstate: any);
    childComponents(): Array<Component>;
    mapPropToState(prop: string, state: string): void;
    _initialRender(skip: boolean): void;
    _render(): void;
    onStateChanged(oldState: any, newState: any): void;
    onPropsChanged(oldProps: any, newProps: any): void;
    setState(s: any): void;
    setProps(p: any): void;
    componentDidUpdate(): void;
    componentWillUnmount(): void;
    componentDidMount(): void;
    renderProps(): any;
    render(): any;
}
