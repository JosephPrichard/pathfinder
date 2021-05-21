import {Point} from '../core/Components';

/**
 * A simple data structure that keeps track of whether keys have been added to it
 */
export class HashSet
{
    private map: {[key: string]: boolean | undefined} = {};

    add(key: string) {
        this.map[key] = true;
    }

    remove(key: string) {
        this.map[key] = undefined;
    }

    has(key: string) {
        return this.map[key] !== undefined;
    }

    clear() {
        this.map = {};
    }
}

/**
 * A simple data structure that stores a type at a key
 */
export class HashTable<Value>
{
    private map: {[key: string]: Value | undefined} = {};

    add(key: string, data: Value) {
        this.map[key] = data;
    }

    remove(key: string) {
        this.map[key] = undefined;
    }

    get(key: string) {
        return this.map[key];
    }

    has(key: string) {
        return this.map[key] !== undefined;
    }

    values() {
        const values: Value[] = [];
        for(const i in this.map) {
            if(this.map[i] !== undefined) {
                values.push(this.map[i]!);
            }
        }
        return values;
    }

    clone() {
        const table = new HashTable<Value>();
        table.map = Object.assign({}, this.map);
        return table;
    }

    clear() {
        this.map = {};
    }
}

/**
 * Serialize point into a unique string
 * @param point
 */
export function stringify(point: Point) {
    return 'x' + point.x + 'y' + point.y;
}