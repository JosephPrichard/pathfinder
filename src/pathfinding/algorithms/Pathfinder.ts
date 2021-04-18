import {Point, Tile} from '../core/Components';
import Navigator from '../core/Navigator';
import {Node} from './Node';

/**
 * Pathfinder performs algorithms operations on the grid
 * Uses the navigator rank and expand nodes
 */
abstract class Pathfinder
{
    protected recentSearch: Node[] = [];
    protected navigator: Navigator;

    constructor(navigator: Navigator) {
        this.navigator = navigator;
    }

    setNavigator(navigator: Navigator) {
        this.navigator = navigator;
    }

    getNavigator() {
        return this.navigator;
    }

    getRecentNodes() {
        return this.recentSearch.length;
    }

    clearRecentSearch() {
        this.recentSearch = [];
    }

    addRecent(node: Node) {
        this.recentSearch.push(node);
    }

    abstract getAlgorithmName(): string;

    /**
     * Finds the best path between initial and goal on the grid
     * and returns it in an array
     * @param initial
     * @param goal
     */
    abstract findPath(initial: Point, goal: Point): Tile[];

    /**
     * Reconstructs the solution using the recent search array and calls a
     * function for every generation and for every expansion
     * @param onGeneration to determine what to do when a node's generation is expanded
     */
    reconstructSolution(onGeneration: (nodes: Node) => void) {
        for(const node of this.recentSearch) {
            onGeneration(node);
        }
    }
}

/**
 * Reconstructs the path from a tree, given the bottomLeaf, and
 * returns the shortest path in an array
 * @param bottomLeaf bottom of the tree to start from
 */
export function reconstructPath(bottomLeaf: Node): Tile[] {
    return reconstructPathReversed(bottomLeaf).reverse();
}

/**
 * Reconstructs the path from a tree, given the bottomLeaf, and
 * returns the shortest path in an array
 * @param bottomLeaf bottom of the tree to start from
 */
export function reconstructPathReversed(bottomLeaf: Node): Tile[] {
    const path: Tile[] = [];
    while(bottomLeaf.parent !== null) {
        path.push(bottomLeaf.tile);
        bottomLeaf = bottomLeaf.parent;
    }
    return path;
}

export default Pathfinder;