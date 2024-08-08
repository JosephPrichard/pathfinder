/*
 * Copyright (c) Joseph Prichard 2022.
 */

import React, { RefObject } from 'react';
import { TileFg, SolidFg, WeightFg } from './TileFg';
import { createTileData, Grid, Point, RectGrid, Tile, TileData } from '../pathfinding/Core';

interface Props {
    tileSize: number,
    width: number,
    height: number,
    onTilesDragged: () => void,
    end: Point
}

interface State {
    grid: Grid,
    initial: Point,
    goal: Point,
    path: Tile[]
}

const INITIAL_COLOR = 'rgb(131, 217, 52)';
const GOAL_COLOR = 'rgb(203, 75, 14)';
const ARROW_PATH_COLOR = 'rgb(73, 79, 250)';

const BASE_WIDTH = 27;

class GridForeground extends React.Component<Props, State> {
    private svg: RefObject<SVGSVGElement> = React.createRef();

    private tilePointer: TileData;

    private drawing: boolean = false;
    private erasing: boolean = false;
    private draggingInitial: boolean = false;
    private draggingGoal: boolean = false;
    private disable: boolean = false;

    private doTileAnimation: boolean = true;

    private initialKey: number = 0;
    private goalKey: number = 0;

    constructor(props: Props) {
        super(props);
        const end = this.props.end;
        this.tilePointer = createTileData(true);
        this.state = {
            grid: new RectGrid(this.props.width, this.props.height),
            path: [],
            initial: {
                x: (end.x / 3) >> 0,
                y: (end.y / 3) >> 0
            },
            goal: {
                x: ((2 * end.x / 3) >> 0) - 1,
                y: ((2 * end.y / 3) >> 0) - 1
            }
        }
    }

    componentDidUpdate(prevProps: Props) {
        if (this.props.width !== prevProps.width
            || this.props.height !== prevProps.height) {
            this.setState(prevState => ({
                grid: prevState.grid.cloneNewSize(this.props.width, this.props.height)
            }));
        }
    }

    changeTile(data: TileData) {
        this.tilePointer = data;
    }

    toggleDisable() {
        this.disable = !this.disable;
    }

    getBoundingRect() {
        return this.svg.current!.getBoundingClientRect();
    }

    mouseDown(e: MouseEvent) {
        e.preventDefault();
        const bounds = this.getBoundingRect();
        this.onPress(e.clientX - bounds.left, e.clientY - bounds.top, e.button);
    }

    mouseUp(e: MouseEvent) {
        e.preventDefault();
        if (isControlKey(e.button)) {
            this.draggingGoal = false;
            this.draggingInitial = false;
            this.drawing = false;
            this.erasing = false;
        }
    }

    mouseMove(e: MouseEvent) {
        const bounds = this.getBoundingRect();
        this.onDrag(e.clientX - bounds.left, e.clientY - bounds.top);
    }

    touchStart(e: TouchEvent) {
        const touch = e.touches[0] || e.changedTouches[0];
        const bounds = this.getBoundingRect();
        this.onPress(touch.clientX - bounds.left, touch.clientY - bounds.top, 0);
    }

    touchMove(e: TouchEvent) {
        const touch = e.touches[0] || e.changedTouches[0];
        const bounds = this.getBoundingRect();
        this.onDrag(touch.clientX - bounds.left, touch.clientY - bounds.top);
    }

    onEndingEvent(e: Event) {
        e.preventDefault();
        this.draggingGoal = false;
        this.draggingInitial = false;
        this.drawing = false;
        this.erasing = false;
    }

    onPress(xCoordinate: number, yCoordinate: number, button: number) {
        const point = this.calculatePoint(xCoordinate, yCoordinate);
        if (isControlKey(button)) {
            if (pointsEqual(point, this.state.initial)) {
                this.draggingInitial = true;
            } else if (pointsEqual(point, this.state.goal)) {
                this.draggingGoal = true;
            } else if (!this.disable) {
                if (this.state.grid.isEmpty(point)) {
                    this.drawing = true;
                    this.drawTile(point);
                } else {
                    this.erasing = true;
                    this.eraseTile(point);
                }
            }
        }
    }

