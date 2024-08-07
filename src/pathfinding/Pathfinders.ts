/*
 * Copyright (c) Joseph Prichard 2022.
 */

import {Tile, Point} from './Core';
import {Navigator} from './Core';
import { Heap, PointSet, PointTable, Stack } from './Structures';

export class PathNode
{
    parent: PathNode | null = null; // parent node
    readonly children: PathNode[] = [];
    readonly tile: Tile; // stores a graph node

    constructor(tile: Tile) {
        this.tile = tile;
    }

    addChild(child: PathNode) {
        child.parent = this;
        this.children.push(child);
    }
}

export class AStarNode extends PathNode
{
    readonly g: number; // path cost
    readonly fScore: number; // heuristic

    constructor(tile: Tile, g: number, fScore: number) {
        super(tile);
        this.g = g;
        this.fScore = fScore;
    }

    f() {
        return this.fScore;
    }
}

export class BestFirstNode extends PathNode
{
    readonly h: number; // heuristic

    constructor(tile: Tile, h: number) {
        super(tile);
        this.h = h;
    }
}

export class DijkstraNode extends PathNode
{
    readonly g: number; // path cost

    constructor(tile: Tile, g: number) {
        super(tile);
        this.g = g;
    }
}

export abstract class Pathfinder
{
    protected recentSearch: PathNode[] = [];
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

    getRecentGenerations() {
        return this.recentSearch.slice();
    }

    protected addRecent(node: PathNode) {
        this.recentSearch.push(node);
    }

    abstract getAlgorithmName(): string;

    abstract findPath(initial: Point, goal: Point): Tile[];
}

export function reconstructPath(bottomLeaf: PathNode) {
    return reconstructPathReversed(bottomLeaf).reverse();
}

export function reconstructPathReversed(bottomLeaf: PathNode) {
    const path: Tile[] = [];
    while(bottomLeaf.parent !== null) {
        path.push(bottomLeaf.tile);
        bottomLeaf = bottomLeaf.parent;
    }
    return path;
}

export type HeuristicFunc = (a: Point, b: Point) => number;

export class Heuristics {

    static manhattan(a: Point, b: Point) {
        const dx = Math.abs(a.x - b.x) ;
        const dy = Math.abs(a.y - b.y);
        return dx + dy;
    }
    
    static euclidean(a: Point, b: Point) {
        const dx = Math.abs(a.x - b.x);
        const dy = Math.abs(a.y - b.y);
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    static octile(a: Point, b: Point) {
        const dx = Math.abs(a.x - b.x);
        const dy = Math.abs(a.y - b.y);
        return Math.SQRT2 * Math.min(dx, dy) + Math.abs(dx - dy);
    }
    
    static chebyshev(a: Point, b: Point) {
        const dx = Math.abs(a.x - b.x);
        const dy = Math.abs(a.y - b.y);
        return Math.max(dx, dy);
    }
    
    static nullHeuristic() {
        return 0;
    }
};

export class AStarPathfinder extends Pathfinder
{
    private readonly heuristicFunc: HeuristicFunc = (a: Point, b: Point) => Heuristics.euclidean(a,b);
    private readonly p: number; // tie breaker

    constructor(navigator: Navigator, func?: HeuristicFunc) {
        super(navigator);
        const grid = this.getNavigator().getGrid();
        // minimum cost of taking one step / expected maximum path length
        this.p = 1/(grid.getWidth() * grid.getHeight());
        if(func !== undefined) {
            this.heuristicFunc = func;
        }
    }

    getAlgorithmName() {
        return 'A*';
    }

    findPath(initial: Point, goal: Point) {
        this.clearRecentSearch();
        const grid = this.navigator.getGrid();
        // ranks nodes we haven't yet visited by f-score
        const openFrontier = new Heap<AStarNode>((a, b) => a.f() < b.f());
        // stores points we have already visited so we don't visit them again
        const closedSet = new PointSet(grid.getWidth(), grid.getHeight());
        // stores the contents of the frontier to allow for fast retrieval of f-score
        const openSet = new PointTable<number>(grid.getWidth(), grid.getHeight());
        // add the root to the frontier and start the algorithm
        const root = new AStarNode(grid.get(initial), 0, 0);
        openFrontier.push(root);
        openSet.add(initial, root.g);
        // continues until points have been visited
        while (!openFrontier.isEmpty()) {
            const currentNode = openFrontier.pop();
            const currentPoint = currentNode.tile.point;
            openSet.remove(currentPoint);
            // a point may be popped off the frontier again if it was re-evaluated, pre-eval nodes should be ignored
            if(closedSet.has(currentPoint)) {
                continue;
            }
            closedSet.add(currentPoint);
            this.addRecent(currentNode);
            // check if we're found the solution
            if (this.navigator.equals(currentPoint, goal)) {
                return reconstructPath(currentNode);
            }
            for (const neighbor of this.navigator.neighbors(currentPoint)) {
                const neighborPoint = neighbor.point;
                // point has already been visited
                if(closedSet.has(neighborPoint)) {
                    continue;
                }
                const g = currentNode.g + this.stepCost(currentPoint, neighborPoint);
                const f = g + this.heuristic(neighborPoint, goal);
                // re-evaluation: a point that is already in the openSet may be added again if the path to get there was less expensive
                if (!openSet.has(neighborPoint) || g < openSet.get(neighborPoint)!) {
                    const neighborNode = new AStarNode(
                        neighbor, g, f
                    );
                    currentNode.addChild(neighborNode);
                    openFrontier.push(neighborNode);
                    openSet.add(neighborPoint, neighborNode.g);
                }
            }
        }
        // checked all possible paths: no solution was found
        return [];
    }

