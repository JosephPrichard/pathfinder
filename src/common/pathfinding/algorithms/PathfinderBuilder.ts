import Navigator from '../core/Navigator';
import PlusNavigator from '../core/PlusNavigator';
import {Point} from '../core/Components';
import {Grid} from '../core/Grid';
import {
    chebyshev,
    euclidean,
    HeuristicFunc,
    manhattan,
    nullHeuristic,
    octile
} from './Heuristics';
import Pathfinder from './Pathfinder';
import AStarPathfinder from './AStarPathfinder';
import BFSPathfinder from './BFSPathfinder';
import DFSPathfinder from './DFSPathfinder';
import BiAStarPathfinder from './BiAStarPathfinder';
import BiBFSPathfinder from "./BiBFSPathfinder";

const CREATE_NAVIGATOR: {[key: string]: ((grid: Grid) => Navigator)} = {
    'plus': (grid: Grid) => new PlusNavigator(grid),
}

const CREATE_HEURISTIC: {[key: string]: (() => HeuristicFunc)} = {
    'manhattan': () => manhattan,
    'euclidean': () => euclidean,
    'chebyshev': () => chebyshev,
    'octile': () => octile,
    'null': () => nullHeuristic
}

const CREATE_PATHFINDER: {[key: string]: ((navigator: Navigator, heuristic: HeuristicFunc) => Pathfinder)} = {
    'dijkstra': (navigator) => {
        return new (class DijkstraPathfinder extends AStarPathfinder {
            getAlgorithmName() {
                return 'Dijkstra';
            }
        })(navigator, nullHeuristic);
    },
    'best-first': (navigator, heuristic) => {
        return new (class BestFirstPathfinder extends AStarPathfinder {
            stepCost(currentPoint: Point, neighborPoint: Point) {
                return 0;
            }
            getAlgorithmName() {
                return 'Best-First Search';
            }
        })(navigator, heuristic);
    },
    'a*': (navigator, heuristic) => {
        return new AStarPathfinder(navigator, heuristic);
    },
    'bfs': (navigator) => {
        return new BFSPathfinder(navigator);
    },
    'dfs': (navigator) => {
        return new DFSPathfinder(navigator);
    },
    'bi-a*': (navigator, heuristic) => {
        return new BiAStarPathfinder(navigator, heuristic);
    },
    'bi-dijkstra': (navigator) => {
        return new (class BiDijkstraPathfinder extends BiAStarPathfinder {
            getAlgorithmName() {
                return 'Bidirectional Dijkstra';
            }
        })(navigator, nullHeuristic);
    },
    'bi-bfs': (navigator) => {
        return new BiBFSPathfinder(navigator);
    }
}

class PathfinderBuilder
{
    private navigator: string = 'plus';
    private algorithm: string = 'a*';
    private heuristic: string = 'null';
    private readonly grid: Readonly<Grid>;

    constructor(grid: Readonly<Grid>) {
        this.grid = grid;
    }

    setNavigator(navigator: string) {
        navigator = navigator.toLowerCase();
        if(CREATE_NAVIGATOR[navigator] == null) {
            throw new Error('No such navigator pattern exists')
        } else {
            this.navigator = navigator;
        }
        return this;
    }

    setAlgorithm(algorithm: string) {
        algorithm = algorithm.toLowerCase();
        if(CREATE_PATHFINDER[algorithm] == null) {
            throw new Error('No such pathfinding algorithm exists')
        } else {
            this.algorithm = algorithm;
        }
        return this;
    }

    setHeuristic(heuristic: string) {
        heuristic = heuristic.toLowerCase();
        if(CREATE_HEURISTIC[heuristic] == null) {
            throw new Error('No such heuristic function exists')
        } else {
            this.heuristic = heuristic;
        }
        return this;
    }

    /**
     * Builds a pathfinder with a navigator with the set algorithm, heuristic, and navigator
     */
    build() {
        const createHeuristic = CREATE_HEURISTIC[this.heuristic];
        const createNavigator = CREATE_NAVIGATOR[this.navigator];
        const createPathfinder = CREATE_PATHFINDER[this.algorithm];
        return createPathfinder(createNavigator(this.grid), createHeuristic());
    }

    static usesHeuristic(algorithm: string) {
        return algorithm === 'a*' || algorithm === 'bi-a*' ||
            algorithm === 'best-first';
    }

    static hasBidirectional(algorithm: string) {
        return CREATE_PATHFINDER['bi-' + algorithm] != null;
    }

    static makeBidirectional(algorithm: string) {
        return 'bi-' + algorithm;
    }
}

export default PathfinderBuilder;

