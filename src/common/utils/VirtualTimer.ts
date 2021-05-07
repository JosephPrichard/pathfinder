class VirtualTimer
{
    private timeout: NodeJS.Timeout;
    private readonly callback: () => void
    private timeStarted: number;
    private timeRemaining: number;
    private finished: boolean;

    constructor(callback: () => void, countDown: number) {
        this.callback = callback;
        this.finished = false;
        this.timeStarted = Date.now();
        this.timeRemaining = countDown;
        this.timeout = setTimeout(() => {
            callback();
            this.finished = true;
        }, this.timeRemaining);
    }

    clear() {
        clearTimeout(this.timeout);
        this.finished = true;
    }

    pause() {
        if(!this.finished) {
            clearTimeout(this.timeout);
            this.timeRemaining -= Date.now() - this.timeStarted;
        }
    }

    resume() {
        if(!this.finished) {
            this.timeStarted = Date.now();
            this.timeout = setTimeout(() => {
                this.callback();
                this.finished = true;
            }, this.timeRemaining);
        }
    }

    isFinished() {
        return this.finished;
    }

    getNativeTimeout() {
        return this.timeout;
    }
}

export default VirtualTimer;