    heuristic(a: Point, b: Point) {
        return this.heuristicFunc(a, b) * (1 + this.p);
    }

    stepCost(currentPoint: Point, neighborPoint: Point) {
        return this.navigator.cost(currentPoint, neighborPoint);
    }
}


export class BestFirstPathfinder extends Pathfinder
{
    private readonly heuristicFunc: HeuristicFunc = (a: Point, b: Point) => Heuristics.euclidean(a,b);

    constructor(navigator: Navigator, func?: HeuristicFunc) {
        super(navigator);
        if(func !== undefined) {
            this.heuristicFunc = func;
        }
    }

    getAlgorithmName() {
        return 'Best-First Search';
    }

    findPath(initial: Point, goal: Point) {
        this.clearRecentSearch();
        const grid = this.navigator.getGrid();
        // ranks points we haven't yet visited by heuristic
        const frontier = new Heap<BestFirstNode>((a, b) => a.h < b.h);
        // stores points we have already visited so we don't visit them again
        const closedSet = new PointSet(grid.getWidth(), grid.getHeight());
        // add the root to the frontier and start the algorithm
        const root = new BestFirstNode(grid.get(initial), 0);
        frontier.push(root);
        closedSet.add(initial);
        // continues until points have been visited
        while (!frontier.isEmpty()) {
            const currentNode = frontier.pop();
            const currentPoint = currentNode.tile.point;
            this.addRecent(currentNode);
            // check if we're found the solution
            if (this.navigator.equals(currentPoint, goal)) {
                return reconstructPath(currentNode);
            }
            for (const neighbor of this.navigator.neighbors(currentPoint)) {
                const neighborPoint = neighbor.point;
                const h = this.heuristic(neighborPoint, goal);
                // point hasn't been visited, we can add it to frontier
                if (!closedSet.has(neighborPoint)) {
                    const neighborNode = new BestFirstNode(
                        neighbor, h
                    );
                    currentNode.addChild(neighborNode);
                    frontier.push(neighborNode);
                    closedSet.add(neighborPoint);
                }
            }
        }
        // checked all possible paths: no solution was found
        return [];
    }

    heuristic(a: Point, b: Point) {
        return this.heuristicFunc(a, b);
    }
}

export class BiBFSPathfinder extends Pathfinder
{
    getAlgorithmName() {
        return 'Bidirectional Breadth First Search';
    }

    findPath(initial: Point, goal: Point) {
        this.clearRecentSearch();
        const grid = this.navigator.getGrid();
        // store the nodes visited from start direction + nodes on the start frontier, allows for fast retrieval of node (for reconstruction)
        const startVisited = new PointTable<PathNode>(grid.getWidth(), grid.getHeight());
        // store the nodes visited from end direction + nodes on the end frontier, allows for fast retrieval of node (for reconstruction)
        const endVisited = new PointTable<PathNode>(grid.getWidth(), grid.getHeight());
        // fifo queue starting from initial point to store points we haven't yet visited
        const startFrontier: PathNode[] = [];
        // fifo queue starting from goal point to store points we haven't yet visited
        const endFrontier: PathNode[] = [];
        // add the root to both frontiers and start the algorithm from both directions
        const initialRoot = new PathNode(grid.get(initial));
        startFrontier.push(initialRoot);
        startVisited.add(initial, initialRoot);
        const goalRoot = new PathNode(grid.get(goal));
        endFrontier.push(goalRoot);
        endVisited.add(goal, goalRoot);
        // continues until points have been visited
        while(startFrontier.length !== 0 && endFrontier.length !== 0) {
            // expand startQueue
            const startCurrentNode = startFrontier.shift()!;
            const startCurrentPoint = startCurrentNode.tile.point;
            this.addRecent(startCurrentNode);
            // check if the end frontier and the start frontier have collided
            if(endVisited.has(startCurrentPoint)) {
                // path from start to collision + path from collision to goal
                // path from goal to collision needs to be reversed (wrong direction)
                if(startCurrentNode.parent != null) {
                    return reconstructPath(startCurrentNode.parent)
                        .concat(reconstructPathReversed(endVisited.get(startCurrentPoint)!))
                        // must be added because goal is excluded from reconstructReversed algorithm
                        .concat(grid.get(goal));
                } else {
                    return [grid.get(goal)];
                }
            }
            this.doBFSExpansion(startFrontier, startVisited, startCurrentNode);
            // expand endQueue
            const endCurrentNode = endFrontier.shift()!;
            const endCurrentPoint = endCurrentNode.tile.point;
            this.addRecent(endCurrentNode);
            // check if the end frontier and the start frontier have collided
            if(startVisited.has(endCurrentPoint)) {
                // path from start to collision + path from collision to goal
                // path from goal to collision needs to be reversed (wrong direction)
                if(endCurrentNode.parent != null) {
                    return reconstructPath(startVisited.get(endCurrentPoint)!)
                        .concat(reconstructPathReversed(endCurrentNode.parent))
                        //must be added because goal is excluded from reconstructReversed algorithm
                        .concat(grid.get(goal));
                } else {
                    return [grid.get(goal)];
                }
            }
            this.doBFSExpansion(endFrontier, endVisited, endCurrentNode);
        }
        return [];
    }

