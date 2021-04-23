import React, {RefObject} from 'react';
import GridBackground from './GridBackground';
import GridForeground from './GridForeground';
import StatsPanel from './StatsPanel';
import {Node} from '../../pathfinding/algorithms/Node';
import PathfindingSettings from '../PathfindingSettings';
import PathfinderBuilder from '../../pathfinding/algorithms/PathfinderBuilder';
import Pathfinder from '../../pathfinding/algorithms/Pathfinder';
import {Point, Tile} from '../../pathfinding/core/Components';
import {euclidean} from '../../pathfinding/algorithms/Heuristics';
import VirtualTimer from '../utility/VirtualTimer';
import TerrainGeneratorBuilder from '../../pathfinding/algorithms/TerrainGeneratorBuilder';

interface IProps {
    tileWidth: number,
    settings: Readonly<PathfindingSettings>,
    topMargin: number,
    onChangeVisualizing: (visualizing: boolean) => void;
}

interface IState {
    tilesX: number,
    tilesY: number,
    time: number,
    length: number,
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

    constructor(props: IProps) {
        super(props);
        const w = window.screen.availWidth;
        const h = window.screen.availHeight;
        const tilesX = Math.floor(w / this.props.tileWidth) + 1;
        const tilesY = Math.floor((h - this.props.topMargin - 30) / this.props.tileWidth) + 1;
        this.state = {
            tilesX: tilesX,
            tilesY: tilesY,
            time: -1,
            length: -1,
            nodes: -1,
            algorithm: ''
        }
    }

    canShowArrows = () => {
        const settings = this.props.settings;
        return settings.showArrows && settings.algorithm !== 'dfs';
    }

    canShowFrontier = () => {
        const settings = this.props.settings;
        return settings.visualizeAlg;
    }

    /**
     * Pause the delayed pathfinding algorithm being performed
     */
    pausePathfinding = () => {
        for(const timeout of this.visualTimeouts) {
            timeout.pause();
        }
    }

    /**
     * Resume the delayed pathfinding algorithm being performed
     * Will reset the timeouts to the last time the timeout was paused/started
     * if not properly called while the timeout is paused
     */
    resumePathfinding = () => {
        for(const timeout of this.visualTimeouts) {
            timeout.resume();
        }
    }

    jumpToGeneration = (generation: number) => {
        this.clearPath();
        const generations = this.generations.slice(generation);
        if(this.canShowArrows()) {
            this.addArrowGenerations(generations);
        }
        if(this.canShowFrontier()) {
            this.visualizeGenerations(generations);
        }
    }

