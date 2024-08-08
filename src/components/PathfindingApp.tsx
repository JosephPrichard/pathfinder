/*
 * Copyright (c) Joseph Prichard 2022.
 */

import React, { PropsWithChildren, RefObject } from 'react';
import { SettingsButton, VisualizeButton } from './Buttons';
import { AlgorithmDropDown, ClearDropDown, MazeDropDown, TilesDropDown } from './DropDowns';
import { AlgorithmSettings, HeuristicSettings, SpeedSettings, VisualSettings } from './SettingPanels';
import DraggablePanel from './DraggablePanel';
import PathfindingVisualizer from './PathfindingVisualizer';
import Icon from '../assets/react.png';
import AppSettings, { getDefaultSettings } from "../utils/AppSettings";
import Tutorial, { KEY_SHOW } from './Tutorial';
import { getTutorialPages } from './TutorialPages';
import { MAZE, MAZE_HORIZONTAL_SKEW, MAZE_VERTICAL_SKEW, PathfinderBuilder, RANDOM_TERRAIN } from '../pathfinding/Builders';

interface Props {
}

interface State {
    settings: AppSettings,

    heuristicDisabled: boolean,
    bidirectionalDisabled: boolean,
    arrowsDisabled: boolean,
    scoreDisabled: boolean

    panelShow: boolean,

    visualizing: boolean,
    paused: boolean,

    useIcon: boolean
}

class PathfindingApp extends React.Component<Props, State> {
    // expose grid to parent to connect to button siblings
    private visualizer: RefObject<PathfindingVisualizer> = React.createRef();

    // drop down refs needed to invoke behavior between dropdowns
    private algDropDown: RefObject<AlgorithmDropDown> = React.createRef();
    private clrDropDown: RefObject<ClearDropDown> = React.createRef();
    private mazeDropDown: RefObject<MazeDropDown> = React.createRef();
    private tilesDropDown: RefObject<TilesDropDown> = React.createRef();

    private readonly tileWidth: number;

    constructor(props: Props) {
        super(props);
        const settings = getDefaultSettings();
        this.state = {
            settings,
            heuristicDisabled: !PathfinderBuilder.usesHeuristic(settings.algorithm),
            bidirectionalDisabled: !settings.bidirectional,
            arrowsDisabled: false,
            scoreDisabled: false,
            panelShow: false,
            visualizing: false,
            paused: false,
            useIcon: this.useIcon()
        }
        const mobile = isMobile();
        this.tileWidth = mobile ? 47 : 26;
    }

    windowOnResize = () => {
        this.setState({
            useIcon: this.useIcon()
        });
    }

    componentDidMount() {
        window.addEventListener('resize', this.windowOnResize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.windowOnResize);
    }

    useIcon() {
        return window.innerWidth <= 850;
    }

    onClickAlgDrop() {
        this.clrDropDown.current!.hide();
        this.mazeDropDown.current!.hide();
        this.tilesDropDown.current!.hide();
    }

    onClickClrDrop() {
        this.algDropDown.current!.hide();
        this.mazeDropDown.current!.hide();
        this.tilesDropDown.current!.hide();
    }

    onClickMazeDrop() {
        this.clrDropDown.current!.hide();
        this.algDropDown.current!.hide();
        this.tilesDropDown.current!.hide();
    }

    onClickTilesDrop() {
        this.clrDropDown.current!.hide();
        this.algDropDown.current!.hide();
        this.mazeDropDown.current!.hide();
    }

    changeButtonActiveState(visualizing: boolean) {
        this.setState({
            visualizing: visualizing
        })
    }

    toggleSettings() {
        this.setState(prevState => ({
            panelShow: !prevState.panelShow
        }));
    }

    hideSettings() {
        this.setState({
            panelShow: false
        });
    }

    doPathfinding() {
        this.setState({
            paused: false
        });
        this.visualizer.current!.doDelayedPathfinding();
    }

    pausePathfinding() {
        this.setState({
            paused: true
        });
        this.visualizer.current!.pausePathfinding();
    }

    resumePathfinding() {
        this.setState({
            paused: false
        });
        this.visualizer.current!.resumePathfinding();
    }

    clearPath() {
        this.visualizer.current!.clearPath();
        this.visualizer.current!.clearVisualizationChecked();
    }

    clearTiles() {
        this.clearPath();
        this.visualizer.current!.clearTilesChecked();
    }

    resetBoard() {
        this.clearPath();
        this.clearTiles();
        this.visualizer.current!.resetPoints();
    }

    createMaze() {
        this.visualizer.current!.createTerrain(MAZE, false);
    }

    createMazeVSkew() {
        this.visualizer.current!.createTerrain(MAZE_VERTICAL_SKEW, false);
    }

    createMazeHSkew() {
        this.visualizer.current!.createTerrain(MAZE_HORIZONTAL_SKEW, false);
    }

    createRandomTerrain() {
        this.visualizer.current!.createTerrain(RANDOM_TERRAIN, true);
    }

    changeTile(cost: number) {
        this.visualizer.current!.changeTile({
            isSolid: cost === -1,
            pathCost: cost
        });
    }

    changeAlgo(algorithm: string) {
        this.setState(prevState => ({
            heuristicDisabled: !PathfinderBuilder.usesHeuristic(algorithm),
            bidirectionalDisabled: !PathfinderBuilder.hasBidirectional(algorithm),
            scoreDisabled: !PathfinderBuilder.usesWeights(algorithm),
            settings: {
                ...prevState.settings,
                algorithm: algorithm
            }
        }));
    }

