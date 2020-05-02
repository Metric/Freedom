import { Component } from "../../src/index";
import { render } from "../../src/index";

class display extends Component {
    render() {
        return this.props.value;
    }
}

class calculator extends Component {
    constructor(dom: HTMLElement) {
        super(dom, { total: null, next: null, operation: null, value: 0 });
    }
    clear(e) {
        this.setState({
            total: null,
            next: null,
            operation: null,
            value: 0,
        });
    }
    posneg(e) {
        if (this.state.next) {
            //@ts-ignore: 2304
            const next = this.state.next ? `${Big(this.state.next).times(-1)}` : this.state.total ? `${Big(this.state.total).times(-1)}` : 0;
            this.setState({
                next: next,
                value: next,
            });
            return;
        }

        //@ts-ignore: 2304
        const next = this.state.next ? `${Big(this.state.next).times(-1)}` : this.state.total ? `${Big(this.state.total).times(-1)}` : 0;
        this.setState({
            total: next,
            next: null,
            value: next,
        });
    }
    mod(e) {
        if (this.state.next) {
            //@ts-ignore: 2304
            const next = this.state.next ? `${Big(this.state.next).div(100)}` : this.state.total ? `${Big(this.state.total).div(100)}` : 0;
            this.setState({
                next: next,
                value: next,
            });
            return;
        }
        //@ts-ignore: 2304
        const next = this.state.next ? `${Big(this.state.next).div(100)}` : this.state.total ? `${Big(this.state.total).div(100)}` : 0;
        this.setState({
            total: next,
            next: null,
            value: next,
        });
    }
    divide(e) {
        if (this.state.operation && this.state.operation !== this.divide) {
            this.state.operation();
        }
        this.setState((s) => {
            //@ts-ignore: 2304
            const next = s.next && s.total ? `${Big(s.total || 0).div(Big(s.next))}` : s.next || s.total || 0;
            return {
                operation: this.divide,
                total: next || s.total || 0,
                next: null,
                value: next,
            };
        });
    }
    number(e) {
        this.setState((s) => {
            const next = s.next ? s.next + e.target.name : e.target.name;
            return {
                next: next,
                value: next,
            };
        });
    }
    multiply(e) {
        if (this.state.operation && this.state.operation !== this.multiply) {
            this.state.operation();
        }
        this.setState((s) => {
            //@ts-ignore: 2304
            const next = s.next && s.total ? `${Big(s.total || 0).times(Big(s.next))}` : s.next || s.total || 0;
            return {
                operation: this.multiply,
                total: next,
                next: null,
                value: next,
            };
        });
    }
    subtract(e) {
        if (this.state.operation && this.state.operation !== this.subtract) {
            this.state.operation();
        }
        this.setState((s) => {
            //@ts-ignore: 2304
            const next = s.next && s.total ? `${Big(s.total || 0).minus(Big(s.next))}` : s.next || s.total || 0;
            return {
                operation: this.subtract,
                total: next,
                next: null,
                value: next,
            };
        });
    }
    add(e) {
        if (this.state.operation && this.state.operation !== this.add) {
            this.state.operation();
        }
        this.setState((s) => {
            //@ts-ignore: 2304
            const next = s.next && s.total ? `${Big(s.total || 0).plus(Big(s.next))}` : s.next || s.total || 0;
            return {
                operation: this.add,
                total: next,
                next: null,
                value: next,
            };
        });
    }
    decimal(e) {
        const next = this.state.next ? (this.state.next.includes(".") ? this.state.next : this.state.next + ".") : "0.";
        this.setState({
            next: next,
            value: next,
        });
    }
    equal(e) {
        if (this.state.operation) {
            this.state.operation();
            this.setState({
                operation: null,
            });
        }
    }
}

const w: any = window;
w.display = display;
w.calculator = calculator;
render(document.body);
