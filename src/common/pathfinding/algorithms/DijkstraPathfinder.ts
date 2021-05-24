import Pathfinder, {reconstructPath} from './Pathfinder';
import {DijkstraNode} from './Node';
import {Point} from '../core/Components';
import {HashSet, stringify} from '../structures/Hash';
import Heap from '../structures/Heap';

class DijkstraPathfinder extends Pathfinder
{
    getAlgorithmName() {
        return 'Dijkstra';
    }

    /**
     * Performs dijkstra's algorithm on the grid given an initial and goal point
     *  Similar to the implementation of AStar, but with a null heuristic function
     *  Includes dijkstra specific optimizations
     * Always returns the shortest path, and performs poorly on larger grids
     * @param initial
     * @param goal
     */
    findPath(initial: Point, goal: Point) {
        this.clearRecentSearch();
        const grid = this.navigator.getGrid();
        //ranks points we haven't yet visited by path cost
        const frontier = new Heap<DijkstraNode>(
            (a, b) => a.g < b.g
        );
        //stores points we have already visited so we don't visit them again
        const closedSet = new HashSet();
        //add the root to the frontier and start the algorithm
        const root = new DijkstraNode(
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
                const g = currentNode.g + this.stepCost(currentPoint, neighborPoint);
                //point hasn't been visited, we can add it to frontier
                if (!closedSet.has(neighborKey)) {
                    const neighborNode = new DijkstraNode(
                        neighbor, g
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

export default DijkstraPathfinder;