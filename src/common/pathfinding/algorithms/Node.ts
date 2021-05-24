import {Tile} from '../core/Components';

/**
 * Represents a search Tree Node
 */
export class Node
{
    parent: Node | null = null; //parent node
    readonly children: Node[] = [];
    readonly tile: Tile; //stores a graph node

    constructor(tile: Tile) {
        this.tile = tile;
    }

    addChild(child: Node) {
        child.parent = this;
        this.children.push(child);
    }
}

/**
 * Represents an heuristic weighted aStar search tree node
 */
export class AStarNode extends Node
{
    readonly g: number; //path cost
    readonly fScore: number; //heuristic

    constructor(tile: Tile, g: number, fScore: number) {
        super(tile);
        this.g = g;
        this.fScore = fScore;
    }

    f() {
        return this.fScore;
    }
}

/**
 * Represents an heuristic weighted Best First search tree node
 */
export class BestFirstNode extends Node
{
    readonly h: number; //heuristic

    constructor(tile: Tile, h: number) {
        super(tile);
        this.h = h;
    }
}

/**
 * Represents an heuristic weighted Dijkstra tree node
 */
export class DijkstraNode extends Node
{
    readonly g: number; //path cost

    constructor(tile: Tile, g: number) {
        super(tile);
        this.g = g;
    }
}
