import {Grid} from './Grid';
import {Point, Tile} from './Components';

export const UNIT = 1; //number of tiles we can move at once

/**
 * Describes an abstract navigator for a grid
 * Provides graph-like traversal for the grid
 * Determines where we can travel to from a certain point,
 * whether we have reached a destination, and the cost to
 * travel to a certain point
 */
abstract class Navigator
{
    protected readonly grid: Grid;

    constructor(grid: Grid) {
        this.grid = grid;
    }

    getGrid() {
        return this.grid;
    }

    /**
     * Goal check function: Checks if two points are equal
     * @param a
     * @param b
     */
    equals(a: Point, b: Point) {
        return a.x === b.x && a.y === b.y;
    }

    /**
     * Step cost function from a to b
     * @param a
     * @param b to point to travel to
     */
    abstract cost(a: Point, b: Point): number;

    /**
     * Neighbors function: Gets the available neighbors for a point in a grid we can make
     * in a given move
     * @param point
     */
    abstract neighbors(point: Point): Tile[];

    abstract getType(): string;
}

export default Navigator;