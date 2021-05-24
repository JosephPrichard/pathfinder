import Pathfinder, {reconstructPath} from './Pathfinder';
import {euclidean, HeuristicFunc} from './Heuristics';
import {BestFirstNode} from './Node';
import {Point} from '../core/Components';
import Navigator from '../core/Navigator';
import {HashSet, stringify} from '../structures/Hash';
import Heap from '../structures/Heap';

class BestFirstPathfinder extends Pathfinder
{
    private readonly heuristicFunc: HeuristicFunc = (a: Point, b: Point) => euclidean(a,b);

    constructor(navigator: Navigator, func?: HeuristicFunc) {
        super(navigator);
        if(func !== undefined) {
            this.heuristicFunc = func;
        }
    }

    getAlgorithmName() {
        return 'Best-First Search';
    }

    /**
     * Performs best first search algorithm on the grid given an initial and goal point
     *  Similar to the implementation of AStar, but with a null step cost function
     *  Includes best first search specific optimizations
     * Always returns the shortest path, and performs well on larger grids
     * @param initial
     * @param goal
     */
    findPath(initial: Point, goal: Point) {
        this.clearRecentSearch();
        const grid = this.navigator.getGrid();
        //ranks points we haven't yet visited by heuristic
        const frontier = new Heap<BestFirstNode>(
            (a, b) => a.h < b.h
        );
        //stores points we have already visited so we don't visit them again
        const closedSet = new HashSet();
        //add the root to the frontier and start the algorithm
        const root = new BestFirstNode(
            grid.get(initial), 0
        );
        frontier.push(root);
        closedSet.add(stringify(initial));
        //continues until points have been visited
        while (!frontier.isEmpty()) {
            const currentNode = frontier.pop();
            const currentPoint = currentNode.tile.point;
            this.addRecent(currentNode);
            //check if we're found the solution
            if (this.navigator.equals(currentPoint, goal)) {
                return reconstructPath(currentNode);
            }
            for (const neighbor of this.navigator.neighbors(currentPoint)) {
                const neighborPoint = neighbor.point;
                const neighborKey = stringify(neighborPoint);
                const h = this.heuristic(neighborPoint, goal);
                //point hasn't been visited, we can add it to frontier
                if (!closedSet.has(neighborKey)) {
                    const neighborNode = new BestFirstNode(
                        neighbor, h
                    );
                    currentNode.addChild(neighborNode);
                    frontier.push(neighborNode);
                    closedSet.add(neighborKey);
                }
            }
        }
        //checked all possible paths: no solution was found
        return [];
    }

    /**
     * Heuristic function used to estimate distance between points a and b
     * @param a
     * @param b
     */
    heuristic(a: Point, b: Point) {
        return this.heuristicFunc(a, b);
    }
}

export default BestFirstPathfinder;