    onDrag(xCoordinate: number, yCoordinate: number) {
        const point = this.calculatePoint(xCoordinate, yCoordinate);
        if (this.draggingInitial) {
            this.moveInitial(point);
        } else if (this.draggingGoal) {
            this.moveGoal(point);
        } else if (!pointsEqual(point, this.state.initial) && !pointsEqual(point, this.state.goal) && !this.disable) {
            if (this.drawing) {
                this.drawTile(point);
            } else if (this.erasing) {
                this.eraseTile(point);
            }
        }
    }

    drawGrid(grid: Grid) {
        this.doTileAnimation = false;
        this.setState({
            grid: grid
        }, () => this.doTileAnimation = true)
    }

    drawTile(point: Point) {
        const grid = this.state.grid.clone();
        if (grid.inBounds(point)) {
            grid.mutateTile({
                point: point,
                data: this.tilePointer
            });
        }
        this.setState({grid: grid});
    }

    eraseTile(point: Point) {
        const grid = this.state.grid.clone();
        if (grid.inBounds(point)) {
            grid.mutateDefault(point, false);
        }
        this.setState({grid: grid});
    }

    clearTiles() {
        const grid = this.state.grid.clone();
        for (let y = 0; y < this.state.grid.getHeight(); y++) {
            for (let x = 0; x < this.state.grid.getWidth(); x++) {
                grid.mutateDefault({x, y}, false);
            }
        }
        this.setState({grid: grid});
    }

    moveInitial(point: Point) {
        if (this.canMoveEndPoint(point)) {
            this.initialKey++;
            this.setState({initial: point}, () => this.props.onTilesDragged());
        }
    }

    moveGoal(point: Point) {
        if (this.canMoveEndPoint(point)) {
            this.goalKey++;
            this.setState({goal: point}, () => this.props.onTilesDragged());
        }
    }

    canMoveEndPoint(point: Point) {
        return this.state.grid.inBounds(point)
            && this.state.grid.isEmpty(point)
            && !pointsEqual(this.state.initial, point)
            && !pointsEqual(this.state.goal, point)
            && !this.disable;
    }

    drawPath(path: Tile[]) {
        this.setState({path: path.slice()});
    }

    erasePath() {
        this.setState({path: []});
    }

    calculatePoint(xCoordinate: number, yCoordinate: number) {
        return {
            x: Math.floor(xCoordinate / this.props.tileSize),
            y: Math.floor(yCoordinate / this.props.tileSize)
        }
    }

    resetPoints() {
        this.initialKey++;
        this.goalKey++;
        const end = this.props.end;
        this.setState({
            initial: {
                x: ((end.x) / 3) >> 0,
                y: ((end.y) / 3) >> 0
            },
            goal: {
                x: ((2 * (end.x) / 3) >> 0) - 1,
                y: ((2 * (end.y) / 3) >> 0) - 1
            }
        });
    }

