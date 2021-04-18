import React, {RefObject} from 'react';
import GridBackground from './GridBackground';
import GridForeground from './GridForeground';
import StatsPanel from './StatsPanel';
import {Node} from '../../pathfinding/algorithms/Node';
import PathfindingSettings from '../PathfindingSettings';
import PathfinderBuilder from '../../pathfinding/algorithms/PathfinderBuilder';
import Pathfinder from '../../pathfinding/algorithms/Pathfinder';
import MazeGenerator from '../../pathfinding/algorithms/MazeGenerator';
import {Point, Tile} from '../../pathfinding/core/Components';
import {euclidean} from '../../pathfinding/algorithms/Heuristics';

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
    private visualTimeouts: NodeJS.Timeout[]  = [];

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

    /**
     * Performs the pathfinding algorithm on the grid and visualizes it
     */
    doPathfinding = () => {
        const settings = this.props.settings;
        const pathfinder = this.getPathfinder(settings);
        const path = this.findPath(pathfinder);
        if(settings.visualizeAlg) {
            const nodes: Node[] = [];
            pathfinder.reconstructSolution((node) => {
                nodes.push(node);
            });
            this.visualizeGenerations(nodes);
        }
        this.drawPath(path);
    }

    /**
     * Performs the pathfinding algorithm on the grid and visualizes it with delays between successive
     * node generations
     */
    doDelayedPathfinding = () => {
        this.clearVisualization();
        this.clearPath();
        const settings = this.props.settings;
        this.visualized = false;
        const foreground = this.foreground.current!;
        foreground.toggleDisable();
        if(!this.visualizing) {
            this.visualizing = true;
            this.props.onChangeVisualizing(this.visualizing);
            const pathfinder = this.getPathfinder(settings);
            const path = this.findPath(pathfinder);
            const increment = settings.delayInc;
            const promises: Promise<NodeJS.Timeout>[] = []; //to call function when timeouts finish
            this.visualTimeouts = [];
            let delay = 0;
            if(settings.visualizeAlg) {
                //reconstruct solution by visualizing each generation
                pathfinder.reconstructSolution((node) => {
                    const promise = new Promise<NodeJS.Timeout>((resolve) => {
                        //each generation gets a higher timeout
                        const timeout = setTimeout(() => {
                            this.visualizeGeneration(node);
                            resolve(timeout);
                        }, delay);
                        this.visualTimeouts.push(timeout);
                        delay += increment;
                    });
                    promises.push(promise);
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
        } else {
            for (let i = 0; i < this.visualTimeouts.length; i++) {
                clearTimeout(this.visualTimeouts[i]);
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
     * Create a maze on the grid foreground
     */
    createMaze = (slant: number) => {
        if(this.visualizing) {
            return;
        }
        this.clearTiles();
        this.clearPath();
        this.clearVisualization();
        const prevGrid = this.foreground.current!.state.grid;
        const generator = new MazeGenerator(prevGrid.getWidth(), prevGrid.getHeight(), slant);
        const end = this.calcEndPointInView();
        const topLeft = {
            x: 1, y: 1
        };
        const bottomRight = {
            x: end.x-2, y: end.y-2
        };
        const grid = generator.generateMaze(topLeft, bottomRight);
        this.foreground.current!.drawGrid(grid);
        this.setPositions({
            x: end.x-2,
            y: end.y-2
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
        const yDecimal = yEnd - yFloor
        return {
            x: xDecimal > 0.05 ? Math.ceil(xEnd) : xFloor,
            y: yDecimal > 0.05 ? Math.ceil(yEnd) : yFloor
        }
    }

    /**
     * Sets the positions in the grid foreground
     */
    private setPositions = (endPoint: Point) => {
        this.foreground.current!.moveInitial({
            x: 1, y:1
        });
        this.foreground.current!.moveGoal(endPoint);
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
    let len = euclidean(initial, path[0].point);
    for (let i = 0; i < path.length - 1; i++) {
        len += euclidean(path[i].point, path[i + 1].point);
    }
    return +(len).toFixed(3);
}

export default PathfindingVisualizer;