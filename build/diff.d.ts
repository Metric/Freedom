export declare function collect(c: Element | Node, remove?: boolean): void;
export declare function isSameNodeType(node: Element | Node, value: any): boolean;
export declare const idiff: (old: Element | Node, value: Element | Node | (Element | Node)[]) => Element | Node;
export declare const diff: (old: Element | Node, value: Element | Node) => any;
