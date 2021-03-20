import PathfindingSettings, {FASTER, FASTEST, getDefaultSettings, MEDIUM, SLOWER, SLOWEST} from './PathfindingSettings';

class SettingsManager
{
    settings: PathfindingSettings = getDefaultSettings();

    changeAlgo = (algo: string) => {
        this.settings.algorithm = algo;
    }

    changeVisualize = () => {
        this.settings.visualizeAlg = !this.settings.visualizeAlg;
    }

    changeBidirectional = () => {
        this.settings.bidirectional = !this.settings.bidirectional;
    }

    changeDiagonals = (checked: boolean) => {
        this.settings.navigatorKey = checked ? 'asterisk' : 'plus';
    }

    changeSpeed = (value: number) => {
        const speeds = [SLOWEST, SLOWER, MEDIUM, FASTER, FASTEST];
        this.settings.delayInc = speeds[value-1];
    }

    changeManhattan = () => {
        this.settings.heuristicKey = 'manhattan';
    }

    changeEuclidean = () => {
        this.settings.heuristicKey = 'euclidean';
    }

    changeChebyshev = () => {
        this.settings.heuristicKey = 'chebyshev';
    }

    changeOctile = () => {
        this.settings.heuristicKey = 'octile';
    }
}

export default SettingsManager;