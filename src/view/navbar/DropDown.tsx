import React from 'react';

interface AlgProps {
    onChange: (alg: string) => void
}

interface AlgState {
    up: boolean,
    display: string,
    algText: string;
}

export class AlgorithmDropDown extends React.Component<AlgProps, AlgState>
{
    constructor(props: AlgProps) {
        super(props);
        this.state = {
            up: true,
            display: 'none',
            algText: 'A* Search'
        };
    }

    show = () => {
        this.setState({
            up: false,
            display: 'block'
        });
    }

    hide = () => {
        this.setState({
            up: true,
            display: 'none'
        });
    }

    toggle = () => {
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
            <div className='alg-drop-down drop-down' onMouseOver={this.show} onMouseLeave={this.hide}>
                <div className='alg-drop-down-button drop-down-button'>
                    <span className='alg-drop-down-text drop-down-text'>{this.state.algText}</span>
                    <span className={'alg-arr ' + this.arrowClass()}/>
                </div>
                <div style={this.contentStyle()} className='alg-drop-down-content drop-down-content'>
                    <div onClick={() => this.onChange('a*', 'A* Search')}>A* Search</div>
                    <div onClick={() => this.onChange('dijkstra', 'Dijkstra')}>Dijkstra's Algorithm</div>
                    <div onClick={() => this.onChange('best-first', 'Best First')}>Best First Search</div>
                    <div onClick={() => this.onChange('bfs', 'Breadth First')}>Breadth First Search</div>
                    <div onClick={() => this.onChange('dfs', 'Depth First')}>Depth First Search</div>
                </div>
            </div>
        );
    }
}

interface ClrProps {
    onClickPath: () => void,
    onClickTiles: () => void
}

interface ClrState {
    up: boolean,
    display: string
}

export class ClearDropDown extends React.Component<ClrProps, ClrState>
{
    constructor(props: ClrProps) {
        super(props);
        this.state = {
            up: true,
            display: 'none'
        };
    }

    show = () => {
        this.setState({
            up: false,
            display: 'block'
        });
    }

    hide = () => {
        this.setState({
            up: true,
            display: 'none'
        });
    }

    toggle = () => {
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
            <div className='clr-drop-down drop-down' onMouseOver={this.show} onMouseLeave={this.hide}>
                <div className='clr-drop-down-button drop-down-button'>
                    <span className='clr-drop-down-text drop-down-text'>Clear Grid</span>
                    <span className={'clr-arr ' + this.arrowClass()}/>
                </div>
                <div style={this.contentStyle()} className='clr-drop-down-content drop-down-content'>
                    <div onClick={this.props.onClickPath}>Clear Path</div>
                    <div onClick={this.props.onClickTiles}>Clear Tiles</div>
                </div>
            </div>
        );
    }
}