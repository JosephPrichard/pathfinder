import React, {RefObject} from 'react';
import GridBackground from './GridBackground';
import GridForeground from './GridForeground';
import StatsPanel from './StatsPanel';
import GridStaticTiles from './GridStaticTiles';
import {Node} from '../../pathfinding/algorithms/Node';
import PathfinderBuilder from '../../pathfinding/algorithms/PathfinderBuilder';
import Pathfinder from '../../pathfinding/algorithms/Pathfinder';
import {euclidean} from '../../pathfinding/algorithms/Heuristics';
import TerrainGeneratorBuilder, {RANDOM_TERRAIN} from '../../pathfinding/algorithms/TerrainGeneratorBuilder';
import {createTile, Point, Tile, TileData} from '../../pathfinding/core/Components';
import {HashSet, stringify} from '../../pathfinding/structures/Hash';
import PathfindingSettings from '../../utils/PathfindingSettings';
import VirtualTimer from '../../utils/VirtualTimer';

interface IProps {
    tileWidth: number,
    settings: Readonly<PathfindingSettings>,
    onChangeVisualizing: (visualizing: boolean) => void;
}

interface IState {
    time: number,
    length: number,
    cost: number,
    nodes: number,
    algorithm: string
}

class PathfindingVisualizer extends React.Component<IProps,IState>
{
    //references to expose background and foreground grids to parent
    private background: RefObject<GridBackground> = React.createRef();
    private foreground: RefObject<GridForeground> = React.createRef();
    private stats: RefObject<StatsPanel> = React.createRef();

    private visualized = false;
    private visualizing = false;
    private visualTimeouts: VirtualTimer[]  = [];
    private generations: Node[] = [];
    private paused = false;
    private wasPaused = false; //paused before alt tab?

    private mazeTile: TileData = createTile(true);

    private readonly tilesX: number;
    private readonly tilesY: number;
    private readonly tileWidth: number

    constructor(props: IProps) {
        super(props);
        const w = window.screen.availWidth - (window.outerWidth - window.innerWidth);
        const h = window.screen.availHeight - (window.outerHeight - window.innerHeight);
        this.tileWidth = this.props.tileWidth;
        this.tilesX = Math.floor(w / this.tileWidth) + 1;
        this.tilesY = Math.floor((h - 75 - 30) / this.tileWidth) + 1;
        this.state = {
            time: -1,
            length: -1,
            cost: -1,
            nodes: -1,
            algorithm: ''
        }
    }

    componentDidMount() {
        window.addEventListener('blur', () => {
            this.wasPaused = this.isPaused();
            if(!this.wasPaused) {
                this.pausePathfinding();
            }
        });
        window.addEventListener('focus', () => {
            if(this.isPaused() && !this.wasPaused) {
                this.resumePathfinding();
            }
        });
    }

    shouldComponentUpdate(nextProps: Readonly<IProps>, nextState: Readonly<IState>) {
        const prevState = this.state;
        return prevState.time !== nextState.time ||
            prevState.length !== nextState.length ||
            prevState.cost !== nextState.cost ||
            prevState.nodes !== nextState.nodes ||
            prevState.algorithm !== nextState.algorithm;
    }

    changeTile(data: TileData) {
        this.mazeTile = data; //enables weighted mazes
        this.foreground.current!.changeTile(data);
    }

    canShowArrows() {
        const settings = this.props.settings;
        return settings.showArrows && settings.algorithm !== 'dfs';
    }

    canShowFrontier() {
        const settings = this.props.settings;
        return settings.visualizeAlg;
    }

    isPaused() {
        return this.paused;
    }

    /**
     * Pause the delayed pathfinding algorithm being performed
     */
    pausePathfinding() {
        this.paused = true;
        for(const timeout of this.visualTimeouts) {
            timeout.pause();
        }
    }

    /**
     * Resume the delayed pathfinding algorithm being performed
     * Will reset the timeouts to the last time the timeout was paused/started
     * if not properly called while the timeout is paused
     */
    resumePathfinding() {
        this.paused = false;
        for(const timeout of this.visualTimeouts) {
            timeout.resume();
        }
    }

    /**
     * Performs the pathfinding algorithm on the grid and visualizes it
     */
    doPathfinding() {
        this.clearPath();
        const settings = this.props.settings;
        const pathfinder = this.getPathfinder(settings);
        const path = this.findPath(pathfinder);
        this.generations = pathfinder.getRecentGenerations();
        if(this.canShowArrows()) {
            this.addArrowGenerations(this.generations);
        }
        if(this.canShowFrontier()) {
            this.visualizeGenerations(this.generations);
        }
        this.drawPath(path);
    }

