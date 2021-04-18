import {HashTable, stringify} from '../structures/Hash';
import Heap from '../structures/Heap';
import Pathfinder, {reconstructPath} from './Pathfinder';
import {Point, Tile} from '../core/Components';
import {AStarNode} from './Node';
import Navigator from '../core/Navigator';
import {euclidean, HeuristicFunc} from './Heuristics';

class JPSPathfinder extends Pathfinder
{
    private readonly heuristic: HeuristicFunc = (a: Point, b: Point) => euclidean(a,b);

    constructor(navigator: Navigator, func?: HeuristicFunc) {
        super(navigator);
        if(func !== undefined) {
            this.heuristic = func;
        }
    }

    getAlgorithmName(): string {
        return 'Jump Point Search';
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
        const openSet = new Heap<AStarNode>(
            (a, b) => a.f() < b.f()
        );
        const closedSet = new HashTable<number>();
        const root = new AStarNode(
            grid.get(initial), 0, 0
        );
        openSet.push(root);
        closedSet.add(stringify(initial), root.f());
        while (!openSet.isEmpty()) {
            const currentNode = openSet.pop();
            this.addRecent(currentNode);
            const currentPoint = currentNode.tile.point;
            if (this.navigator.equals(currentPoint, goal)) {
                return reconstructPath(currentNode);
            }
            for (const neighbor of this.navigator.neighbors(currentPoint)) {
                const neighborPoint = neighbor.point;
                const neighborKey = stringify(neighborPoint);
                const g = currentNode.g + this.stepCost(currentPoint, neighborPoint);
                const f = g + this.heuristic(neighborPoint, goal);
                if (!closedSet.has(neighborKey) || f < closedSet.get(neighborKey)!) {
                    const neighborNode = new AStarNode(
                        neighbor, g, f
                    );
                    currentNode.addChild(neighborNode);
                    openSet.push(neighborNode);
                    closedSet.add(neighborKey, neighborNode.f());
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

export default JPSPathfinder;