    private doBFSExpansion(frontier: PathNode[], visited: PointTable<PathNode>, currentNode: PathNode) {
        const currentPoint = currentNode.tile.point;
        for(const neighbor of this.navigator.neighbors(currentPoint)) {
            // point hasn't been visited, we can add it to frontier
            if(!visited.has(neighbor.point)) {
                const neighborNode = new PathNode(neighbor);
                currentNode.addChild(neighborNode);
                frontier.push(neighborNode);
                visited.add(neighbor.point, neighborNode);
            }
        }
    }
}

export class DFSPathfinder extends Pathfinder
{
    getAlgorithmName() {
        return 'Depth First Search';
    }

    findPath(initial: Point, goal: Point) {
        this.clearRecentSearch();
        const grid = this.navigator.getGrid();
        const root = new PathNode(grid.get(initial));
        // lifo stack as control structure for frontier
        const frontier = new Stack<PathNode>();
        // stores points we have already visited so we don't visit them again
        const visited = new PointSet(grid.getWidth(), grid.getHeight());
        // add the root to the frontier and start the algorithm
        frontier.push(root);
        while(!frontier.isEmpty()) {
            const currentNode = frontier.pop()!;
            const currentPoint = currentNode.tile.point;
            visited.add(currentPoint);
            this.addRecent(currentNode);
            // check if we're found the solution
            if(this.navigator.equals(currentPoint, goal)) {
                return reconstructPath(currentNode);
            }
            // neighbors are added in reverse order for a more coherent visualization
            for(const neighbor of this.navigator.neighbors(currentPoint).reverse()) {
                // point hasn't been visited, we can add it to frontier
                if(!visited.has(neighbor.point)) {
                    const neighborNode = new PathNode(neighbor);
                    currentNode.addChild(neighborNode);
                    frontier.push(neighborNode);
                }
            }
        }
        // checked all possible paths: no solution was found
        return [];
    }
}

export class DijkstraPathfinder extends Pathfinder
{
    getAlgorithmName() {
        return 'Dijkstra';
    }

    findPath(initial: Point, goal: Point) {
        this.clearRecentSearch();
        const grid = this.navigator.getGrid();
        // ranks points we haven't yet visited by path cost
        const frontier = new Heap<DijkstraNode>(
            (a, b) => a.g < b.g
        );
        // stores points we have already visited so we don't visit them again
        const closedSet = new PointSet(grid.getWidth(), grid.getHeight());
        // add the root to the frontier and start the algorithm
        const root = new DijkstraNode(
            grid.get(initial), 0
        );
        frontier.push(root);
        closedSet.add(initial);
        // continues until points have been visited
        while (!frontier.isEmpty()) {
            const currentNode = frontier.pop();
            const currentPoint = currentNode.tile.point;
            this.addRecent(currentNode);
            // check if we're found the solution
            if (this.navigator.equals(currentPoint, goal)) {
                return reconstructPath(currentNode);
            }
            for (const neighbor of this.navigator.neighbors(currentPoint)) {
                const neighborPoint = neighbor.point;
                const g = currentNode.g + this.stepCost(currentPoint, neighborPoint);
                // point hasn't been visited, we can add it to frontier
                if (!closedSet.has(neighborPoint)) {
                    const neighborNode = new DijkstraNode(
                        neighbor, g
                    );
                    currentNode.addChild(neighborNode);
                    frontier.push(neighborNode);
                    closedSet.add(neighborPoint);
                }
            }
        }
        // checked all possible paths: no solution was found
        return [];
    }

    stepCost(currentPoint: Point, neighborPoint: Point) {
        return this.navigator.cost(currentPoint, neighborPoint);
    }
}