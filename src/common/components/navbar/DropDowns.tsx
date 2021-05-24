import React, {RefObject} from 'react';

export interface DropDownProps {
    onClick: () => void,
    text: string,
    dropDownClass?: string
    dropDownContentClass?: string
}

export interface DropDownState {
    up: boolean,
    display: string,
    fade: string
}

interface DropDownTextState {
    text: string
}

interface AlgProps {
    onClick: () => void,
    onChange: (alg: string) => void
}

interface ClrProps {
    onClick: () => void,
    onClickPath: () => void,
    onClickTiles: () => void,
    onClickReset: () => void;
}

interface MazeProps {
    onClick: () => void,
    onClickMaze: () => void,
    onClickMazeHorizontal: () => void,
    onClickMazeVertical: () => void,
    onClickRandomTerrain: () => void
}

interface TileProps {
    onClick: () => void,
    onClickTileType: (cost: number) => void
}

interface ClickableProps {
    click: () => void;
}

class Clickable extends React.Component<ClickableProps>
{
    render() {
        return (
            <div
                tabIndex={0}
                onKeyPress={this.props.click}
                onClick={this.props.click}
            >
                {this.props.children}
            </div>
        )
    }
}

class DropDown extends React.Component<DropDownProps, DropDownState>
{
    protected constructor(props: DropDownProps) {
        super(props);
        this.state = {
            up: true,
            display: 'none',
            fade: 'fade-in'
        };
    }

    windowOnClick = () => {
        this.hide();
    }

    /**
     * Binds window listeners.
     * Hides the drop down if clicked anywhere else
     */
    componentDidMount() {
        window.addEventListener('click', this.windowOnClick);
    }

    componentWillUnmount() {
        window.removeEventListener('click', this.windowOnClick);
    }

    show() {
        this.setState({
            up: false,
            display: 'block',
        });
    }

    hide() {
        this.setState({
            display: 'none',
            up: true,
        });
    }

    toggle(e: Event) {
        e.stopPropagation();
        this.props.onClick();
        if(this.isHidden()) {
            this.show();
        } else {
            this.hide();
        }
    }

    isHidden() {
        return this.state.display === 'none';
    }

    /**
     * Gets the style that will determine if the dropdown content should be displayed or not
     */
    contentStyle() {
        return {
            display: this.state.display
        }
    }

    /**
     * Gets the css class determining if the arrow should be facing up or down
     *  If the dropdown is extended the arrow faces down, otherwise it faces up
     */
    arrowClass() {
        return this.state.up ? 'arrowUp' : 'arrowDown';
    }

    /**
     * Gets the css class that highlights the dropdown if the dropdown is extended
     */
    getHighlightClass() {
        return !this.state.up ? 'drop-down-button-down drop-down-button-up' : 'drop-down-button-up'
    }

    /**
     * Renders the dropdown button, and its arrow
     * The children will be rendered in the dropdown content
     */
    render() {
        const className = this.props.dropDownClass === undefined ? '' : this.props.dropDownClass;
        const contentClassName = this.props.dropDownContentClass === undefined ? '' : this.props.dropDownContentClass;
        return (
            <div
                tabIndex={0}
                className={'drop-down ' + className}
                onMouseDown={e => e.preventDefault()}
                onKeyPress={(e) => this.toggle(e.nativeEvent)}
                onClick={(e) => this.toggle(e.nativeEvent)}
            >
                <div
                    className={'drop-down-button ' + this.getHighlightClass()}
                >
                    <div className='drop-down-button-wrapper'>
                        <span className='drop-down-text'>{this.props.text}</span>
                        <span
                            className={this.arrowClass()}
                        />
                    </div>
                </div>
                <div
                    style={this.contentStyle()}
                    className={this.state.fade + ' drop-down-content ' + contentClassName}
                >
                    {this.props.children}
                </div>
            </div>
        );
    }
}

