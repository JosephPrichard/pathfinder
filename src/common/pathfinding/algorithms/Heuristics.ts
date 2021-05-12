import {Point} from '../core/Components';

export type HeuristicFunc = (a: Point, b: Point) => number;

export function manhattan(a: Point, b: Point) {
    const dx = Math.abs(a.x - b.x) ;
    const dy = Math.abs(a.y - b.y);
    return dx + dy;
}

export function euclidean(a: Point, b: Point) {
    const dx = Math.abs(a.x - b.x);
    const dy = Math.abs(a.y - b.y);
    return Math.sqrt(dx * dx + dy * dy);
}

export function octile(a: Point, b: Point) {
    const dx = Math.abs(a.x - b.x);
    const dy = Math.abs(a.y - b.y);
    return Math.SQRT2 * Math.min(dx, dy) + Math.abs(dx - dy);
}

export function chebyshev(a: Point, b: Point) {
    const dx = Math.abs(a.x - b.x);
    const dy = Math.abs(a.y - b.y);
    return Math.max(dx, dy);
}

export function nullHeuristic() {
    return 0;
}