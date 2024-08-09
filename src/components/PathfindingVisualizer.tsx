/*
 * Copyright (c) Joseph Prichard 2022.
 */

import React, { RefObject } from "react";
import GridVisualization from "./GridVisualization";
import GridForeground from "./GridForeground";
import Stats from "./Stats";
import GridBackground from "./GridBackground";
import AppSettings from "../utils/AppSettings";
import VirtualTimer from "../utils/VirtualTimer";
import { createTileData, Point, Tile, TileData } from "../pathfinding/Core";
import { PointSet } from "../pathfinding/Structures";
import TerrainGeneratorBuilder, { PathfinderBuilder, RANDOM_TERRAIN } from "../pathfinding/Builders";
import { Heuristics, Pathfinder, PathNode } from "../pathfinding/Pathfinders";

interface Props {
    tileWidth: number;
    settings: Readonly<AppSettings>;
    onChangeVisualizing: (visualizing: boolean) => void;
}

interface State {
    time: number;
    length: number;
    cost: number;
    nodes: number;
    algorithm: string;
    tilesX: number;
    tilesY: number;
}

class PathfindingVisualizer extends React.Component<Props, State> {
    // references to expose background and foreground grids to parent
    private background: RefObject<GridVisualization> = React.createRef();
    private foreground: RefObject<GridForeground> = React.createRef();

    private visualized = false;
    private visualizing = false;
    private visualTimeouts: VirtualTimer[] = [];
    private generations: PathNode[] = [];
    private paused = false;
    private wasPaused = false; // paused before alt tab?

    private mazeTile: TileData = createTileData(true);

    private readonly tileWidth: number;

    constructor(props: Props) {
        super(props);
        const w = document.documentElement.clientWidth;
        const h = document.documentElement.clientHeight;
        this.tileWidth = this.props.tileWidth;
        const tilesX = Math.floor(w / this.tileWidth) + 1;
        const tilesY = Math.floor((h - 75 - 30) / this.tileWidth) + 1;

        this.state = {
            time: -1,
            length: -1,
            cost: -1,
            nodes: -1,
            algorithm: "",
            tilesX: tilesX,
            tilesY: tilesY,
        };
    }

    onWindowResize = () => {
        const w = document.documentElement.clientWidth;
        const h = document.documentElement.clientHeight;
        const tilesX = Math.floor(w / this.tileWidth) + 1;
        const tilesY = Math.floor((h - 75 - 30) / this.tileWidth) + 1;

        this.setState((prevState) => ({
            tilesX: prevState.tilesX < tilesX ? tilesX : prevState.tilesX,
            tilesY: prevState.tilesY < tilesY ? tilesY : prevState.tilesY,
        }));
    };

    onWindowBlur = () => {
        this.wasPaused = this.isPaused();
        if (!this.wasPaused) {
            this.pausePathfinding();
        }
    };

    onWindowFocus = () => {
        if (this.isPaused() && !this.wasPaused) {
            this.resumePathfinding();
        }
    };

