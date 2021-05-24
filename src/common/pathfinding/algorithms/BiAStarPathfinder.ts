import Pathfinder, {reconstructPath, reconstructPathReversed} from './Pathfinder';
import {euclidean, HeuristicFunc} from './Heuristics';
import {AStarNode} from './Node';
import {Point} from '../core/Components';
import Navigator from '../core/Navigator';
import {HashSet, HashTable, stringify} from '../structures/Hash';
import Heap from '../structures/Heap';

interface ControlStructures {
    openSet: HashTable<AStarNode>,
    closedSet: HashSet,
    openFrontier: Heap<AStarNode>
}

class BiAStarPathfinder extends Pathfinder
{
    private readonly heuristic: HeuristicFunc = (a: Point, b: Point) => euclidean(a,b);

    constructor(navigator: Navigator, func?: HeuristicFunc) {
        super(navigator);
        if(func !== undefined) {
            this.heuristic = func;
        }
    }

    getAlgorithmName() {
        return 'Bidirectional A*';
    }

    /**
     * Performs Bidirectional AStar algorithm on the grid given an initial and goal point
     *  One frontier is expanded starting from initial node until it reaches goal frontier
     *  Other frontier is expanded starting from goal node until it reaches initial frontier
     * Doesn't always returns the shortest path, but performs well on larger grids
     * @param initial
     * @param goal
     */
    findPath(initial: Point, goal: Point) {
        this.clearRecentSearch();
        const grid = this.navigator.getGrid();
        //stores points we have already visited (from either direction) so we don't visit them again
        const closedSet = new HashSet();
        //ranks nodes starting from initial point we haven't yet visited by f-score
        const startOpenFrontier = new Heap<AStarNode>(
            (a, b) => a.f() < b.f()
        );
        //stores the contents of the frontier starting from initial point to allow for fast retrieval of node (for f-score and reconstruction)
        const startOpenSet = new HashTable<AStarNode>();
        //ranks nodes starting from goal point we haven't yet visited by f-score
        const endOpenFrontier = new Heap<AStarNode>(
            (a, b) => a.f() < b.f()
        );
        //stores the contents of the frontier starting from goal point to allow for fast retrieval of node (for f-score and reconstruction)
        const endOpenSet = new HashTable<AStarNode>();
        //add the root to both frontiers and start the algorithm from both directions
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
        //continues until points have been visited
        while (!startOpenFrontier.isEmpty() && !endOpenFrontier.isEmpty()) {
            //expand startOpenFrontier
            const startCurrentNode = startOpenFrontier.pop();
            const startCurrentPoint = startCurrentNode.tile.point;
            const startCurrentPointKey = stringify(startCurrentPoint);
            startOpenSet.remove(startCurrentPointKey);
            //a point may be popped off the frontier again if it was re-evaluated, pre-eval nodes should be ignored
            if(closedSet.has(startCurrentPointKey)) {
                continue;
            }
            closedSet.add(startCurrentPointKey);
            this.addRecent(startCurrentNode);
            //check if the end frontier and the start frontier have collided
            if(endOpenSet.has(startCurrentPointKey)) {
                if(startCurrentNode.parent != null) {
                    //path from start to collision + path from collision to goal
                    //path from goal to collision needs to be reversed (wrong direction)
                    return reconstructPath(
                        startCurrentNode.parent!
                    ).concat(reconstructPathReversed(
                        endOpenSet.get(startCurrentPointKey)!
                    )).concat(
                        grid.get(goal) //must be added because goal is excluded from reconstructReversed algorithm
                    );
                } else {
                    //node has no parent, initial and goal nodes are neighbors
                    return [grid.get(goal)];
                }
            }
            this.doAStarExpansion({
                openFrontier: startOpenFrontier,
                openSet: startOpenSet,
                closedSet: closedSet
            }, startCurrentNode, goal);
            //expand endOpenFrontier
            const endCurrentNode = endOpenFrontier.pop();
            const endCurrentPoint = endCurrentNode.tile.point;
            const endCurrentPointKey = stringify(endCurrentPoint);
            endOpenSet.remove(endCurrentPointKey);
            //a point may be popped off the frontier again if it was re-evaluated, pre-eval nodes should be ignored
            if(closedSet.has(endCurrentPointKey)) {
                continue;
            }
            closedSet.add(endCurrentPointKey);
            this.addRecent(endCurrentNode);
            //check if the end frontier and the start frontier have collided
            if(startOpenSet.has(endCurrentPointKey)) {
                if(endCurrentNode.parent != null) {
                    //path from start to collision + path from collision to goal
                    //path from goal to collision needs to be reversed (wrong direction)
                    return reconstructPath(
                        startOpenSet.get(endCurrentPointKey)!
                    ).concat(reconstructPathReversed(
                        endCurrentNode.parent!
                    )).concat(
                        grid.get(goal) //must be added because goal is excluded from reconstructReversed algorithm
                    );
                } else {
                    //node has no parent, initial and goal nodes are neighbors
                    return [grid.get(goal)];
                }
            }
            this.doAStarExpansion({
                openFrontier: endOpenFrontier,
                openSet: endOpenSet,
                closedSet: closedSet
            }, endCurrentNode, initial);
        }
        //checked all possible paths: no solution was found
        return [];
    }

    /**
     * Implementation of AStar expansion algorithm for the bidirectional AStar algorithm
     * @param structures
     * @param currentNode
     * @param endPoint
     * @private
     */
    private doAStarExpansion(structures: ControlStructures, currentNode: AStarNode, endPoint: Point) {
        const currentPoint = currentNode.tile.point;
        for (const neighbor of this.navigator.neighbors(currentPoint)) {
            const neighborPoint = neighbor.point;
            const neighborKey = stringify(neighborPoint);
            //point has already been visited
            if(structures.closedSet.has(neighborKey)) {
                continue;
            }
            const g = currentNode.g + this.stepCost(currentPoint, neighborPoint);
            const f = g + this.heuristic(neighborPoint, endPoint);
            //re-evaluation: a point that is already in the openSet may be added again if the path to get there was less expensive
            if (!structures.openSet.has(neighborKey) || g < structures.openSet.get(neighborKey)!.g) {
                const neighborNode = new AStarNode(
                    neighbor, g, f
                );
                currentNode.addChild(neighborNode);
                structures.openFrontier.push(neighborNode);
                structures.openSet.add(neighborKey, neighborNode);
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

export default BiAStarPathfinder;