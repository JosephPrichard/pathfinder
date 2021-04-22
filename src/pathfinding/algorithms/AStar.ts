import {HashSet, HashTable, stringify} from '../structures/Hash';
import Heap from '../structures/Heap';
import Pathfinder, {reconstructPath} from './Pathfinder';
import {Point, Tile} from '../core/Components';
import {AStarNode} from './Node';
import Navigator from '../core/Navigator';
import {euclidean, HeuristicFunc} from './Heuristics';

class AStarPathfinder extends Pathfinder
{
    private readonly heuristic: HeuristicFunc = (a: Point, b: Point) => euclidean(a,b);
    private readonly isNewScoreBetter: (newF: number, oldF: number) => boolean;

    constructor(navigator: Navigator, func?: HeuristicFunc, canRediscover?: boolean) {
        super(navigator);
        if(func !== undefined) {
            this.heuristic = func;
        }
        this.isNewScoreBetter = canRediscover === undefined || canRediscover ?
            (newScore: number, oldScore: number) => newScore < oldScore :
            () => false;
    }

    getAlgorithmName(): string {
        return 'A*';
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
        const openFrontier = new Heap<AStarNode>(
            (a, b) => a.f() < b.f()
        );
        const closedSet = new HashSet();
        const openSet = new HashTable<number>();
        const root = new AStarNode(
            grid.get(initial), 0, 0
        );
        openFrontier.push(root);
        openSet.add(stringify(initial), root.g);
        while (!openFrontier.isEmpty()) {
            const currentNode = openFrontier.pop();
            const currentPoint = currentNode.tile.point;
            const currentKey = stringify(currentPoint);
            openSet.remove(currentKey);
            closedSet.add(currentKey);
            this.addRecent(currentNode);
            if (this.navigator.equals(currentPoint, goal)) {
                return reconstructPath(currentNode);
            }
            for (const neighbor of this.navigator.neighbors(currentPoint)) {
                const neighborPoint = neighbor.point;
                const neighborKey = stringify(neighborPoint);
                if(closedSet.has(neighborKey)) {
                    continue;
                }
                const g = currentNode.g + this.stepCost(currentPoint, neighborPoint);
                const f = g + this.heuristic(neighborPoint, goal);
                if (!openSet.has(neighborKey) || this.isNewScoreBetter(g, openSet.get(neighborKey)!)) {
                    const neighborNode = new AStarNode(
                        neighbor, g, f
                    );
                    currentNode.addChild(neighborNode);
                    openFrontier.push(neighborNode);
                    openSet.add(neighborKey, neighborNode.g);
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

export default AStarPathfinder;