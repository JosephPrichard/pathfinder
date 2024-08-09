import { createTileData, Grid, Navigator, PlusNavigator, Point, TileData } from "./Core";
import { TerrainMazeGenerator, TerrainRandomGenerator } from "./Generators";
import {
    AStarPathfinder,
    BestFirstPathfinder,
    BiBFSPathfinder,
    DFSPathfinder,
    DijkstraPathfinder,
    HeuristicFunc,
    Heuristics,
    Pathfinder,
} from "./Pathfinders";

export const MAZE = 0;
export const MAZE_VERTICAL_SKEW = 1;
export const MAZE_HORIZONTAL_SKEW = 2;
export const RANDOM_TERRAIN = 3;

const CREATE_NAVIGATOR: { [key: string]: (grid: Grid) => Navigator } = {
    plus: (grid: Grid) => new PlusNavigator(grid),
};

const CREATE_HEURISTIC: { [key: string]: () => HeuristicFunc } = {
    manhattan: () => Heuristics.manhattan,
    euclidean: () => Heuristics.euclidean,
    chebyshev: () => Heuristics.chebyshev,
    octile: () => Heuristics.octile,
    null: () => Heuristics.nullHeuristic,
};

const CREATE_PATHFINDER: {
    [key: string]: (navigator: Navigator, heuristic: HeuristicFunc) => Pathfinder;
} = {
    dijkstra: (navigator) => new DijkstraPathfinder(navigator),
    "best-first": (navigator, heuristic) => new BestFirstPathfinder(navigator, heuristic),
    "a*": (navigator, heuristic) => new AStarPathfinder(navigator, heuristic),
    bfs: (navigator) => new BiBFSPathfinder(navigator),
    dfs: (navigator) => new DFSPathfinder(navigator),
    "bi-bfs": (navigator) => new BiBFSPathfinder(navigator),
};

export class PathfinderBuilder {
    private navigator: string = "plus";
    private algorithm: string = "a*";
    private heuristic: string = "null";
    private readonly grid: Readonly<Grid>;

    constructor(grid: Readonly<Grid>) {
        this.grid = grid;
    }

    static usesHeuristic(algorithm: string) {
        return algorithm === "a*" || algorithm === "bi-a*" || algorithm === "best-first";
    }

    static usesWeights(algorithm: string) {
        return algorithm === "a*" || algorithm === "best-first" || algorithm === "dijkstra";
    }

    static hasBidirectional(algorithm: string) {
        return CREATE_PATHFINDER["bi-" + algorithm] != null;
    }

    static makeBidirectional(algorithm: string) {
        return "bi-" + algorithm;
    }

    setNavigator(navigator: string) {
        navigator = navigator.toLowerCase();
        if (CREATE_NAVIGATOR[navigator] == null) {
            throw new Error("No such navigator pattern exists");
        } else {
            this.navigator = navigator;
        }
        return this;
    }

    setAlgorithm(algorithm: string) {
        algorithm = algorithm.toLowerCase();
        if (CREATE_PATHFINDER[algorithm] == null) {
            throw new Error("No such pathfinding algorithm exists");
        } else {
            this.algorithm = algorithm;
        }
        return this;
    }

    setHeuristic(heuristic: string) {
        heuristic = heuristic.toLowerCase();
        if (CREATE_HEURISTIC[heuristic] == null) {
            throw new Error("No such heuristic function exists");
        } else {
            this.heuristic = heuristic;
        }
        return this;
    }

    build() {
        const createHeuristic = CREATE_HEURISTIC[this.heuristic];
        const createNavigator = CREATE_NAVIGATOR[this.navigator];
        const createPathfinder = CREATE_PATHFINDER[this.algorithm];
        return createPathfinder(createNavigator(this.grid), createHeuristic());
    }
}

class TerrainGeneratorBuilder {
    private width: number = 0;
    private height: number = 0;
    private type: number = MAZE;
    private ignore: Point[] = [];
    private data: TileData = createTileData(true);

    setDimensions(width: number, height: number) {
        this.width = width;
        this.height = height;
        return this;
    }

    setGeneratorType(type: number) {
        this.type = type;
        return this;
    }

    setIgnorePoints(ignore: Point[]) {
        this.ignore = ignore.slice();
        return this;
    }

    setTileData(data: TileData) {
        this.data = data;
        return this;
    }

    build() {
        if (this.type >= RANDOM_TERRAIN) {
            return new TerrainRandomGenerator(this.width, this.height, this.data, this.ignore);
        } else {
            return new TerrainMazeGenerator(this.width, this.height, this.data, this.ignore, this.type);
        }
    }
}

export default TerrainGeneratorBuilder;