    /**
     * Performs the pathfinding algorithm on the grid and visualizes it with delays between successive
     * node generations
     * If the visualizer is currently visualizing, the visualization stops instead
     */
    doDelayedPathfinding() {
        this.paused = false;
        this.clearVisualization();
        this.clearPath();
        const settings = this.props.settings;
        this.visualized = false;
        const foreground = this.foreground.current!;
        foreground.toggleDisable();
        if(!this.visualizing) { //start visualization if not visualizing
            this.visualizing = true;
            this.props.onChangeVisualizing(this.visualizing);
            const pathfinder = this.getPathfinder(settings);
            const path = this.findPath(pathfinder);
            const promises: Promise<VirtualTimer>[] = []; //to call function when timeouts finish
            this.visualTimeouts = [];
            const baseIncrement = settings.delayInc;
            const visualizeAlg = this.canShowFrontier();
            const showArrows = this.canShowArrows();
            if(showArrows || visualizeAlg) {
                let delay = 0;
                let expand: (generation: Node) => void;
                if(visualizeAlg && showArrows) {
                    expand = (generation: Node) => this.visualizeGenerationAndArrows(generation);
                } else if(visualizeAlg) {
                    expand = (generation: Node) => this.visualizeGeneration(generation);
                } else if(showArrows) {
                    expand = (generation: Node) => this.addArrowGeneration(generation);
                } else {
                    expand = () => {};
                }
                this.generations = pathfinder.getRecentGenerations();
                const generationSet = new HashSet(); //to keep track of rediscovered nodes
                this.generations.forEach((generation) => {
                    const promise = new Promise<VirtualTimer>((resolve) => {
                        //each generation gets a higher timeout
                        const timeout = new VirtualTimer(() => {
                            expand(generation);
                            resolve(timeout);
                        }, delay);
                        this.visualTimeouts.push(timeout);
                    });
                    promises.push(promise);
                    if(!generationSet.has(stringify(generation.tile.point))) {
                        //rediscovered nodes shouldn't add a delay to visualization
                        delay += baseIncrement;
                    }
                    generationSet.add(stringify(generation.tile.point));
                });
            }
            //call functions when timeouts finish
            Promise.all(promises).then(() => {
                this.drawPath(path);
                foreground.toggleDisable();
                this.visualizing = false;
                this.visualized = true;
                this.props.onChangeVisualizing(this.visualizing);
            });
        } else { //stop visualizing if currently visualizing
            for (const timeout of this.visualTimeouts) {
                timeout.clear();
            }
            this.visualizing = false;
            this.props.onChangeVisualizing(this.visualizing);
        }
    }

    /**
     * Get the pathfinder for the settings
     * @param settings
     */
    getPathfinder(settings: PathfindingSettings) {
        const algorithmKey = settings.algorithm;
        const algorithm = settings.bidirectional && PathfinderBuilder.hasBidirectional(algorithmKey) ?
            PathfinderBuilder.makeBidirectional(algorithmKey) : algorithmKey;
        return new PathfinderBuilder(this.foreground.current!.state.grid)
            .setAlgorithm(algorithm)
            .setHeuristic(settings.heuristicKey)
            .setNavigator(settings.navigatorKey)
            .build();
    }