export class AlgorithmDropDown extends React.Component<AlgProps, DropDownTextState>
{
    private dropDown: RefObject<DropDown> = React.createRef();

    constructor(props: AlgProps) {
        super(props);
        this.state = {
            text: 'A* Search'
        };
    }

    hide() {
        this.dropDown.current!.hide();
    }

    onChange(key: string, algText: string) {
        this.props.onChange(key);
        this.setState({
            text: algText
        });
    }

    render() {
        return (
            <DropDown
                ref={this.dropDown}
                onClick={this.props.onClick}
                text={this.state.text}
                dropDownContentClass='alg-drop-down-content'
            >
                <Clickable click={() => this.onChange('a*', 'A* Search')}>A* Search</Clickable>
                <Clickable click={() => this.onChange('dijkstra', 'Dijkstra')}>Dijkstra's Algorithm</Clickable>
                <Clickable click={() => this.onChange('best-first', 'Best First')}>Best First Search</Clickable>
                <Clickable click={() => this.onChange('bfs', 'Breadth First')}>Breadth First Search</Clickable>
                <Clickable click={() => this.onChange('dfs', 'Depth First')}>Depth First Search</Clickable>
            </DropDown>
        );
    }
}

export class ClearDropDown extends React.Component<ClrProps>
{
    private dropDown: RefObject<DropDown> = React.createRef();

    hide() {
        this.dropDown.current!.hide();
    }

    render() {
        return (
            <DropDown
                ref={this.dropDown}
                onClick={this.props.onClick}
                text='Reset'
                dropDownContentClass='clr-drop-down-content'
            >
                <Clickable click={this.props.onClickPath}>Clear Path</Clickable>
                <Clickable click={this.props.onClickTiles}>Clear Tiles</Clickable>
                <Clickable click={this.props.onClickReset}>Reset Grid</Clickable>
            </DropDown>
        );
    }
}

export class MazeDropDown extends React.Component<MazeProps>
{
    private dropDown: RefObject<DropDown> = React.createRef();

    hide() {
        this.dropDown.current!.hide();
    }

    render() {
        return (
            <DropDown
                ref={this.dropDown}
                onClick={this.props.onClick}
                text='Terrain'
                dropDownContentClass='maze-drop-down-content'
                dropDownClass='maze-drop-down'
            >
                <Clickable click={this.props.onClickMaze}>Recursive Maze Division</Clickable>
                <Clickable click={this.props.onClickMazeHorizontal}>Horizontal Skewed Maze</Clickable>
                <Clickable click={this.props.onClickMazeVertical}>Vertical Skewed Maze</Clickable>
                <Clickable click={this.props.onClickRandomTerrain}>Random Terrain</Clickable>
            </DropDown>
        );
    }
}

export class TilesDropDown extends React.Component<TileProps, DropDownTextState>
{
    private dropDown: RefObject<DropDown> = React.createRef();

    constructor(props: TileProps) {
        super(props);
        this.state = {
            text: 'Wall [∞]'
        };
    }

    hide() {
        this.dropDown.current!.hide();
    }

    onChange(cost: number, text: string) {
        this.props.onClickTileType(cost);
        this.setState({
            text: text
        }, () => this.props.onClickTileType(cost));
    }

    render() {
        return (
            <DropDown
                ref={this.dropDown}
                onClick={this.props.onClick}
                text={this.state.text}
                dropDownContentClass='tiles-drop-down-content'
                dropDownClass='tiles-drop-down'
            >
                <Clickable click={() => this.onChange(-1, 'Wall [∞]')}>Wall [∞]</Clickable>
                <Clickable click={() => this.onChange(2, 'Weight [2]')}>Weight [2]</Clickable>
                <Clickable click={() => this.onChange(3, 'Weight [3]')}>Weight [3]</Clickable>
                <Clickable click={() => this.onChange(5, 'Weight [5]')}>Weight [5]</Clickable>
            </DropDown>
        );
    }
}