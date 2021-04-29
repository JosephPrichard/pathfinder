import React, {RefObject} from 'react';
import TopBar from './navbar/TopBar';
import {VisualizeButton, SettingsButton} from './navbar/Buttons';
import {AlgorithmDropDown, ClearDropDown, MazeDropDown, TilesDropDown} from './navbar/DropDown';
import DraggablePanel from './utility/DraggablePanel';
import PathfindingVisualizer from './grid/PathfindingVisualizer';
import {VisualSettings, SpeedSettings, AlgorithmSettings, HeuristicSettings} from './navbar/SettingPanels';
import SettingsManager from './SettingsManager';
import PathfinderBuilder from '../pathfinding/algorithms/PathfinderBuilder';
import {MAZE, MAZE_HORIZONTAL_SKEW, MAZE_VERTICAL_SKEW, RANDOM_TERRAIN} from '../pathfinding/algorithms/TerrainGeneratorBuilder';

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
    //expose visualizer to parent to connect to button siblings
    private visualizer: RefObject<PathfindingVisualizer> = React.createRef();

    //drop down refs needed to invoke behavior between dropdowns
    private algDropDown: RefObject<AlgorithmDropDown> = React.createRef();
    private clrDropDown: RefObject<ClearDropDown> = React.createRef();
    private mazeDropDown: RefObject<MazeDropDown> = React.createRef();
    private tilesDropDown: RefObject<TilesDropDown> = React.createRef();

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
            this.tilesDropDown.current!.hide();
        });
    }

    onClickAlgDrop = () => {
        this.clrDropDown.current!.hide();
        this.mazeDropDown.current!.hide();
        this.tilesDropDown.current!.hide();
    }

    onClickClrDrop = () => {
        this.algDropDown.current!.hide();
        this.mazeDropDown.current!.hide();
        this.tilesDropDown.current!.hide();
    }

    onClickMazeDrop = () => {
        this.clrDropDown.current!.hide();
        this.algDropDown.current!.hide();
        this.tilesDropDown.current!.hide();
    }

    onClickTilesDrop = () => {
        this.clrDropDown.current!.hide();
        this.algDropDown.current!.hide();
        this.mazeDropDown.current!.hide();
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
        this.visualizer.current!.doDelayedPathfinding();
    }

    pausePathfinding = () => {
        this.setState({
            paused: true
        });
        this.visualizer.current!.pausePathfinding();
    }

    resumePathfinding = () => {
        this.setState({
            paused: false
        });
        this.visualizer.current!.resumePathfinding();
    }

    clearPath = () => {
        this.visualizer.current!.clearPath();
        this.visualizer.current!.clearVisualizationChecked();
    }

    clearTiles = () => {
        this.clearPath();
        this.visualizer.current!.clearTilesChecked();
    }

    resetBoard = () => {
        this.clearPath();
        this.clearTiles();
        this.visualizer.current!.resetPoints();
    }

    createMaze = () => {
        this.visualizer.current!.createTerrain(MAZE);
    }

    createMazeVSkew = () => {
        this.visualizer.current!.createTerrain(MAZE_VERTICAL_SKEW);
    }

    createMazeHSkew = () => {
        this.visualizer.current!.createTerrain(MAZE_HORIZONTAL_SKEW);
    }

    createRandomTerrain = () => {
        this.visualizer.current!.createTerrain(RANDOM_TERRAIN);
    }

    onChangeHeight = (height: number) => {
        this.setState({
            topMargin: height
        });
    }

    changeTile = (cost: number) => {
        this.visualizer.current!.changeTile({
            isSolid: cost === -1,
            pathCost: cost
        });
    }

    render() {
        const mobile = isMobile();
        const tileWidth =  mobile ? 47 : Math.round(window.screen.availWidth / 57);
        if(mobile) {
            this.settingsManager.changeSpeed(12);
        }
        return (
            <div>
                <DraggablePanel title='Grid Settings'
                                show={this.state.panelShow}
                                onClickXButton={this.hideSettings}
                                width={350}
                                height={430}
                >
                    <VisualSettings disabled={this.state.arrowsDisabled}
                                    onChangeViz={this.settingsManager.changeVisualize}
                                    onChangeShowArrows={this.settingsManager.changeShowArrows}
                    />
                    <SpeedSettings onChange={this.settingsManager.changeSpeed}
                                   initialSpeed={this.settingsManager.settings.delayInc}
                    />
                    <AlgorithmSettings disabled={this.state.bidirectionalDisabled}
                                       onChangeBidirectional={this.settingsManager.changeBidirectional}
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
                                       onClickReset={this.resetBoard}
                        />
                        <TilesDropDown ref={this.tilesDropDown}
                                       onClick={this.onClickTilesDrop}
                                       onClickTileType={this.changeTile}
                        />
                        <MazeDropDown ref={this.mazeDropDown}
                                      onClick={this.onClickMazeDrop}
                                      onClickMaze={this.createMaze}
                                      onClickMazeHorizontal={this.createMazeHSkew}
                                      onClickMazeVertical={this.createMazeVSkew}
                                      onClickRandomTerrain={this.createRandomTerrain}
                        />
                        <SettingsButton onClick={this.toggleSettings}/>
                    </div>
                </TopBar>
                <PathfindingVisualizer ref={this.visualizer}
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