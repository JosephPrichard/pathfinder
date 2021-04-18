import {HashTable, stringify} from '../structures/Hash';
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
     * Always returns the shortest path, and performs well on larger grids
     * @param initial
     * @param goal
     */
    findPath(initial: Point, goal: Point): Tile[] {
        this.clearRecentSearch();
        const grid = this.navigator.getGrid();
        const startOpenSet = new Heap<AStarNode>(
            (a, b) => a.f() < b.f()
        );
        const startClosedSet = new HashTable<AStarNode>();
        const endOpenSet = new Heap<AStarNode>(
            (a, b) => a.f() < b.f()
        );
        const endClosedSet = new HashTable<AStarNode>();
        const initialRoot = new AStarNode(
            grid.get(initial), 0, 0
        );
        startOpenSet.push(initialRoot);
        startClosedSet.add(stringify(initial), initialRoot);
        const goalRoot = new AStarNode(
            grid.get(goal), 0, 0
        );
        endOpenSet.push(goalRoot);
        endClosedSet.add(stringify(goal), goalRoot);
        while (!startOpenSet.isEmpty() && !endOpenSet.isEmpty()) {
            //expand startOpenSet
            const startCurrentNode = startOpenSet.pop();
            this.addRecent(startCurrentNode);
            const startCurrentPoint = startCurrentNode.tile.point;
            const startCurrentPointKey = stringify(startCurrentPoint);
            if(endClosedSet.has(startCurrentPointKey)) {
                if(startCurrentNode.parent != null) {
                    return reconstructPath(
                        startCurrentNode.parent
                    ).concat(reconstructPathReversed(
                        endClosedSet.get(startCurrentPointKey)!
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
                const g = startCurrentNode.g + this.stepCost(startCurrentPoint, neighborPoint);
                const f = g + this.heuristic(neighborPoint, goal);
                if (!startClosedSet.has(neighborKey) || f < startClosedSet.get(neighborKey)!.f()) {
                    const neighborNode = new AStarNode(
                        neighbor, g, f
                    );
                    startCurrentNode.addChild(neighborNode);
                    startOpenSet.push(neighborNode);
                    startClosedSet.add(neighborKey, neighborNode);
                }
            }
            //expand closedOpenSet
            const endCurrentNode = endOpenSet.pop();
            this.addRecent(endCurrentNode);
            const endCurrentPoint = endCurrentNode.tile.point;
            const endCurrentPointKey = stringify(endCurrentPoint);
            if(startClosedSet.has(endCurrentPointKey)) {
                if(endCurrentNode.parent != null) {
                    return reconstructPath(
                        startClosedSet.get(endCurrentPointKey)!
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
                const g = endCurrentNode.g + this.stepCost(endCurrentPoint, neighborPoint);
                const f = g + this.heuristic(neighborPoint, initial);
                if (!endClosedSet.has(neighborKey) || f < endClosedSet.get(neighborKey)!.f()) {
                    const neighborNode = new AStarNode(
                        neighbor, g, f
                    );
                    endCurrentNode.addChild(neighborNode);
                    endOpenSet.push(neighborNode);
                    endClosedSet.add(neighborKey, neighborNode);
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