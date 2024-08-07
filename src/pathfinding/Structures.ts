import { Point } from "./Core";

export class PointSet
{
    private readonly map: (boolean | undefined)[][];

    constructor(width: number, height: number) {
        this.map = new Array(width);
        for (let i = 0; i < this.map.length; i++) {
            this.map[i] = new Array(height);
        }
    }

    add(point: Point) {
        this.map[point.x][point.y] = true;
    }

    remove(point: Point) {
        this.map[point.x][point.y] = undefined;
    }

    has(point: Point) {
        return this.map[point.x][point.y] !== undefined;
    }

    clear() {
        for (let i = 0; i < this.map.length; i++) {
            for (let j = 0; j < this.map[i].length; j++) {
                this.map[i][j] = undefined;
            }
        }
    }
}

export class PointTable<Value>
{
    private readonly map: (Value | undefined)[][];

    constructor(width: number, height: number) {
        this.map = new Array(width);
        for (let i = 0; i < this.map.length; i++) {
            this.map[i] = new Array(height);
        }
    }

    add(key: Point, data: Value) {
        this.map[key.x][key.y] = data;
    }

    remove(key: Point) {
        this.map[key.x][key.y] = undefined;
    }

    get(key: Point) {
        return this.map[key.x][key.y];
    }

    has(key: Point) {
        return this.map[key.x][key.y] !== undefined;
    }

    values() {
        const values: Value[] = [];
        for (let i = 0; i < this.map.length; i++) {
            for (let j = 0; j < this.map[i].length; j++) {
                const v = this.map[i][j];
                if (v) {
                    values.push(v);
                }
            }
        }
        return values;
    }

    clone() {
        const table = new PointTable<Value>(this.map.length, this.map[0].length);
        for (let i = 0; i < this.map.length; i++) {
            for (let j = 0; j < this.map[i].length; j++) {
                table.map[i][j] = this.map[i][j];
            }
        }
        return table;
    }

    clear() {
        for (let i = 0; i < this.map.length; i++) {
            for (let j = 0; j < this.map[i].length; j++) {
                this.map[i][j] = undefined;
            }
        }
    }
}

export type Comparator<E> = (a: E, b: E) => boolean

export class Heap<E>
{
    private elements: E[] = [];
    readonly compare: Comparator<E>;

    constructor(compare: Comparator<E>) {
        this.compare = compare;
    }

    getSize() {
        return this.elements.length;
    }

    isEmpty() {
        return this.elements.length === 0;
    }

    push(e: E) {
        this.elements.push(e);
        this.siftUp(this.elements.length-1); //last element
    }

    peek() {
        return this.elements[0];
    }

    pop() {
        const val = this.peek();
        this.move(this.elements.length - 1, 0);
        this.elements.pop();
        this.siftDown(0);
        return val;
    }

    clear() {
        this.elements = [];
    }

    private siftUp(pos: number) {
        let parent = ((pos - 1) / 2) >> 0; // integer division
        while(parent >= 0) {
            // if the current position is better than parent
            if(this.compare(this.elements[pos], this.elements[parent])) {
                // then current position with parent and move to next
                this.swap(pos, parent);
                pos = parent;
                parent = ((pos - 1) / 2) >> 0;
            } else {
                // otherwise stop
                parent = -1;
            }
        }
    }

    private siftDown(pos: number) {
        const left = 2 * pos + 1;
        const right = 2 * pos + 2;
        // stop if the children are out of bounds
        if(left >= this.elements.length) {
            return;
        }
        // find the better child
        const child = (right >= this.elements.length || this.compare(this.elements[left], this.elements[right]))
            ? left : right;
        // continues to sift down if the child is better than the current position
        if(this.compare(this.elements[child], this.elements[pos])) {
            this.swap(child, pos);
            this.siftDown(child);
        }
    }

    private move(from: number, to: number) {
        this.elements[to] = this.elements[from];
    }

    private swap(a: number, b: number) {
        let val = this.elements[a];
        this.elements[a] = this.elements[b];
        this.elements[b] = val;
    }
}

export class Stack<E>
{
    private readonly elems: E[] = [];

    peek() {
        return this.elems.length != 0 ? this.elems[0] : undefined;
    }

    push(e: E) {
        this.elems.push(e);
    }

    pop() {
        return this.elems.pop();
    }

    isEmpty() {
        return this.elems.length === 0;
    }

    getSize() {
        return this.elems.length;
    }
}