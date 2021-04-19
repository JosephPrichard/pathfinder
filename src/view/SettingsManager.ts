import PathfindingSettings, {getDefaultSettings} from './PathfindingSettings';

class SettingsManager
{
    settings: PathfindingSettings = getDefaultSettings();

    changeAlgo = (algo: string) => {
        this.settings.algorithm = algo;
    }

    changeVisualize = () => {
        this.settings.visualizeAlg = !this.settings.visualizeAlg;
    }

    changeShowArrows = () => {
        this.settings.showArrows = !this.settings.showArrows;
    }

    changeBidirectional = () => {
        this.settings.bidirectional = !this.settings.bidirectional;
    }

    changeDiagonals = (checked: boolean) => {
        this.settings.navigatorKey = checked ? 'asterisk' : 'plus';
    }

    changeSpeed = (value: number) => {
        this.settings.delayInc = value*5;
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