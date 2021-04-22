import React, {RefObject} from 'react';

interface IProps {
    title: string,
    show: boolean,
    onClickXButton: () => void,
    width: number,
    height: number
}

interface IState {
    top: number,
    left: number,
}

class DraggablePanel extends React.Component<IProps, IState>
{
    //refs are used to access native DOM
    private draggable: RefObject<HTMLDivElement> = React.createRef();
    private draggableContainer: RefObject<HTMLDivElement> = React.createRef();
    private draggableContent: RefObject<HTMLDivElement> = React.createRef();

    //stores previous mouse location and drag
    private dragging = false;
    private prevX = 0;
    private prevY = 0;

    constructor(props: IProps) {
        super(props);
        this.state = {
            top: -1,
            left: -1,
        };
    }

    componentDidMount() {
        document.addEventListener('mouseup', e => {
            this.mouseUp(e);
        });
        document.addEventListener('mousemove', e => {
            this.mouseMove(e);
        });
        window.addEventListener('mouseleave', e => {
            this.mouseUp(e);
        });
    }

    /**
     * Start drag and init prev mouse location when mouse is clicked on draggable
     * @param e
     */
    private mouseDown = (e: MouseEvent) => {
        e.preventDefault();
        this.prevY = e.clientY;
        this.prevX = e.clientX;
        this.dragging = true;
    }

    /**
     * Called when mouse is risen on document stop drag
     * @param e
     */
    private mouseUp = (e: MouseEvent) => {
        e.preventDefault();
        this.dragging = false;
    }

    /**
     * Called when the mouse is moved over the document to calculate the new position of
     * the draggable canvas
     * @param e
     */
    private mouseMove = (e: MouseEvent) => {
        if(this.dragging) {
            const container = this.draggableContainer.current!;
            let top = (container.offsetTop - (this.prevY - e.clientY))
            let left = (container.offsetLeft - (this.prevX - e.clientX));
            const content = this.draggableContent.current!;
            const draggable = this.draggable.current!;
            //stop drag if mouse goes out of bounds
            if(e.clientY < 0 || e.clientY > window.innerHeight
                    || e.clientX < 0 || e.clientX > window.innerWidth) {
                this.dragging = false;
            }
            //check if position is out of bounds and prevent the panel from being dragged there
            if(top < 0) {
                top = 0;
            } else if (top > window.innerHeight - draggable.offsetHeight) {
                top = window.innerHeight - draggable.offsetHeight;
            }
            if(left < -content.offsetWidth/2) {
                left = -content.offsetWidth/2;
            } else if(left > window.innerWidth - content.offsetWidth/2) {
                left = window.innerWidth - content.offsetWidth/2;
            }
            //set new position
            this.setState({
                top: top
            });
            this.setState({
                left: left
            });
            //update previous pos
            this.prevY = e.clientY;
            this.prevX = e.clientX;
        }
    }

    getPosition = () => {
        const left = this.state.left;
        const top = this.state.top;
        if(left === -1 || top === -1) {
            return {};
        }
        return {
            left: left + 'px',
            top: top + 'px',
        };
    }

    visibleStyle = () => {
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
            <div ref={this.draggableContainer} className='draggable-container' style={this.getPosition()}>
                {this.renderDraggable()}
                <div ref={this.draggableContent} style={this.contentStyle()} className='draggable-content'>
                    <div className='settings-general'>
                        {this.props.children}
                    </div>
                </div>
            </div>
        );
    }

    private renderDraggable = () => {
        return (
            <div style={this.draggableStyle()} className='draggable'
                 ref={this.draggable}
                 onMouseDown={e => this.mouseDown(e.nativeEvent)}
            >
                <div className='draggable-title'>{this.props.title}</div>
                <div className='x-button' onClick={this.props.onClickXButton}>X</div>
            </div>
        );
    }
}

export default DraggablePanel;