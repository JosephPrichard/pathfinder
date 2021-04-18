import React from 'react';

interface AlgProps {
    onClick: () => void,
    onChange: (alg: string) => void
}

interface AlgState {
    up: boolean,
    display: string,
    algText: string,
    fade: string
}

interface ClrProps {
    onClick: () => void,
    onClickPath: () => void,
    onClickTiles: () => void
}

interface DState {
    up: boolean,
    display: string,
    fade: string
}

interface MazeProps {
    onClick: () => void,
    onClickMaze: () => void,
    onClickMazeHorizontal: () => void,
    onClickMazeVertical: () => void
}

export class AlgorithmDropDown extends React.Component<AlgProps, AlgState>
{
    constructor(props: AlgProps) {
        super(props);
        this.state = {
            up: true,
            display: 'none',
            algText: 'A* Search',
            fade: 'fade-in'
        };
    }

    show = () => {
        this.setState({
            up: false,
            display: 'block',
        });
    }

    hide = () => {
        this.setState({
            display: 'none',
            up: true,
        });
    }

    toggle = (e: Event) => {
        e.stopPropagation();
        this.props.onClick();
        if(this.isHidden()) {
            this.show();
        } else {
            this.hide();
        }
    }

    isHidden = () => {
        return this.state.display === 'none';
    }

    contentStyle = () => {
        return {
            display: this.state.display
        }
    }

    onChange = (key: string, algText: string) => {
        this.props.onChange(key);
        this.setState({
            algText: algText
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
                    <span className='alg-drop-down-text drop-down-text'>{this.state.algText}</span>
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

export class ClearDropDown extends React.Component<ClrProps, DState>
{
    constructor(props: ClrProps) {
        super(props);
        this.state = {
            up: true,
            display: 'none',
            fade: 'fade-in'
        };
    }

    show = () => {
        this.setState({
            up: false,
            display: 'block',
        });
    }

    hide = () => {
        this.setState({
            display: 'none',
            up: true,
        });
    }

    toggle = (e: Event) => {
        e.stopPropagation();
        this.props.onClick();
        if(this.isHidden()) {
            this.show();
        } else {
            this.hide();
        }
    }

    isHidden = () => {
        return this.state.display === 'none';
    }

    contentStyle = () => {
        return {
            display: this.state.display
        }
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
                    <span className='clr-drop-down-text drop-down-text'>Clear Grid</span>
                    <span className={'clr-arr ' + this.arrowClass()}/>
                </div>
                <div style={this.contentStyle()}
                     className={this.state.fade + ' clr-drop-down-content drop-down-content'}
                >
                    <Clickable click={this.props.onClickPath}>Clear Path</Clickable>
                    <Clickable click={this.props.onClickTiles}>Clear Tiles</Clickable>
                </div>
            </div>
        );
    }
}

export class MazeDropDown extends React.Component<MazeProps, DState>
{
    constructor(props: MazeProps) {
        super(props);
        this.state = {
            up: true,
            display: 'none',
            fade: 'fade-in'
        };
    }

    show = () => {
        this.setState({
            up: false,
            display: 'block',
        });
    }

    hide = () => {
        this.setState({
            display: 'none',
            up: true,
        });
    }

    toggle = (e: Event) => {
        e.stopPropagation();
        this.props.onClick();
        if(this.isHidden()) {
            this.show();
        } else {
            this.hide();
        }
    }

    isHidden = () => {
        return this.state.display === 'none';
    }

    contentStyle = () => {
        return {
            display: this.state.display
        }
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
                    <span className='maze-drop-down-text drop-down-text'>Mazes</span>
                    <span className={'clr-arr ' + this.arrowClass()}/>
                </div>
                <div style={this.contentStyle()}
                     className={this.state.fade + ' maze-drop-down-content drop-down-content'}
                >
                    <Clickable click={this.props.onClickMaze}>Recursive Maze Division</Clickable>
                    <Clickable click={this.props.onClickMazeVertical}>Maze (vertical skew)</Clickable>
                    <Clickable click={this.props.onClickMazeHorizontal}>Maze (horizontal skew)</Clickable>
                </div>
            </div>
        );
    }
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