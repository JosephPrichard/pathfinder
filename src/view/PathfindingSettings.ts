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
        delayInc: 10,
        algorithm: 'a*',
        heuristicKey: 'euclidean',
        navigatorKey: 'asterisk',
        bidirectional: false
    }
}

export default PathfindingSettings;