    changeShowArrows() {
        this.setState(prevState => ({
            settings: {
                ...prevState.settings,
                showArrows: !prevState.settings.showArrows
            }
        }));
    }

    changeBidirectional() {
        this.setState(prevState => ({
            settings: {
                ...prevState.settings,
                bidirectional: !prevState.settings.bidirectional
            }
        }));
    }

    changeSpeed(value: number) {
        this.setState(prevState => ({
            settings: {
                ...prevState.settings,
                delayInc: value
            }
        }));
    }

    changeManhattan() {
        this.setState(prevState => ({
            settings: {
                ...prevState.settings,
                heuristicKey: 'manhattan'
            }
        }));
    }

    changeEuclidean() {
        this.setState(prevState => ({
            settings: {
                ...prevState.settings,
                heuristicKey: 'euclidean'
            }
        }));
    }

    changeChebyshev() {
        this.setState(prevState => ({
            settings: {
                ...prevState.settings,
                heuristicKey: 'chebyshev'
            }
        }));
    }

    changeOctile() {
        this.setState(prevState => ({
            settings: {
                ...prevState.settings,
                heuristicKey: 'octile'
            }
        }));
    }

    showTutorial() {
        localStorage.setItem(KEY_SHOW, 'false');
    }

    render() {
        const title: string = 'Pathfinding Visualizer';
        const icon = this.state.useIcon ?
            <img
                width={'100%'} height={'100%'}
                className='icon'
                alt={title} src={Icon}
            /> :
            title;

        return (
            <div>
                <Tutorial>
                    {getTutorialPages()}
                </Tutorial>
                <DraggablePanel
                    title='Grid Settings'
                    show={this.state.panelShow}
                    onClickXButton={() => this.hideSettings()}
                    width={350}
                    height={405}
                >
                    <VisualSettings
                        defaultShowArrows={this.state.settings.showArrows}
                        disabledTree={this.state.arrowsDisabled}
                        disabledScore={this.state.scoreDisabled}
                        onChangeShowArrows={() => this.changeShowArrows()}
                    />
                    <SpeedSettings
                        onChange={(value: number) => this.changeSpeed(value)}
                        initialSpeed={this.state.settings.delayInc}
                    />
                    <AlgorithmSettings
                        defaultAlg={this.state.settings.bidirectional}
                        disabled={this.state.bidirectionalDisabled}
                        onChangeBidirectional={() => this.changeBidirectional()}
                    />
                    <HeuristicSettings
                        defaultHeuristic={this.state.settings.heuristicKey}
                        disabled={this.state.heuristicDisabled}
                        onClickManhattan={() => this.changeManhattan()}
                        onClickEuclidean={() => this.changeEuclidean()}
                        onClickChebyshev={() => this.changeChebyshev()}
                        onClickOctile={() => this.changeOctile()}
                    />
                </DraggablePanel>
                <TopBar>
                    <div
                        className='title'
                        tabIndex={0}
                        style={{
                            width: this.state.useIcon ? 70 : 'auto',
                            height: this.state.useIcon ? 52 : '100%'
                        }}
                        onClick={() => {
                            this.showTutorial();
                            window.location.reload();
                        }}
                    >
                        {icon}
                    </div>
                    <AlgorithmDropDown
                        ref={this.algDropDown}
                        onClick={() => this.onClickAlgDrop()}
                        onChange={(alg: string) => this.changeAlgo(alg)}
                    />
                    <MazeDropDown
                        ref={this.mazeDropDown}
                        onClick={() => this.onClickMazeDrop()}
                        onClickMaze={() => this.createMaze()}
                        onClickMazeHorizontal={() => this.createMazeHSkew()}
                        onClickMazeVertical={() => this.createMazeVSkew()}
                        onClickRandomTerrain={() => this.createRandomTerrain()}
                    />
                    <VisualizeButton
                        active={this.state.visualizing}
                        paused={this.state.paused}
                        onPause={() => this.pausePathfinding()}
                        onResume={() => this.resumePathfinding()}
                        onStartStop={() => this.doPathfinding()}
                    />
                    <ClearDropDown
                        ref={this.clrDropDown}
                        onClick={() => this.onClickClrDrop()}
                        onClickTiles={() => this.clearTiles()}
                        onClickPath={() => this.clearPath()}
                        onClickReset={() => this.resetBoard()}
                    />
                    <TilesDropDown
                        ref={this.tilesDropDown}
                        onClick={() => this.onClickTilesDrop()}
                        onClickTileType={(cost: number) => this.changeTile(cost)}
                    />
                    <SettingsButton onClick={() => this.toggleSettings()}/>
                </TopBar>
                <PathfindingVisualizer
                    ref={this.visualizer}
                    onChangeVisualizing={(viz: boolean) => this.changeButtonActiveState(viz)}
                    settings={this.state.settings}
                    tileWidth={this.tileWidth}
                />
            </div>
        );
    }
}

function TopBar(props: PropsWithChildren<{}>) {
    return (
        <div
            style={{
                width: window.screen.availWidth
            }}
            className='top-navbar'
        >
            {props.children}
        </div>
    );
}


function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export default PathfindingApp;