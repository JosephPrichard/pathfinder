import React, {RefObject} from 'react';
import '../App.css';
import TopBar from './navbar/TopBar';
import {MazeButton, VisualizeButton, SettingsButton} from './navbar/Buttons';
import {AlgorithmDropDown, ClearDropDown} from './navbar/DropDown';
import DraggablePanel from './elements/DraggablePanel';
import PathfindingVisualizer from './grid/PathfindingVisualizer';
import {VisualSettings, SpeedSettings, AlgorithmSettings, HeuristicSettings} from './navbar/SettingPanels';
import SettingsManager from './SettingsManager';
import PathfinderFactory from '../pathfinding/algorithms/PathfinderFactory';

interface IProps {}

interface IState {
    length: number,
    time: number,
    hDisabled: boolean,
    aDisabled: boolean,
    panelShow: boolean,
    topMargin: number,
    vButtonColor: string
}

class PathfindingApp extends React.Component<IProps, IState>
{
    //expose grid to parent to connect to button siblings
    private grid: RefObject<PathfindingVisualizer> = React.createRef();

    private settingsManager: SettingsManager = new SettingsManager();

    constructor(props: IProps) {
        super(props);
        this.state = {
            length: 0,
            time: 0,
            hDisabled: false,
            aDisabled: false,
            panelShow: false,
            topMargin: 75,
            vButtonColor: 'green-button'
        }
    }

    changeVButtonColor = (visualizing: boolean) => {
        const color = visualizing ? 'red-button' : 'green-button';
        this.setState({
            vButtonColor: color
        })
    }

    toggleSettings = () => {
        this.setState(prevState => ({
            panelShow: !prevState.panelShow
        }));
    }

    hideSettings = () => {
        this.setState({
            panelShow: false
        });
    }

    changeAlgo = (algorithm: string) => {
        this.setState({
            hDisabled: !PathfinderFactory.usesHeuristic(algorithm),
            aDisabled: !PathfinderFactory.hasBidirectional(algorithm)
        });
        this.settingsManager.changeAlgo(algorithm);
    }

    doPathfinding = () => {
        this.grid.current!.doDelayedPathfinding();
    }

    clearPath = () => {
        this.grid.current!.clearPath();
        this.grid.current!.clearVisualization();
    }

    clearTiles = () => {
        this.clearPath();
        this.grid.current!.clearTiles();
    }

    createMaze = () => {
        this.grid.current!.createMaze();
    }

    setLength = (len: number) => {
        this.setState({
            length: len
        });
    }

    setTime = (time: number) => {
        this.setState({
            time: time
        });
    }

    onChangeHeight = (height: number) => {
        this.setState({
            topMargin: height
        })
    }

    render() {
        const tileWidth = isMobile() ? 47 : 27;
        return (
            <div>
                <DraggablePanel show={this.state.panelShow} onClickXButton={this.hideSettings}>
                    <VisualSettings onChangeViz={this.settingsManager.changeVisualize}/>
                    <SpeedSettings onChange={this.settingsManager.changeSpeed}/>
                    <AlgorithmSettings disabled={this.state.aDisabled}
                                       onChangeBidirectional={this.settingsManager.changeBidirectional}
                                       onChangeDiagonals={this.settingsManager.changeDiagonals}/>
                    <HeuristicSettings disabled={this.state.hDisabled}
                                       onClickManhattan={this.settingsManager.changeManhattan}
                                       onClickEuclidean={this.settingsManager.changeEuclidean}
                                       onClickChebyshev={this.settingsManager.changeChebyshev}
                                       onClickOctile={this.settingsManager.changeOctile}/>
                </DraggablePanel>
                <TopBar onChangeHeight={this.onChangeHeight}>
                    <a href='https://github.com/JosephPrichard/PathfinderReact' className='title'>
                        Pathfinding Visualizer
                    </a>
                    <div className='top-container'>
                        <AlgorithmDropDown onChange={this.changeAlgo}/>
                        <VisualizeButton color={this.state.vButtonColor} onClick={this.doPathfinding}/>
                        <ClearDropDown onClickTiles={this.clearTiles}
                                       onClickPath={this.clearPath}/>
                        <MazeButton onClick={this.createMaze}/>
                        <SettingsButton onClick={this.toggleSettings}/>
                    </div>
                </TopBar>
                <PathfindingVisualizer ref={this.grid} onChangeVisualizing={this.changeVButtonColor} topMargin={this.state.topMargin}
                                       settings={this.settingsManager.settings} tileWidth={tileWidth}/>
            </div>
        );
    }
}

function isMobile() {
    return /Android|webOS|iPhone|iPad|Mac|Macintosh|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export default PathfindingApp;