    /**
     * Performs the pathfinding algorithm on the grid and visualizes it
     */
    doPathfinding = () => {
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
    doDelayedPathfinding = () => {
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
            let delay = 0;
            const visualizeAlg = this.canShowFrontier();
            const showArrows = this.canShowArrows();
            if(showArrows || visualizeAlg) {
                const expandVisualization = visualizeAlg ? this.visualizeGeneration : () => {};
                const expandArrows = showArrows ? this.addArrowGeneration : () => {};
                this.generations = pathfinder.getRecentGenerations();
                this.generations.forEach((generation) => {
                    const promise = new Promise<VirtualTimer>((resolve) => {
                        //each generation gets a higher timeout
                        const timeout = new VirtualTimer(() => {
                            expandArrows(generation);
                            expandVisualization(generation);
                            this.background.current!.doUpdate();
                            resolve(timeout);
                        }, delay);
                        this.visualTimeouts.push(timeout);
                    });
                    promises.push(promise);
                    delay += baseIncrement;
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
        } else { //stop visualizing if visualizing
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
    private getPathfinder = (settings: PathfindingSettings) => {
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
    private findPath = (pathfinder: Pathfinder) => {
        const foreground = this.foreground.current!;
        const t0 = performance.now();
        const path = pathfinder.findPath(foreground.state.initial, foreground.state.goal);
        const t1 = performance.now();
        const t2 = (t1 - t0);
        this.setState({
            time: t2,
            nodes: pathfinder.getRecentNodes(),
            length: calcLength(foreground.state.initial, path),
            algorithm: pathfinder.getAlgorithmName()
        });
        return path;
    }

    /**
     * Draw path on the grid and change length on ui
     * @param path
     */
    private drawPath = (path: Tile[]) => {
        const foreground = this.foreground.current!
        path.unshift(this.foreground.current!.state.grid.get(foreground.state.initial));
        this.foreground.current!.drawPath(path);
    }

    /**
     * Called when child foreground moves a tile
     */
    private onTilesDragged = () => {
        if(this.visualized) {
            this.clearVisualization();
            this.doPathfinding();
            this.visualized = true;
        }
    }

    /**
     * Create terrain on the grid foreground
     */
    createTerrain = (mazeType: number) => {
        if(this.visualizing) {
            return;
        }
        this.clearTiles();
        this.clearPath();
        this.clearVisualization();
        const foreground = this.foreground.current!;
        const end = this.calcEndPointInView();
        foreground.setState({
            initial: {
                x: 1, y:1
            },
            goal: {
                x: end.x-2, y: end.y-2
            }
        },() => {
            const prevGrid = foreground.state.grid;
            const generator = new TerrainGeneratorBuilder()
                .setDimensions(
                    prevGrid.getWidth(),
                    prevGrid.getHeight()
                )
                .setGeneratorType(mazeType)
                .setIgnorePoints([foreground.state.initial, foreground.state.goal])
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
     */
    calcEndPointInView = () => {
        const xEnd = window.innerWidth / this.props.tileWidth;
        const yEnd = (window.innerHeight - this.props.topMargin
            - this.stats.current!.getHeight()) / this.props.tileWidth;
        const xFloor = Math.floor(xEnd);
        const yFloor = Math.floor(yEnd);
        const xDecimal = xEnd - xFloor;
        const yDecimal = yEnd - yFloor;
        return {
            x: xDecimal > 0.05 ? Math.ceil(xEnd) : xFloor,
            y: yDecimal > 0.05 ? Math.ceil(yEnd) : yFloor
        }
    }

    resetPoints = () => {
        if(!this.visualizing) {
            this.foreground.current!.resetPoints();
        }
    }

    clearPath = () => {
        this.foreground.current!.erasePath();
    }

    clearTiles = () => {
        this.foreground.current!.clearTiles();
    }

    clearTilesChecked = () => {
        if(!this.visualizing) {
            this.foreground.current!.clearTiles();
        }
    }

    clearVisualization = () => {
        this.visualized = false;
        this.background.current!.clear();
    }

    clearVisualizationChecked = () => {
        if(!this.visualizing) {
            this.visualized = false;
            this.background.current!.clear();
        }
    }

    private visualizeGenerations = (generations: Node[]) => {
        this.background.current!.visualizeGenerations(generations);
        this.visualized = true;
    }

    private visualizeGeneration = (generation: Node) => {
        this.background.current!.visualizeGeneration(generation);
    }

    private addArrowGenerations = (generations: Node[]) => {
        this.background.current!.addArrowGenerations(generations);
    }

    private addArrowGeneration = (generation: Node) => {
        this.background.current!.addArrowGeneration(generation);
    }

    render() {
        return (
            <div>
                <StatsPanel ref={this.stats} algorithm={this.state.algorithm} length={this.state.length}
                            time={this.state.time} nodes={this.state.nodes}/>
                <GridBackground ref={this.background} tileWidth={this.props.tileWidth}
                                tilesX={this.state.tilesX} tilesY={this.state.tilesY}/>
                <GridForeground ref={this.foreground} topMargin={this.props.topMargin}
                                onTilesDragged={this.onTilesDragged} tileWidth={this.props.tileWidth}
                                tilesX={this.state.tilesX} tilesY={this.state.tilesY}/>
            </div>
        );
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

export default PathfindingVisualizer;