    /**
     * Find path with a given pathfinder, includes benchmarking
     * @param pathfinder
     */
     findPath(pathfinder: Pathfinder) {
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
            algorithm: pathfinder.getAlgorithmName()
        });
        return path;
    }

    /**
     * Draw path on the grid and change length on ui
     * @param path
     */
    drawPath(path: Tile[]) {
        const foreground = this.foreground.current!
        path.unshift(this.foreground.current!.state.grid.get(foreground.state.initial));
        this.foreground.current!.drawPath(path);
    }

    /**
     * Called when child foreground moves a tile
     */
    onTilesDragged() {
        if(this.visualized) {
            this.clearVisualization();
            this.doPathfinding();
            this.visualized = true;
        }
    }

    /**
     * Create terrain on the grid foreground
     */
    createTerrain(mazeType: number, useMazeTile: boolean) {
        if(this.visualizing) {
            return;
        }
        this.clearTiles();
        this.clearPath();
        this.clearVisualization();
        const foreground = this.foreground.current!;
        const end = this.calcEndPointInView();
        const newState = (mazeType !== RANDOM_TERRAIN) ? {
            initial: {
                x: 1, y: 1
            },
            goal: {
                x: end.x-2, y: end.y-2
            }
        } : {
            initial: {
                x: 1, y: ((end.y-1) / 2) >> 0
            },
            goal: {
                x: end.x-2, y: ((end.y-1) / 2) >> 0
            }
        };
        foreground.setState(newState,() => {
            const prevGrid = foreground.state.grid;
            const generator = new TerrainGeneratorBuilder()
                .setDimensions(
                    prevGrid.getWidth(),
                    prevGrid.getHeight()
                )
                .setGeneratorType(mazeType)
                .setIgnorePoints([foreground.state.initial, foreground.state.goal])
                .setTileData(useMazeTile ? this.mazeTile : getSolid())
                .build();
            const topLeft = {
                x: 1, y: 1
            };
            const bottomRight = {
                x: end.x-2, y: end.y-2
            };
            const grid = generator.generateTerrain(topLeft, bottomRight);
            foreground.drawGrid(grid);
        });
    }

    /**
     * Calculate the end/goal point in common of the screen
     */
    calcEndPointInView() {
        const xEnd = window.innerWidth / this.tileWidth;
        const yEnd = (window.innerHeight - 75 - this.stats.current!.getHeight()) / this.tileWidth;
        const xFloor = Math.floor(xEnd);
        const yFloor = Math.floor(yEnd);
        const xDecimal = xEnd - xFloor;
        const yDecimal = yEnd - yFloor;
        let x = xDecimal > 0.05 ? Math.ceil(xEnd) : xFloor;
        let y = yDecimal > 0.05 ? Math.ceil(yEnd) : yFloor;
        if(x > this.tilesX) {
            x = this.tilesX
        }
        if(y > this.tilesY) {
            y = this.tilesY
        }
        return {
            x: x, y: y
        }
    }

    resetPoints() {
        if(!this.visualizing) {
            this.foreground.current!.resetPoints();
        }
    }

    clearPath = () => {
        this.foreground.current!.erasePath();
    }

    clearTiles() {
        this.foreground.current!.clearTiles();
    }

    clearTilesChecked() {
        if(!this.visualizing) {
            this.foreground.current!.clearTiles();
        }
    }

    clearVisualization() {
        this.visualized = false;
        this.background.current!.clear();
    }

    clearVisualizationChecked() {
        if(!this.visualizing) {
            this.visualized = false;
            this.background.current!.clear();
        }
    }

    visualizeGenerations(generations: Node[]) {
        this.background.current!.visualizeGenerations(generations);
        this.visualized = true;
    }

    visualizeGeneration(generation: Node) {
        this.background.current!.visualizeGeneration(generation);
    }

    addArrowGenerations(generations: Node[]) {
        this.background.current!.addArrowGenerations(generations);
    }

    addArrowGeneration(generation: Node) {
        this.background.current!.addArrowGeneration(generation);
    }

    visualizeGenerationAndArrows(generation: Node) {
        this.background.current!.visualizeGenerationAndArrows(generation);
    }

    render() {
        return (
            <div>
                <StatsPanel
                    ref={this.stats}
                    algorithm={this.state.algorithm}
                    length={this.state.length}
                    cost={this.state.cost}
                    time={this.state.time}
                    nodes={this.state.nodes}
                />
                <div>
                    <GridStaticTiles
                        tileWidth={this.tileWidth}
                        tilesX={this.tilesX}
                        tilesY={this.tilesY}
                    />
                    <GridBackground
                        ref={this.background}
                        tileWidth={this.tileWidth}
                        tilesX={this.tilesX}
                        tilesY={this.tilesY}
                    />
                    <GridForeground
                        ref={this.foreground}
                        topMargin={75}
                        onTilesDragged={() => this.onTilesDragged()}
                        tileSize={this.tileWidth}
                        tilesX={this.tilesX}
                        tilesY={this.tilesY}
                    />
                </div>
            </div>
        );
    }
}

function getSolid() {
    return {
        pathCost: 1,
        isSolid: true
    }
}

function calcLength(initial: Point, path: Tile[]) {
    if(path.length === 0) {
        return 0;
    }
    let len = euclidean(initial, path[0].point);
    for (let i = 0; i < path.length - 1; i++) {
        len += euclidean(path[i].point, path[i + 1].point);
    }
    return +(len).toFixed(3);
}

function calcCost(initial: Tile, path: Tile[]) {
    if(path.length === 0) {
        return 0;
    }
    let len = euclidean(initial.point, path[0].point) * path[0].data.pathCost;
    for (let i = 0; i < path.length - 1; i++) {
        len += euclidean(path[i].point, path[i + 1].point) * path[i + 1].data.pathCost;
    }
    return +(len).toFixed(3);
}

export default PathfindingVisualizer;