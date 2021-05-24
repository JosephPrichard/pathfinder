import Pathfinder, {reconstructPath} from './Pathfinder';
import {euclidean, HeuristicFunc} from './Heuristics';
import {AStarNode} from './Node';
import {Point} from '../core/Components';
import Navigator from '../core/Navigator';
import {HashSet, HashTable, stringify} from '../structures/Hash';
import Heap from '../structures/Heap';

class AStarPathfinder extends Pathfinder
{
    private readonly heuristicFunc: HeuristicFunc = (a: Point, b: Point) => euclidean(a,b);
    private readonly p: number; //tie breaker

    constructor(navigator: Navigator, func?: HeuristicFunc) {
        super(navigator);
        const grid = this.getNavigator().getGrid();
        //minimum cost of taking one step / expected maximum path length
        this.p = 1/(grid.getWidth() * grid.getHeight());
        if(func !== undefined) {
            this.heuristicFunc = func;
        }
    }

    getAlgorithmName() {
        return 'A*';
    }

    /**
     * Performs aStar algorithm on the grid given an initial and goal point
     * Always returns the shortest path, and performs well on larger grids
     * @param initial
     * @param goal
     */
    findPath(initial: Point, goal: Point) {
        this.clearRecentSearch();
        const grid = this.navigator.getGrid();
        //ranks nodes we haven't yet visited by f-score
        const openFrontier = new Heap<AStarNode>(
            (a, b) => a.f() < b.f()
        );
        //stores points we have already visited so we don't visit them again
        const closedSet = new HashSet();
        //stores the contents of the frontier to allow for fast retrieval of f-score
        const openSet = new HashTable<number>();
        //add the root to the frontier and start the algorithm
        const root = new AStarNode(
            grid.get(initial), 0, 0
        );
        openFrontier.push(root);
        openSet.add(stringify(initial), root.g);
        //continues until points have been visited
        while (!openFrontier.isEmpty()) {
            const currentNode = openFrontier.pop();
            const currentPoint = currentNode.tile.point;
            const currentKey = stringify(currentPoint);
            openSet.remove(currentKey);
            //a point may be popped off the frontier again if it was re-evaluated, pre-eval nodes should be ignored
            if(closedSet.has(currentKey)) {
                continue;
            }
            closedSet.add(currentKey);
            this.addRecent(currentNode);
            //check if we're found the solution
            if (this.navigator.equals(currentPoint, goal)) {
                return reconstructPath(currentNode);
            }
            for (const neighbor of this.navigator.neighbors(currentPoint)) {
                const neighborPoint = neighbor.point;
                const neighborKey = stringify(neighborPoint);
                //point has already been visited
                if(closedSet.has(neighborKey)) {
                    continue;
                }
                const g = currentNode.g + this.stepCost(currentPoint, neighborPoint);
                const f = g + this.heuristic(neighborPoint, goal);
                //re-evaluation: a point that is already in the openSet may be added again if the path to get there was less expensive
                if (!openSet.has(neighborKey) || g < openSet.get(neighborKey)!) {
                    const neighborNode = new AStarNode(
                        neighbor, g, f
                    );
                    currentNode.addChild(neighborNode);
                    openFrontier.push(neighborNode);
                    openSet.add(neighborKey, neighborNode.g);
                }
            }
        }
        //checked all possible paths: no solution was found
        return [];
    }

    /**
     * Heuristic function used to estimate distance between points a and b
     * Includes tie breaker to prevent exploring lots of identical paths
     * @param a
     * @param b
     */
    heuristic(a: Point, b: Point) {
        return this.heuristicFunc(a, b) * (1 + this.p);
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