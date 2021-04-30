import React from 'react';
import './Navbar.css'
import DropDown, {DropDownProps, DropDownState} from './DropDown';

interface AlgProps extends DropDownProps {
    onChange: (alg: string) => void
}

interface DropDownTextState extends DropDownState {
    text: string,
}

interface ClrProps extends DropDownProps {
    onClickPath: () => void,
    onClickTiles: () => void,
    onClickReset: () => void;
}

interface MazeProps extends DropDownProps {
    onClickMaze: () => void,
    onClickMazeHorizontal: () => void,
    onClickMazeVertical: () => void,
    onClickRandomTerrain: () => void
}

interface TileProps extends DropDownProps {
    onClickTileType: (cost: number) => void
}

interface ClickableProps {
    click: () => void;
}

class Clickable extends React.Component<ClickableProps>
{
    render() {
        return (
            <div tabIndex={0} onKeyPress={this.props.click} onClick={this.props.click}>{this.props.children}</div>
        )
    }
}

export class AlgorithmDropDown extends DropDown<AlgProps, DropDownTextState>
{
    constructor(props: AlgProps) {
        super(props);
        this.state = {
            up: true,
            display: 'none',
            text: 'A* Search',
            fade: 'fade-in'
        };
    }

    onChange = (key: string, algText: string) => {
        this.props.onChange(key);
        this.setState({
            text: algText
        });
    }

    arrowClass = () => {
        return this.state.up ? 'arrowUp' : 'arrowDown';
    }

    render() {
        return (
            <div tabIndex={0} className='alg-drop-down drop-down'
                 onMouseDown={e => e.preventDefault()}
                 onKeyPress={(e) => this.toggle(e.nativeEvent)}
                 onClick={(e) => this.toggle(e.nativeEvent)}
            >
                <div className='alg-drop-down-button drop-down-button'>
                    <span className='alg-drop-down-text drop-down-text'>{this.state.text}</span>
                    <span className={'alg-arr ' + this.arrowClass()}/>
                </div>
                <div style={this.contentStyle()}
                     className={this.state.fade + ' alg-drop-down-content drop-down-content'}
                >
                    <Clickable click={() => this.onChange('a*', 'A* Search')}>A* Search</Clickable>
                    <Clickable click={() => this.onChange('dijkstra', 'Dijkstra')}>Dijkstra's Algorithm</Clickable>
                    <Clickable click={() => this.onChange('best-first', 'Best First')}>Best First Search</Clickable>
                    <Clickable click={() => this.onChange('bfs', 'Breadth First')}>Breadth First Search</Clickable>
                    <Clickable click={() => this.onChange('dfs', 'Depth First')}>Depth First Search</Clickable>
                </div>
            </div>
        );
    }
}

export class ClearDropDown extends DropDown<ClrProps, DropDownState>
{
    constructor(props: ClrProps) {
        super(props);
        this.state = {
            up: true,
            display: 'none',
            fade: 'fade-in'
        };
    }

    arrowClass = () => {
        return this.state.up ? 'arrowUpW' : 'arrowDownW';
    }

    render() {
        return (
            <div tabIndex={0} className='clr-drop-down drop-down'
                 onMouseDown={e => e.preventDefault()}
                 onKeyPress={(e) => this.toggle(e.nativeEvent)}
                 onClick={(e) => this.toggle(e.nativeEvent)}
            >
                <div className='clr-drop-down-button drop-down-button'>
                    <span className='clr-drop-down-text drop-down-text'>Reset</span>
                    <span className={'clr-arr ' + this.arrowClass()}/>
                </div>
                <div style={this.contentStyle()}
                     className={this.state.fade + ' clr-drop-down-content drop-down-content'}
                >
                    <Clickable click={this.props.onClickPath}>Clear Path</Clickable>
                    <Clickable click={this.props.onClickTiles}>Clear Tiles</Clickable>
                    <Clickable click={this.props.onClickReset}>Reset Grid</Clickable>
                </div>
            </div>
        );
    }
}

export class MazeDropDown extends DropDown<MazeProps, DropDownState>
{
    constructor(props: MazeProps) {
        super(props);
        this.state = {
            up: true,
            display: 'none',
            fade: 'fade-in'
        };
    }

    arrowClass = () => {
        return this.state.up ? 'arrowUpW' : 'arrowDownW';
    }

    render() {
        return (
            <div tabIndex={0} className='maze-drop-down drop-down'
                 onMouseDown={e => e.preventDefault()}
                 onKeyPress={(e) => this.toggle(e.nativeEvent)}
                 onClick={(e) => this.toggle(e.nativeEvent)}
            >
                <div className='maze-drop-down-button drop-down-button'>
                    <span className='maze-drop-down-text drop-down-text'>Terrain</span>
                    <span className={'clr-arr ' + this.arrowClass()}/>
                </div>
                <div style={this.contentStyle()}
                     className={this.state.fade + ' maze-drop-down-content drop-down-content'}
                >
                    <Clickable click={this.props.onClickMaze}>Recursive Maze Division</Clickable>
                    <Clickable click={this.props.onClickMazeHorizontal}>Horizontal Skewed Maze</Clickable>
                    <Clickable click={this.props.onClickMazeVertical}>Vertical Skewed Maze</Clickable>
                    <Clickable click={this.props.onClickRandomTerrain}>Random Terrain</Clickable>
                </div>
            </div>
        );
    }
}

export class TilesDropDown extends DropDown<TileProps, DropDownTextState>
{
    constructor(props: TileProps) {
        super(props);
        this.state = {
            up: true,
            display: 'none',
            fade: 'fade-in',
            text: 'Wall [∞]'
        };
    }

    arrowClass = () => {
        return this.state.up ? 'arrowUpW' : 'arrowDownW';
    }

    onChange = (cost: number, text: string) => {
        this.props.onClickTileType(cost);
        this.setState({
            text: text
        }, () => this.props.onClickTileType(cost));
    }

    render() {
        return (
            <div tabIndex={0} className='tiles-drop-down drop-down'
                 onMouseDown={e => e.preventDefault()}
                 onKeyPress={(e) => this.toggle(e.nativeEvent)}
                 onClick={(e) => this.toggle(e.nativeEvent)}
            >
                <div className='tiles-drop-down-button drop-down-button'>
                    <span className='tiles-drop-down-text drop-down-text'>{this.state.text}</span>
                    <span className={'clr-arr ' + this.arrowClass()}/>
                </div>
                <div style={this.contentStyle()}
                     className={this.state.fade + ' tiles-drop-down-content drop-down-content'}
                >
                    <Clickable click={() => this.onChange(-1, 'Wall [∞]')}>Wall [∞]</Clickable>
                    <Clickable click={() => this.onChange(2, 'Weight [2]')}>Weight [2]</Clickable>
                    <Clickable click={() => this.onChange(3, 'Weight [3]')}>Weight [3]</Clickable>
                    <Clickable click={() => this.onChange(5, 'Weight [5]')}>Weight [5]</Clickable>
                </div>
            </div>
        );
    }
}