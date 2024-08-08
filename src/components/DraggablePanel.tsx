/*
 * Copyright (c) Joseph Prichard 2022.
 */

import React, { RefObject } from 'react';

interface Props {
    title: string,
    show: boolean,
    onClickXButton: () => void,
    width: number,
    height: number
}

interface State {
    top: number,
    left: number
}

class DraggablePanel extends React.Component<Props, State> {
    // refs are used to access native DOM
    private draggable: RefObject<HTMLDivElement> = React.createRef();
    private draggableContainer: RefObject<HTMLDivElement> = React.createRef();
    private draggableContent: RefObject<HTMLDivElement> = React.createRef();

    // stores previous mouse location and drag
    private dragging = false;
    private prevX = 0;
    private prevY = 0;

    constructor(props: Props) {
        super(props);
        this.state = {
            top: -1,
            left: -1
        };
    }

    componentDidMount() {
        // mouse
        document.addEventListener('mouseup', this.mouseUp);
        document.addEventListener('mousemove', this.mouseMove);
        window.addEventListener('mouseleave', this.mouseUp);
        // touch
        document.addEventListener('touchend', this.stopDrag);
        document.addEventListener('touchmove', this.touchMove);
    }

    componentWillUnmount() {
        // mouse
        document.removeEventListener('mouseup', this.mouseUp);
        document.removeEventListener('mousemove', this.mouseMove);
        window.removeEventListener('mouseleave', this.mouseUp);
        // touch
        document.removeEventListener('touchend', this.stopDrag);
        document.removeEventListener('touchmove', this.touchMove);
    }

    stopDrag = () => {
        this.dragging = false;
    }

    mouseDown = (e: MouseEvent) => {
        e.preventDefault();
        this.prevY = e.clientY;
        this.prevX = e.clientX;
        this.dragging = true;
    }

    touchStart = (e: TouchEvent) => {
        const touch = e.touches[0] || e.changedTouches[0];
        this.prevY = touch.clientY;
        this.prevX = touch.clientX;
        this.dragging = true;
    }

    mouseUp = (e: Event) => {
        e.preventDefault();
        this.dragging = false;
    }

    mouseMove = (e: MouseEvent) => {
        this.drag(e.clientX, e.clientY);
    }

    touchMove = (e: TouchEvent) => {
        const touch = e.touches[0] || e.changedTouches[0];
        this.drag(touch.clientX, touch.clientY);
    }

    drag(clientX: number, clientY: number) {
        if (this.dragging) {
            const container = this.draggableContainer.current!;
            let top = (container.offsetTop - (this.prevY - clientY))
            let left = (container.offsetLeft - (this.prevX - clientX));
            const content = this.draggableContent.current!;
            const draggable = this.draggable.current!;
            // stop drag if mouse goes out of bounds
            if (clientY < 0 || clientY > window.innerHeight
                || clientX < 0 || clientX > window.innerWidth) {
                this.dragging = false;
            }
            // check if position is out of bounds and prevent the panel from being dragged there
            if (top < 0) {
                top = 0;
            } else if (top > window.innerHeight - draggable.offsetHeight) {
                top = window.innerHeight - draggable.offsetHeight;
            }
            if (left < -content.offsetWidth / 2) {
                left = -content.offsetWidth / 2;
            } else if (left > window.innerWidth - content.offsetWidth / 2) {
                left = window.innerWidth - content.offsetWidth / 2;
            }
            // set new position
            this.setState({
                top: top,
                left: left
            });
            // update previous pos
            this.prevY = clientY;
            this.prevX = clientX;
        }
    }

    getPosition() {
        const left = this.state.left;
        const top = this.state.top;
        if (left === -1 || top === -1) {
            return {};
        }
        return {left: left + 'px', top: top + 'px'};
    }

    visibleStyle() {
        return this.props.show ? 'block' : 'none';
    }

    draggableStyle() {
        return {
            width: this.props.width,
            display: this.visibleStyle()
        }
    }

    contentStyle() {
        return {
            width: this.props.width,
            minHeight: this.props.height,
            display: this.visibleStyle()
        }
    }

    render() {
        return (
            <div
                ref={this.draggableContainer}
                className='draggable-container'
                style={this.getPosition()}
            >
                {this.renderDraggable()}
                <div
                    ref={this.draggableContent}
                    style={this.contentStyle()}
                    className='draggable-content'
                >
                    <div className='settings-general'>
                        {this.props.children}
                    </div>
                </div>
            </div>
        );
    }

    renderDraggable() {
        return (
            <div
                style={this.draggableStyle()}
                className='draggable'
                ref={this.draggable}
                onMouseDown={e => this.mouseDown(e.nativeEvent)}
                onTouchStart={e => this.touchStart(e.nativeEvent)}
            >
                <div className='draggable-title'>{this.props.title}</div>
                <div
                    className='x-button'
                    tabIndex={0}
                    onKeyPress={this.props.onClickXButton}
                    onClick={this.props.onClickXButton}
                    onMouseDown={e => {
                        e.stopPropagation();
                        e.preventDefault();
                    }}
                >
                    <div className='x-text'>
                        X
                    </div>
                </div>
            </div>
        );
    }
}

export default DraggablePanel;