    componentDidMount() {
        window.addEventListener("resize", this.onWindowResize);
        window.addEventListener("blur", this.onWindowBlur);
        window.addEventListener("focus", this.onWindowFocus);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.onWindowResize);
        window.removeEventListener("blur", this.onWindowBlur);
        window.removeEventListener("focus", this.onWindowFocus);
    }

    shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<State>) {
        const prevState = this.state;
        const prevProps = this.props;
        return JSON.stringify(prevState) !== JSON.stringify(nextState) || JSON.stringify(prevProps) !== JSON.stringify(nextProps);
    }

    changeTile(data: TileData) {
        this.mazeTile = data; // enables weighted terrain
        this.foreground.current!.changeTile(data);
    }

    isPaused() {
        return this.paused;
    }

    pausePathfinding() {
        this.paused = true;
        for (const timeout of this.visualTimeouts) {
            timeout.pause();
        }
    }

    resumePathfinding() {
        this.paused = false;
        for (const timeout of this.visualTimeouts) {
            timeout.resume();
        }
    }

    doPathfinding() {
        this.clearPath();
        const settings = this.props.settings;
        const pathfinder = this.getPathfinder(settings);
        const path = this.findPath(pathfinder);
        this.generations = pathfinder.getRecentGenerations();
        this.visualizeGenerations(this.generations);
        this.addArrowGenerations(this.generations);
        this.drawPath(path);
    }

    doDelayedPathfinding() {
        const settings = this.props.settings;
        const background = this.background.current!;

        if (settings.delayInc < 20) {
            background.disableAnimations();
        } else {
            background.enableAnimations();
        }

        this.paused = false;
        this.clearVisualization();
        this.clearPath();
        this.visualized = false;
        const foreground = this.foreground.current!;
        foreground.toggleDisable();

        // start visualization if not visualizing
        if (!this.visualizing) {
            this.visualizing = true;
            this.props.onChangeVisualizing(this.visualizing);

            // perform actual shortest path calculation
            const pathfinder = this.getPathfinder(settings);
            const path = this.findPath(pathfinder);

            // initialize variables for visualization
            const promises: Promise<VirtualTimer>[] = []; //to call function when timeouts finish
            this.visualTimeouts = [];
            const baseIncrement = settings.delayInc;
            let delay = 0;
            this.generations = pathfinder.getRecentGenerations();
            const grid = pathfinder.getNavigator().getGrid();

            // to keep track of rediscovered nodes
            const generationSet = new PointSet(grid.getWidth(), grid.getHeight());

            // each generation will be visualized on a timer
            this.generations.forEach((generation) => {
                const promise = new Promise<VirtualTimer>((resolve) => {
                    // each generation gets a higher timeout
                    const timeout = new VirtualTimer(() => {
                        this.visualizeGenerationAndArrows(generation);
                        resolve(timeout);
                    }, delay);
                    this.visualTimeouts.push(timeout);
                });
                promises.push(promise);
                if (!generationSet.has(generation.tile.point)) {
                    // rediscovered nodes shouldn't add a delay to visualization
                    delay += baseIncrement;
                }
                generationSet.add(generation.tile.point);
            });

            // call functions when timeouts finish
            Promise.all(promises).then(() => {
                this.drawPath(path);
                foreground.toggleDisable();
                this.visualizing = false;
                this.visualized = true;
                this.props.onChangeVisualizing(this.visualizing);
                background.disableAnimations();
            });
        } else {
            // stop visualizing if currently visualizing
            for (const timeout of this.visualTimeouts) {
                timeout.clear();
            }
            this.visualizing = false;
            this.props.onChangeVisualizing(this.visualizing);
        }
    }

    getPathfinder(settings: AppSettings) {
        const algorithmKey = settings.algorithm;
        const algorithm =
            settings.bidirectional && PathfinderBuilder.hasBidirectional(algorithmKey)
                ? PathfinderBuilder.makeBidirectional(algorithmKey)
                : algorithmKey;
        return new PathfinderBuilder(this.foreground.current!.state.grid)
            .setAlgorithm(algorithm)
            .setHeuristic(settings.heuristicKey)
            .setNavigator(settings.navigatorKey)
            .build();
    }

    findPath(pathfinder: Pathfinder) {
        // perform pathfinding with performance calculation
        const foreground = this.foreground.current!;
        const t0 = performance.now();
        const path = pathfinder.findPath(foreground.state.initial, foreground.state.goal);
        const t1 = performance.now();
        const t2 = t1 - t0;
        this.setState({
            time: t2,
            nodes: pathfinder.getRecentNodes(),
            length: calcLength(foreground.state.initial, path),
            cost: calcCost(foreground.state.grid.get(foreground.state.initial), path),
            algorithm: pathfinder.getAlgorithmName(),
        });
        return path;
    }

    drawPath(path: Tile[]) {
        const foreground = this.foreground.current!;
        path.unshift(this.foreground.current!.state.grid.get(foreground.state.initial));
        this.foreground.current!.drawPath(path);
    }

    onTilesDragged() {
        if (this.visualized) {
            this.clearVisualization();
            this.doPathfinding();
            this.visualized = true;
        }
    }

    createTerrain(mazeType: number, useMazeTile: boolean) {
        if (this.visualizing) {
            return;
        }
        this.clearTiles();
        this.clearPath();
        this.clearVisualization();
        const foreground = this.foreground.current!;
        const end = this.calcEndPointInView();

        const newState =
            mazeType !== RANDOM_TERRAIN
                ? {
                      initial: { x: 1, y: 1 },
                      goal: { x: end.x - 2, y: end.y - 2 },
                  }
                : {
                      initial: { x: 1, y: ((end.y - 1) / 2) >> 0 },
                      goal: { x: end.x - 2, y: ((end.y - 1) / 2) >> 0 },
                  };

        foreground.setState(newState, () => {
            const prevGrid = foreground.state.grid;

            const solid: TileData = { pathCost: 1, isSolid: true };

            const generator = new TerrainGeneratorBuilder()
                .setDimensions(prevGrid.getWidth(), prevGrid.getHeight())
                .setGeneratorType(mazeType)
                .setIgnorePoints([foreground.state.initial, foreground.state.goal])
                .setTileData(useMazeTile ? this.mazeTile : solid)
                .build();
            const topLeft = { x: 1, y: 1 };
            const bottomRight = { x: end.x - 2, y: end.y - 2 };
            const grid = generator.generateTerrain(topLeft, bottomRight);
            foreground.drawGrid(grid);
        });
    }

    calcEndPointInView() {
        const end = this.calcEndPoint();
        const xEnd = end.x;
        const yEnd = end.y;
        const xFloor = Math.floor(xEnd);
        const yFloor = Math.floor(yEnd);
        const xDecimal = xEnd - xFloor;
        const yDecimal = yEnd - yFloor;
        let x = xDecimal > 0.05 ? Math.ceil(xEnd) : xFloor;
        let y = yDecimal > 0.05 ? Math.ceil(yEnd) : yFloor;
        if (x > this.state.tilesX) {
            x = this.state.tilesX;
        }
        if (y > this.state.tilesY) {
            y = this.state.tilesY;
        }
        return { x: x, y: y };
    }

    calcEndPoint() {
        const xEnd = Math.round(document.documentElement.clientWidth / this.tileWidth);
        const yEnd = Math.round((document.documentElement.clientHeight - 30 - 75) / this.tileWidth);
        return {
            x: xEnd,
            y: yEnd,
        };
    }

    resetPoints() {
        if (!this.visualizing) {
            this.foreground.current!.resetPoints();
        }
    }

    clearPath = () => {
        this.foreground.current!.erasePath();
    };

    clearTiles() {
        this.foreground.current!.clearTiles();
    }

    clearTilesChecked() {
        if (!this.visualizing) {
            this.foreground.current!.clearTiles();
        }
    }

    clearVisualization() {
        this.visualized = false;
        this.background.current!.clear();
    }

    clearVisualizationChecked() {
        if (!this.visualizing) {
            this.visualized = false;
            this.background.current!.clear();
        }
    }

    visualizeGenerations(generations: PathNode[]) {
        this.background.current!.visualizeGenerations(generations);
        this.visualized = true;
    }

    addArrowGenerations(generations: PathNode[]) {
        this.background.current!.addArrowGenerations(generations);
    }

    visualizeGenerationAndArrows(generation: PathNode) {
        this.background.current!.visualizeGenerationAndArrows(generation);
    }

    render() {
        return (
            <div>
                <Stats
                    algorithm={this.state.algorithm}
                    length={this.state.length}
                    cost={this.state.cost}
                    time={this.state.time}
                    nodes={this.state.nodes}
                />
                <div>
                    <GridBackground tileWidth={this.tileWidth} width={this.state.tilesX} height={this.state.tilesY} />
                    <GridVisualization
                        ref={this.background}
                        settings={this.props.settings}
                        tileWidth={this.tileWidth}
                        width={this.state.tilesX}
                        height={this.state.tilesY}
                    />
                    <GridForeground
                        ref={this.foreground}
                        onTilesDragged={() => this.onTilesDragged()}
                        tileSize={this.tileWidth}
                        width={this.state.tilesX}
                        height={this.state.tilesY}
                        end={this.calcEndPoint()}
                    />
                </div>
            </div>
        );
    }
}

// calculates the length of a chain of tiles starting from a point
function calcLength(initial: Point, path: Tile[]) {
    if (path.length === 0) {
        return 0;
    }
    let len = Heuristics.euclidean(initial, path[0].point);
    for (let i = 0; i < path.length - 1; i++) {
        len += Heuristics.euclidean(path[i].point, path[i + 1].point);
    }
    return +len.toFixed(3);
}

// calculates the cost of a chain of tiles starting from a point
function calcCost(initial: Tile, path: Tile[]) {
    if (path.length === 0) {
        return 0;
    }
    let len = Heuristics.euclidean(initial.point, path[0].point) * path[0].data.pathCost;
    for (let i = 0; i < path.length - 1; i++) {
        len += Heuristics.euclidean(path[i].point, path[i + 1].point) * path[i + 1].data.pathCost;
    }
    return +len.toFixed(3);
}

export default PathfindingVisualizer;
