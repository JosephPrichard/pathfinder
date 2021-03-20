export const SLOWEST = 16;
export const SLOWER = 12;
export const MEDIUM = 8;
export const FASTER = 4;
export const FASTEST = 2;

interface PathfindingSettings
{
    visualizeAlg: boolean,
    delayInc: number
    algorithm: string
    heuristicKey: string
    navigatorKey: string
    bidirectional: boolean
}

export function getDefaultSettings() {
    return {
        visualizeAlg: true,
        delayInc: MEDIUM,
        algorithm: 'a*',
        heuristicKey: 'euclidean',
        navigatorKey: 'asterisk',
        bidirectional: false
    }
}

export default PathfindingSettings;