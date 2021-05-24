import Navigator from '../core/Navigator';
import PlusNavigator from '../core/PlusNavigator';
import {Grid} from '../core/Grid';
import {
    chebyshev,
    euclidean,
    HeuristicFunc,
    manhattan,
    nullHeuristic,
    octile
} from '../algorithms/Heuristics';
import Pathfinder from '../algorithms/Pathfinder';
import AStarPathfinder from '../algorithms/AStarPathfinder';
import BFSPathfinder from '../algorithms/BFSPathfinder';
import DFSPathfinder from '../algorithms/DFSPathfinder';
import BiAStarPathfinder from '../algorithms/BiAStarPathfinder';
import BiBFSPathfinder from "../algorithms/BiBFSPathfinder";
import BestFirstPathfinder from '../algorithms/BestFirstPathfinder';
import DijkstraPathfinder from '../algorithms/DijkstraPathfinder';
import BiDijkstraPathfinder from '../algorithms/BiDijkstraPathfinder';

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
    'dijkstra': (navigator) => new DijkstraPathfinder(navigator),
    'best-first': (navigator, heuristic) => new BestFirstPathfinder(navigator, heuristic),
    'a*': (navigator, heuristic) => new AStarPathfinder(navigator, heuristic),
    'bfs': (navigator) => new BFSPathfinder(navigator),
    'dfs': (navigator) => new DFSPathfinder(navigator),
    'bi-a*': (navigator, heuristic) => new BiAStarPathfinder(navigator, heuristic),
    'bi-dijkstra': (navigator) => new BiDijkstraPathfinder(navigator),
    'bi-bfs': (navigator) => new BiBFSPathfinder(navigator)
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

    static usesWeights(algorithm: string) {
        return algorithm === 'a*' || algorithm === 'bi-a*' ||
            algorithm === 'best-first' || algorithm === 'dijkstra' ||
            algorithm === 'bi-dijkstra';
    }

    static hasBidirectional(algorithm: string) {
        return CREATE_PATHFINDER['bi-' + algorithm] != null;
    }

    static makeBidirectional(algorithm: string) {
        return 'bi-' + algorithm;
    }
}

export default PathfinderBuilder;

