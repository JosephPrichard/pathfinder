interface PathfindingSettings
{
    visualizeAlg: boolean,
    showArrows: boolean,
    delayInc: number,
    algorithm: string,
    heuristicKey: string,
    navigatorKey: string,
    bidirectional: boolean
}

export function getDefaultSettings(): PathfindingSettings {
    return {
        visualizeAlg: true,
        showArrows: true,
        delayInc: 6,
        algorithm: 'a*',
        heuristicKey: 'euclidean',
        navigatorKey: 'asterisk',
        bidirectional: false
    }
}

export default PathfindingSettings;