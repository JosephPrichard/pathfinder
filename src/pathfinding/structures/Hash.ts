/*
 * Copyright (c) Joseph Prichard 2022.
 */

import {Point}  from '../core/Components';

/**
 * A simple data structure that keeps track of whether points have been added to it
 */
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

/**
 * A simple data structure that stores a type at a key
 */
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