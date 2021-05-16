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
import {createTileData, Point, Tile, TileData} from '../../pathfinding/core/Components';
import {HashSet, stringify} from '../../pathfinding/structures/Hash';
import AppSettings from '../../utils/AppSettings';
import VirtualTimer from '../../utils/VirtualTimer';

interface IProps {
    tileWidth: number,
    settings: Readonly<AppSettings>,
    onChangeVisualizing: (visualizing: boolean) => void;
}

interface IState {
    time: number,
    length: number,
    cost: number,
    nodes: number,
    algorithm: string
}

/**
 * Component to encapsulate and perform all pathfinding operations
 * Exposes functions to initiate pathfinding or draw terrain
 */
class PathfindingVisualizer extends React.Component<IProps,IState>
{
    //references to expose background and foreground grids to parent
    private background: RefObject<GridBackground> = React.createRef();
    private foreground: RefObject<GridForeground> = React.createRef();

    private visualized = false;
    private visualizing = false;
    private visualTimeouts: VirtualTimer[]  = [];
    private generations: Node[] = [];
    private paused = false;
    private wasPaused = false; //paused before alt tab?

    private mazeTile: TileData = createTileData(true);

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

    onWindowBlur = () => {
        this.wasPaused = this.isPaused();
        if(!this.wasPaused) {
            this.pausePathfinding();
        }
    }

    onWindowFocus = () => {
        if(this.isPaused() && !this.wasPaused) {
            this.resumePathfinding();
        }
    }

    /**
     * Automatically pause/resume the visualization when user alt tabs
     */
    componentDidMount() {
        window.addEventListener('blur', this.onWindowBlur);
        window.addEventListener('focus', this.onWindowFocus);
    }

    componentWillUnmount() {
        window.removeEventListener('blur', this.onWindowBlur);
        window.removeEventListener('focus', this.onWindowFocus);
    }

    /**
     * Prevents pathfinding visualizer from being updated unless the algorithm stats
     * have changed (meaning an algorithm was visualized)
     * Doesn't prevent Foreground and background from being updated automatically
     * when their state changes
     * @param nextProps
     * @param nextState
     */
    shouldComponentUpdate(nextProps: Readonly<IProps>, nextState: Readonly<IState>) {
        const prevState = this.state;
        const prevProps = this.props;
        return prevProps.settings.showArrows !== nextProps.settings.showArrows ||
            prevProps.settings.showScores !== nextProps.settings.showScores ||
            prevState.time !== nextState.time ||
            prevState.length !== nextState.length ||
            prevState.cost !== nextState.cost ||
            prevState.nodes !== nextState.nodes ||
            prevState.algorithm !== nextState.algorithm;
    }

    changeTile(data: TileData) {
        this.mazeTile = data; //enables weighted terrain
        this.foreground.current!.changeTile(data);
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
        this.visualizeGenerations(this.generations);
        this.addArrowGenerations(this.generations);
        this.drawPath(path);
    }

    /**
     * Performs the pathfinding algorithm on the grid and visualizes it with delays between successive
     * node generations
     * If the visualizer is currently visualizing, the visualization stops instead
     */
    doDelayedPathfinding() {
        const settings = this.props.settings;
        const background = this.background.current!;
        background.setLastAlgo(settings.algorithm)
        background.enableAnimations();
        this.paused = false;
        this.clearVisualization();
        this.clearPath();
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
            let delay = 0;
            this.generations = pathfinder.getRecentGenerations();
            const generationSet = new HashSet(); //to keep track of rediscovered nodes
            this.generations.forEach((generation) => {
                const promise = new Promise<VirtualTimer>((resolve) => {
                    //each generation gets a higher timeout
                    const timeout = new VirtualTimer(() => {
                        this.visualizeGenerationAndArrows(generation);
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
            //call functions when timeouts finish
            Promise.all(promises).then(() => {
                this.drawPath(path);
                foreground.toggleDisable();
                this.visualizing = false;
                this.visualized = true;
                this.props.onChangeVisualizing(this.visualizing);
                background.disableAnimations();
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
    getPathfinder(settings: AppSettings) {
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
     * Calculate the end/goal point in view of the screen
     * Used to calculate the terrain dimensions
     */
    calcEndPointInView() {
        const xEnd = window.innerWidth / this.tileWidth;
        const yEnd = (window.innerHeight - 75 - 30) / this.tileWidth;
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

    calcEndPoint() {
        const xEnd = Math.round(window.innerWidth / this.tileWidth);
        const yEnd = Math.round((window.innerHeight - 30 - 75) / this.tileWidth);
        return {
            x: xEnd, y: yEnd
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

    addArrowGenerations(generations: Node[]) {
        this.background.current!.addArrowGenerations(generations);
    }

    visualizeGenerationAndArrows(generation: Node) {
        this.background.current!.visualizeGenerationAndArrows(generation);
    }

    render() {
        return (
            <div>
                <StatsPanel
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
                        settings={this.props.settings}
                        tileWidth={this.tileWidth}
                        tilesX={this.tilesX}
                        tilesY={this.tilesY}
                    />
                    <GridForeground
                        ref={this.foreground}
                        onTilesDragged={() => this.onTilesDragged()}
                        tileSize={this.tileWidth}
                        tilesX={this.tilesX}
                        tilesY={this.tilesY}
                        end={this.calcEndPoint()}
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