    render() {
        return (
            <div>
                <div
                    className='endpoint-tiles-table'
                >
                    {this.renderEndTile(this.state.initial, INITIAL_COLOR, 'initial' + this.initialKey)}
                    {this.renderEndTile(this.state.goal, GOAL_COLOR, 'goal' + this.goalKey)}
                </div>
                <svg
                    ref={this.svg}
                    xmlns='http://www.w3.org/2000/svg'
                    className='arrow-grid'
                >
                    <defs>
                        <marker
                            id='arrowhead-path'
                            markerWidth='3'
                            markerHeight='3'
                            refX='0'
                            refY='1.5'
                            orient='auto'
                            fill={ARROW_PATH_COLOR}
                        >
                            <polygon points='0 0, 3 1.5, 0 3'/>
                        </marker>
                    </defs>
                    {this.renderPath()}
                </svg>
                <div
                    className='tiles-table'
                    onContextMenu={e => e.preventDefault()}
                    onMouseDown={e => this.mouseDown(e.nativeEvent)}
                    onMouseUp={e => this.mouseUp(e.nativeEvent)}
                    onMouseMove={e => this.mouseMove(e.nativeEvent)}
                    onMouseLeave={e => this.onEndingEvent(e.nativeEvent)}
                    onTouchStart={e => this.touchStart(e.nativeEvent)}
                    onTouchMoveCapture={e => this.touchMove(e.nativeEvent)}
                    onTouchEnd={e => this.onEndingEvent(e.nativeEvent)}
                    onTouchCancel={e => this.onEndingEvent(e.nativeEvent)}
                >
                    {this.renderTilesGrid()}
                </div>
            </div>
        );
    }

    renderPath() {
        const lines: JSX.Element[] = [];
        for (let i = 0; i < this.state.path.length - 1; i++) {
            const first = this.state.path[i].point;
            const second = this.state.path[i + 1].point;
            lines.push(this.renderPathArrow(i, first, second));
        }
        return lines;
    }

    renderPathArrow(index: number, first: Point, second: Point) {
        const width = this.props.tileSize;
        const offset = width / 2;
        const firstX = first.x * width;
        const firstY = first.y * width;
        const secondX = second.x * width;
        const secondY = second.y * width;
        const offsetX = (secondX - firstX) / 4;
        const offsetY = (secondY - firstY) / 4;
        return (
            <line
                key={'path ' + index}
                x1={firstX + offset + offsetX}
                y1={firstY + offset + offsetY}
                x2={secondX + offset - offsetX}
                y2={secondY + offset - offsetY}
                stroke={ARROW_PATH_COLOR}
                strokeWidth={2 * this.props.tileSize / BASE_WIDTH}
                className='line'
                markerEnd='url(#arrowhead-path)'
            />
        );
    }

    renderTilesGrid() {
        const tiles: JSX.Element[] = [];
        for (let y = 0; y < this.state.grid.getHeight(); y++) {
            for (let x = 0; x < this.state.grid.getWidth(); x++) {
                const point = {x, y};
                const cost = this.state.grid.get(point).data.pathCost;
                if (this.state.grid.isSolid(point)) {
                    tiles.push(
                        <SolidFg
                            key={x + ',' + y}
                            point={point}
                            tileSize={this.props.tileSize}
                            doTileAnimation={this.doTileAnimation}
                        />
                    );
                } else if (cost > 1) {
                    tiles.push(
                        <WeightFg
                            key={x + ',' + y}
                            point={point}
                            tileSize={this.props.tileSize}
                            doTileAnimation={this.doTileAnimation}
                        />
                    );
                    tiles.push(this.renderWeightText(point, cost, x + ',' + y + ' text'));
                }
            }
        }
        return tiles;
    }

    renderWeightText(point: Point, cost: number, key: string) {
        return (
            <div
                key={key}
                style={{
                    left: point.x * this.props.tileSize,
                    top: point.y * this.props.tileSize,
                    width: this.props.tileSize,
                    height: this.props.tileSize,
                    position: 'absolute',
                    color: 'white',
                    fontSize: this.props.tileSize / 2.1,
                    paddingTop: this.props.tileSize / 3.70,
                    textAlign: 'center',
                    cursor: 'default'
                }}
            >
                {cost}
            </div>
        );
    }

    renderEndTile(point: Point, color: string, key: string) {
        return (
            <TileFg
                key={key}
                point={point}
                tileWidth={this.props.tileSize}
                color={color}
            />
        );
    }
}

function pointsEqual(point1: Point, point2: Point) {
    return point1.x === point2.x && point1.y === point2.y;
}

function isControlKey(button: number) {
    // right or left mouse
    return button === 0 || button === 2;
}

export default GridForeground;