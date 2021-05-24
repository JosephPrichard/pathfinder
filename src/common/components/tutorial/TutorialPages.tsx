import React from 'react'
import Icon from '../../../assets/react.png';
import WeightTileImg from '../../../assets/weight-tile.png';
import StartGoalImg from '../../../assets/start-goal.png';

export class IntroductionPage extends React.Component
{
    render() {
        return (
            <div key='introduction'>
                <h1 className='tutorial-title'>
                    Welcome to Pathfinder!
                </h1>
                <div className='tutorial-subtext-center'>
                    &emsp;&emsp;
                    Continue reading the tutorial to learn more about this application!
                    Click the X on the top right to skip the tutorial!
                </div>
                <div
                    className='tutorial-img-large-wrapper'
                >
                    <img
                        width={'50%'} height={'50%'}
                        className='icon tutorial-img'
                        alt={''} src={Icon}
                    />
                </div>
            </div>
        );
    }
}

export class ExplanationPage extends React.Component
{
    render() {
        return (
            <div key='explanation'>
                <h1 className='tutorial-title'>
                    What is this application?
                </h1>
                <div className='tutorial-subtext'>
                    &emsp;&emsp;
                    This application is a tool for visualizing pathfinding algorithms.
                    Pathfinding algorithms seek to find the shortest path between two vertices on a graph.
                    This application has adapted the algorithms to perform on a grid where vertices are tiles and
                    edges are 90 degree paths between adjacent tiles.
                </div>
                <div className='tutorial-subtext'>
                    &emsp;&emsp;
                    Some pathfinding algorithms are <i>weighted</i> while other algorithms are <i>unweighted</i>.
                    Weighted algorithms take into account the cost to travel to a tile, and therefore always find the shortest path.
                    Unweighted algorithms don't take into account the cost to travel to a tile, and don't always find the shortest path.
                    The shortest path is the path with the lowest cost between the two points.
                </div>
            </div>
        );
    }
}

export class DrawingPage extends React.Component
{
    render() {
        return (
            <div key='draw'>
                <h1 className='tutorial-title'>
                    Drawing Walls and Weights
                </h1>
                <div className='tutorial-subtext'>
                    &emsp;&emsp;
                    Click and drag on the empty tiles to draw walls or weights.
                    Click and drag on filled tiles to erase.
                    Click the purple drop down menu to change which wall or weight to draw.
                    Generate terrain by clicking the yellow drop down menu.
                </div>
                <div className='tutorial-subtext'>
                    &emsp;&emsp;
                    Walls cannot be traveled to, and are therefore not explored by any of the algorithms.
                    Weights can be traveled to, however they are more costly to travel to. For example,
                    Weight[5] is 5 times more costly to travel to than an empty tile.
                </div>
                <div
                    className='tutorial-img-wrapper'
                >
                    <img
                        src={WeightTileImg}
                        className='tutorial-img'
                        alt='Weight Tile'
                    />
                </div>
            </div>
        );
    }
}

export class EndpointsPage extends React.Component
{
    render() {
        return (
            <div key='end-points'>
                <h1 className='tutorial-title'>
                    Dragging Start and Goal Nodes
                </h1>
                <div className='tutorial-subtext'>
                    &emsp;&emsp;
                    The green node (start) is where the pathfinding algorithms start from,
                    while the red node (goal) is where the algorithm is trying to find the shortest path to.
                    You can move the start and goal nodes by clicking them and dragging them.
                </div>
                <div className='tutorial-subtext'>
                    &emsp;&emsp;
                    You can drag the nodes even after the algorithm has finished being visualized.
                    This allows you to instantly see how paths vary for different start and goal positions.
                </div>
                <div
                    className='tutorial-img-large-wrapper'
                >
                    <img
                        src={StartGoalImg}
                        className='tutorial-img'
                        alt='Start-Goal'
                        width='28%'
                        height='28%'
                    />
                </div>
            </div>
        );
    }
}

export class AlgorithmsPage extends React.Component
{
    render() {
        return (
            <div key='algorithms'>
                <h1 className='tutorial-title'>
                    Pathfinding Algorithms
                </h1>
                <div className='tutorial-text'>
                    <div className='text-row'>
                        <b>Dijkstra's Algorithm</b> (weighted):
                        The most fundamental pathfinding algorithm, it uses path costs to guarantee the shortest path.
                        Out of these algorithms, it is the most expensive to perform and often checks the most nodes.
                    </div>
                    <div className='text-row'>
                        <b>A* Search</b> (weighted):
                        Uses both path costs and heuristics to guarantee the shortest path while exploring less nodes than Dijkstra.
                        Widely considered to be one of the best pathfinding algorithms.
                    </div>
                    <div className='text-row'>
                        <b>Best First Search</b> (unweighted):
                        Uses heuristics to explore nodes closer to the goal.
                        Explores a low amount of nodes, but doesn't guarantee the shortest path.
                    </div>
                    <div className='text-row'>
                        <b>Breadth First Search</b> (unweighted):
                        A solid algorithm that guarantees the shortest path on unweighted grids, however it will
                        fail to find the shortest path on weighted grids.
                        Very cheap to perform on small grids.
                    </div>
                    <div className='text-row'>
                        <b>Depth First Search</b> (unweighted):
                        A poor algorithm for pathfinding that doesn't guarantee the shortest path.
                    </div>
                </div>
            </div>
        );
    }
}

export class FinishPage extends React.Component
{
    render() {
        return (
            <div key='finish'>
                <h1 className='tutorial-title'>
                    Enjoy using Pathfinder!
                </h1>
                <div className='tutorial-subtext-narrow'>
                    &emsp; &emsp;
                    I hope you enjoy using this visualization tool and can learn something from it!
                    If you want to see the tutorial again, just click "Pathfinding Visualizer" on the top left corner of your screen.
                    You can see the source code on my github <a
                    href='https://github.com/JosephPrichard/Pathfinder'
                    className='tutorial-link'
                >
                    here
                </a>
                </div>
            </div>
        );
    }
}
export function getTutorialPages() {
    return [
        <IntroductionPage key='intro'/>,
        <ExplanationPage key='explain'/>,
        <DrawingPage key='draw'/>,
        <EndpointsPage key='end'/>,
        <AlgorithmsPage key='alg'/>,
        <FinishPage key='finish'/>
    ];
}