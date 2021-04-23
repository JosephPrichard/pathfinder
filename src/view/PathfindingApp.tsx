import React, {RefObject} from 'react';
import '../App.css';
import TopBar from './navbar/TopBar';
import {VisualizeButton, SettingsButton} from './navbar/Buttons';
import {AlgorithmDropDown, ClearDropDown, MazeDropDown} from './navbar/DropDown';
import DraggablePanel from './utility/DraggablePanel';
import PathfindingVisualizer from './grid/PathfindingVisualizer';
import {VisualSettings, SpeedSettings, AlgorithmSettings, HeuristicSettings} from './navbar/SettingPanels';
import SettingsManager from './SettingsManager';
import PathfinderBuilder from '../pathfinding/algorithms/PathfinderBuilder';
import {HORIZONTAL_SKEW, NO_SKEW, VERTICAL_SKEW} from '../pathfinding/algorithms/MazeGenerator';

interface IProps {}

interface IState {
    heuristicDisabled: boolean,
    bidirectionalDisabled: boolean,
    arrowsDisabled: boolean,

    panelShow: boolean,

    topMargin: number,

    visualizing: boolean,
    paused: boolean
}

class PathfindingApp extends React.Component<IProps, IState>
{
    //expose grid to parent to connect to button siblings
    private grid: RefObject<PathfindingVisualizer> = React.createRef();

    private algDropDown: RefObject<AlgorithmDropDown> = React.createRef();
    private clrDropDown: RefObject<ClearDropDown> = React.createRef();
    private mazeDropDown: RefObject<MazeDropDown> = React.createRef();

    private settingsManager: SettingsManager = new SettingsManager();

    constructor(props: IProps) {
        super(props);
        this.state = {
            heuristicDisabled: false,
            bidirectionalDisabled: false,
            arrowsDisabled: false,
            panelShow: false,
            topMargin: 75,
            visualizing: false,
            paused: false
        }
    }

    componentDidMount() {
        window.addEventListener('click', e => {
            this.algDropDown.current!.hide();
            this.clrDropDown.current!.hide();
            this.mazeDropDown.current!.hide();
        });
    }

    onClickAlgDrop = () => {
        this.clrDropDown.current!.hide();
        this.mazeDropDown.current!.hide();
    }

    onClickClrDrop = () => {
        this.algDropDown.current!.hide();
        this.mazeDropDown.current!.hide();
    }

    onClickMazeDrop = () => {
        this.clrDropDown.current!.hide();
        this.algDropDown.current!.hide();
    }

    changeVButtonColor = (visualizing: boolean) => {
        this.setState({
            visualizing: visualizing
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
            heuristicDisabled: !PathfinderBuilder.usesHeuristic(algorithm),
            bidirectionalDisabled: !PathfinderBuilder.hasBidirectional(algorithm),
            arrowsDisabled: algorithm === 'dfs'
        });
        this.settingsManager.changeAlgo(algorithm);
    }

    doPathfinding = () => {
        this.setState({
            paused: false
        });
        this.grid.current!.doDelayedPathfinding();
    }

    pausePathfinding = () => {
        this.setState({
            paused: true
        });
        this.grid.current!.pausePathfinding();
    }

    resumePathfinding = () => {
        this.setState({
            paused: false
        });
        this.grid.current!.resumePathfinding();
    }

    clearPath = () => {
        this.grid.current!.clearPath();
        this.grid.current!.clearVisualizationChecked();
    }

    clearTiles = () => {
        this.clearPath();
        this.grid.current!.clearTilesChecked();
    }

    createMaze = () => {
        this.grid.current!.createMaze(NO_SKEW);
    }

    createMazeVSkew = () => {
        this.grid.current!.createMaze(VERTICAL_SKEW);
    }

    createMazeHSkew = () => {
        this.grid.current!.createMaze(HORIZONTAL_SKEW);
    }

    onChangeHeight = (height: number) => {
        this.setState({
            topMargin: height
        })
    }

    render() {
        const tileWidth =  isMobile() ? 47 : Math.round(window.screen.availWidth / 57);
        return (
            <div>
                <DraggablePanel title='Grid Settings'
                                show={this.state.panelShow}
                                onClickXButton={this.hideSettings}
                                width={350}
                                height={420}
                >
                    <VisualSettings disabled={this.state.arrowsDisabled}
                                    onChangeViz={this.settingsManager.changeVisualize}
                                    onChangeShowArrows={this.settingsManager.changeShowArrows}
                    />
                    <SpeedSettings onChange={this.settingsManager.changeSpeed}/>
                    <AlgorithmSettings disabled={this.state.bidirectionalDisabled}
                                       onChangeBidirectional={this.settingsManager.changeBidirectional}
                                       onChangeDiagonals={this.settingsManager.changeDiagonals}
                    />
                    <HeuristicSettings disabled={this.state.heuristicDisabled}
                                       onClickManhattan={this.settingsManager.changeManhattan}
                                       onClickEuclidean={this.settingsManager.changeEuclidean}
                                       onClickChebyshev={this.settingsManager.changeChebyshev}
                                       onClickOctile={this.settingsManager.changeOctile}
                    />
                </DraggablePanel>
                <TopBar onChangeHeight={this.onChangeHeight}>
                    <a href='https://github.com/JosephPrichard/PathfinderReact' className='title'>
                        Pathfinding Visualizer
                    </a>
                    <div className='top-container'>
                        <AlgorithmDropDown ref={this.algDropDown}
                                           onClick={this.onClickAlgDrop}
                                           onChange={this.changeAlgo}
                        />
                        <VisualizeButton active={this.state.visualizing}
                                         paused={this.state.paused}
                                         onPause={this.pausePathfinding}
                                         onResume={this.resumePathfinding}
                                         onStartStop={this.doPathfinding}
                        />
                        <ClearDropDown ref={this.clrDropDown}
                                       onClick={this.onClickClrDrop}
                                       onClickTiles={this.clearTiles}
                                       onClickPath={this.clearPath}
                        />
                        <MazeDropDown ref={this.mazeDropDown}
                                      onClick={this.onClickMazeDrop}
                                      onClickMaze={this.createMaze}
                                      onClickMazeHorizontal={this.createMazeHSkew}
                                      onClickMazeVertical={this.createMazeVSkew}
                        />
                        <SettingsButton onClick={this.toggleSettings}/>
                    </div>
                </TopBar>
                <PathfindingVisualizer ref={this.grid}
                                       onChangeVisualizing={this.changeVButtonColor}
                                       topMargin={this.state.topMargin}
                                       settings={this.settingsManager.settings}
                                       tileWidth={tileWidth}/>
            </div>
        );
    }
}

function isMobile() {
    return /Android|webOS|iPhone|iPad|Mac|Macintosh|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export default PathfindingApp;