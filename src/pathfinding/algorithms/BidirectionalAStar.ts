import {HashSet, HashTable, stringify} from '../structures/Hash';
import Heap from '../structures/Heap';
import Pathfinder, {reconstructPath, reconstructPathReversed} from './Pathfinder';
import {Point, Tile} from '../core/Components';
import {AStarNode} from './Node';
import Navigator from '../core/Navigator';
import {euclidean, HeuristicFunc} from './Heuristics';

class BiAStarPathfinder extends Pathfinder
{
    private readonly heuristic: HeuristicFunc = (a: Point, b: Point) => euclidean(a,b);

    constructor(navigator: Navigator, func?: HeuristicFunc) {
        super(navigator);
        if(func !== undefined) {
            this.heuristic = func;
        }
    }

    getAlgorithmName(): string {
        return 'Bidirectional A*';
    }

    /**
     * Performs aStar algorithm on the grid given an initial and goal point
     * Doesn't always returns the shortest path, but performs well on larger grids
     * @param initial
     * @param goal
     */
    findPath(initial: Point, goal: Point): Tile[] {
        this.clearRecentSearch();
        const grid = this.navigator.getGrid();
        const closedSet = new HashSet();
        const startOpenFrontier = new Heap<AStarNode>(
            (a, b) => a.f() < b.f()
        );
        const startOpenSet = new HashTable<AStarNode>();
        const endOpenFrontier = new Heap<AStarNode>(
            (a, b) => a.f() < b.f()
        );
        const endOpenSet = new HashTable<AStarNode>();
        const initialRoot = new AStarNode(
            grid.get(initial), 0, 0
        );
        startOpenFrontier.push(initialRoot);
        startOpenSet.add(stringify(initial), initialRoot);
        const goalRoot = new AStarNode(
            grid.get(goal), 0, 0
        );
        endOpenFrontier.push(goalRoot);
        endOpenSet.add(stringify(goal), goalRoot);
        while (!startOpenFrontier.isEmpty() && !endOpenFrontier.isEmpty()) {
            //expand startOpenFrontier
            const startCurrentNode = startOpenFrontier.pop();
            const startCurrentPoint = startCurrentNode.tile.point;
            const startCurrentPointKey = stringify(startCurrentPoint);
            startOpenSet.remove(startCurrentPointKey);
            closedSet.add(startCurrentPointKey);
            this.addRecent(startCurrentNode);
            if(endOpenSet.has(startCurrentPointKey)) {
                if(startCurrentNode.parent != null) {
                    return reconstructPath(
                        startCurrentNode.parent
                    ).concat(reconstructPathReversed(
                        endOpenSet.get(startCurrentPointKey)!
                    )).concat(
                        grid.get(goal)
                    );
                } else {
                    return [grid.get(goal)];
                }
            }
            for (const neighbor of this.navigator.neighbors(startCurrentPoint)) {
                const neighborPoint = neighbor.point;
                const neighborKey = stringify(neighborPoint);
                if(closedSet.has(neighborKey)) {
                    continue;
                }
                const g = startCurrentNode.g + this.stepCost(startCurrentPoint, neighborPoint);
                const f = g + this.heuristic(neighborPoint, goal);
                if (!startOpenSet.has(neighborKey) || g < startOpenSet.get(neighborKey)!.g) {
                    const neighborNode = new AStarNode(
                        neighbor, g, f
                    );
                    startCurrentNode.addChild(neighborNode);
                    startOpenFrontier.push(neighborNode);
                    startOpenSet.add(neighborKey, neighborNode);
                }
            }
            //expand endOpenFrontier
            const endCurrentNode = endOpenFrontier.pop();
            const endCurrentPoint = endCurrentNode.tile.point;
            const endCurrentPointKey = stringify(endCurrentPoint);
            endOpenSet.remove(endCurrentPointKey);
            closedSet.add(endCurrentPointKey);
            this.addRecent(endCurrentNode);
            if(startOpenSet.has(endCurrentPointKey)) {
                if(endCurrentNode.parent != null) {
                    return reconstructPath(
                        startOpenSet.get(endCurrentPointKey)!
                    ).concat(reconstructPathReversed(
                        endCurrentNode.parent!
                    )).concat(
                        grid.get(goal)
                    );
                } else {
                    return [grid.get(goal)];
                }
            }
            for (const neighbor of this.navigator.neighbors(endCurrentPoint)) {
                const neighborPoint = neighbor.point;
                const neighborKey = stringify(neighborPoint);
                if(closedSet.has(neighborKey)) {
                    continue;
                }
                const g = endCurrentNode.g + this.stepCost(endCurrentPoint, neighborPoint);
                const f = g + this.heuristic(neighborPoint, initial);
                if (!endOpenSet.has(neighborKey) || g < endOpenSet.get(neighborKey)!.g) {
                    const neighborNode = new AStarNode(
                        neighbor, g, f
                    );
                    endCurrentNode.addChild(neighborNode);
                    endOpenFrontier.push(neighborNode);
                    endOpenSet.add(neighborKey, neighborNode);
                }
            }
        }
        return [];
    }

    /**
     * The step-cost function to be used, calculating the cost from
     * currentPoint to neighborPoint. Uses the stepCost function provided by the
     * navigator by default but can be overridden
     * @param currentPoint
     * @param neighborPoint
     */
    stepCost(currentPoint: Point, neighborPoint: Point) {
        return this.navigator.cost(currentPoint, neighborPoint);
    }
}

export default BiAStarPathfinder;