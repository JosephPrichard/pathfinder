import React from 'react';
import mazeImg from '../web-content/maze_image_button.png';

interface IProps {
    onClick: ()  => void
}

interface VProps {
    color: string
    onClick: ()  => void
}

export class VisualizeButton extends React.Component<VProps>
{
    render() {
        return (
            <button className={'button ' + this.props.color} onClick={this.props.onClick}>
                Visualize!
            </button>
        );
    }
}

export class SettingsButton extends React.Component<IProps>
{
    render() {
        return (
            <button className='button settings-button' onClick={this.props.onClick}>
                Settings
            </button>
        );
    }
}

export class MazeButton extends React.Component<IProps>
{
    render() {
        return (
            <button className='button maze-button' onClick={this.props.onClick}>
                <img src={mazeImg} className={'maze-img'} alt='Maze'/>
            </button>
        );
    }
}
