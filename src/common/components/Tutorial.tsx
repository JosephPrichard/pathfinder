import React from 'react';

export const KEY_SHOW = 'visited';

interface IProps {}

interface IState {
    show: boolean
    page: number
}

class Tutorial extends React.Component<IProps,IState>
{
    constructor(props: IProps) {
        super(props);
        this.state = {
            show: true,
            page: 0
        }
    }

    hide() {
        this.setState({
            show: false
        }, () => localStorage.setItem(KEY_SHOW, 'true'));
    }

    prev() {
        this.setState(prevState => ({
            page: prevState.page - 1 >= 0 ? prevState.page - 1 : prevState.page
        }));
    }

    next() {
        const children = React.Children.toArray(this.props.children);
        this.setState(prevState => ({
            page: prevState.page + 1 < children.length ? prevState.page + 1 : prevState.page
        }));
    }

    render() {
        const children = React.Children.toArray(this.props.children);
        const showPanel = localStorage.getItem(KEY_SHOW) !== 'true';
        const lastPage = this.state.page + 1 === children.length;
        return(
            <div
                style={{
                    display: showPanel && this.state.show ? 'block' : 'none'
                }}
                className='tutorial-panel'
            >
                <div
                    className='x-tutorial-button'
                    tabIndex={0}
                    onKeyPress={() => this.hide()}
                    onClick={() => this.hide()}
                    onMouseDown={e => {
                        e.stopPropagation();
                        e.preventDefault();
                    }}
                >
                    <div className='x-tutorial-text'>
                        X
                    </div>
                </div>
                <div className='content-top-wrapper'>
                    <div className='content-top'>
                        {this.state.page + 1 }/{children.length}
                    </div>
                </div>
                <div className='content'>
                    {children[this.state.page]}
                </div>
                <div className='control-buttons'>
                    <div className='tutorial-control-wrapper'>
                        <button
                            className='tutorial-button green-button wider'
                            onMouseDown={e => e.preventDefault()}
                            onClick={() => this.prev()}
                        >
                            Prev
                        </button>
                        <button
                            className='tutorial-button green-button wider'
                            onMouseDown={e => e.preventDefault()}
                            onClick={
                                !lastPage ?
                                    () => this.next() :
                                    () => this.hide()
                            }
                        >
                            {!lastPage ? 'Next' : 'Finish'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

export default Tutorial;