import Pathfinder, {reconstructPath, reconstructPathReversed} from './Pathfinder';
import {DijkstraNode} from './Node';
import {Point} from '../core/Components';
import {HashTable, stringify} from '../structures/Hash';
import Heap from '../structures/Heap';

interface ControlStructures {
    frontier: Heap<DijkstraNode>,
    closedSet: HashTable<DijkstraNode>
}

class BiDijkstraPathfinder extends Pathfinder
{
    getAlgorithmName() {
        return 'Bidirectional Dijkstra';
    }

    /**
     * Implementation of Bidirectional Dijkstra to find the shortest path from initial to point
     *  One frontier is expanded starting from initial node until it reaches goal frontier
     *  Other frontier is expanded starting from goal node until it reaches initial frontier
     * Always returns the shortest path, and performs poorly on larger grids
     * @param initial
     * @param goal
     */
    findPath(initial: Point, goal: Point) {
        this.clearRecentSearch();
        const grid = this.navigator.getGrid();
        //store the nodes visited from start direction + nodes on the start frontier, allows for fast retrieval of node (for reconstruction)
        const startVisited = new HashTable<DijkstraNode>();
        //store the nodes visited from end direction + nodes on the end frontier, allows for fast retrieval of node (for reconstruction)
        const endVisited = new HashTable<DijkstraNode>();
        //ranks nodes starting from initial point we haven't yet visited by path cost
        const startFrontier = new Heap<DijkstraNode>(
            (a, b) => a.g < b.g
        );
        //ranks nodes starting from goal point we haven't yet visited by path cost
        const endFrontier = new Heap<DijkstraNode>(
            (a, b) => a.g < b.g
        );
        //add the root to both frontiers and start the algorithm from both directions
        const initialRoot = new DijkstraNode(
            grid.get(initial), 0
        );
        startFrontier.push(initialRoot);
        startVisited.add(stringify(initial), initialRoot);
        const goalRoot = new DijkstraNode(
            grid.get(goal), 0
        );
        endFrontier.push(goalRoot);
        endVisited.add(stringify(goal), goalRoot);
        //continues until points have been visited
        while(!startFrontier.isEmpty() && !endFrontier.isEmpty()) {
            //expand startFrontier
            const startCurrentNode = startFrontier.pop();
            const startCurrentPoint = startCurrentNode.tile.point;
            const startCurrentPointKey = stringify(startCurrentPoint);
            this.addRecent(startCurrentNode);
            //check if the end frontier and the start frontier have collided
            if(endVisited.has(startCurrentPointKey)) {
                //path from start to collision + path from collision to goal
                //path from goal to collision needs to be reversed (wrong direction)
                if(startCurrentNode.parent != null) {
                    return reconstructPath(
                        startCurrentNode.parent
                    ).concat(reconstructPathReversed(
                        endVisited.get(startCurrentPointKey)!
                    )).concat(
                        grid.get(goal) //must be added because goal is excluded from reconstructReversed algorithm
                    );
                } else {
                    return [grid.get(goal)];
                }
            }
            this.doDijkstraExpansion({
                frontier: startFrontier,
                closedSet: startVisited
            }, startCurrentNode);
            //expand endFrontier
            const endCurrentNode = endFrontier.pop();
            const endCurrentPoint = endCurrentNode.tile.point;
            const endCurrentPointKey = stringify(endCurrentPoint);
            this.addRecent(endCurrentNode);
            //check if the end frontier and the start frontier have collided
            if(startVisited.has(endCurrentPointKey)) {
                //path from start to collision + path from collision to goal
                //path from goal to collision needs to be reversed (wrong direction)
                if(endCurrentNode.parent != null) {
                    return reconstructPath(
                        startVisited.get(endCurrentPointKey)!
                    ).concat(reconstructPathReversed(
                        endCurrentNode.parent
                    )).concat(
                        grid.get(goal) //must be added because goal is excluded from reconstructReversed algorithm
                    );
                } else {
                    return [grid.get(goal)];
                }
            }
            this.doDijkstraExpansion({
                frontier: endFrontier,
                closedSet: endVisited
            }, endCurrentNode);
        }
        return [];
    }

    private doDijkstraExpansion(structures: ControlStructures, currentNode: DijkstraNode) {
        const currentPoint = currentNode.tile.point;
        for (const neighbor of this.navigator.neighbors(currentPoint)) {
            const neighborPoint = neighbor.point;
            const neighborKey = stringify(neighborPoint);
            const g = currentNode.g + this.stepCost(currentPoint, neighborPoint);
            //point hasn't been visited, we can add it to frontier
            if (!structures.closedSet.has(neighborKey)) {
                const neighborNode = new DijkstraNode(
                    neighbor, g
                );
                currentNode.addChild(neighborNode);
                structures.frontier.push(neighborNode);
                structures.closedSet.add(neighborKey, neighborNode);
            }
        }
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

export default BiDijkstraPathfinder;