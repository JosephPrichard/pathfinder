# Pathfinder

Educational grid based pathfinding tool and library.

## Introduction

This project is an educational Grid based Pathfinding tool written in Typescript that visualizes pathfinding and maze generation algorithms on a web browser! You can find an online demo [here](https://josephprichard.github.io/Pathfinder).

This is is the react version of an older project I made: [here](https://github.com/JosephPrichard/PathfindingVisualizer)

## Build Process

This project uses Webpack and Npm to compile the Typescript src files into the bundle.js file located in the root directory of the repository. 

You can open the development server with
```
npm start
```

You can create a production build with
```
npm run build
```

Project was deployed to gh pages with 
```
npm run deploy
```

## Library

The grid is based around 3 fundamental interfaces contained in ../pathfinding/core/Components

Point, which represents an x,y location on the grid.
TileData, which stores the solidity of a tile and the cost to travel to a tile if it isn't solid.
Tile, which stores Point and TileData, representing a Node on the Grid.

We can create a grid with a width of 10 and a height of 5 like so:
```
const grid = new Grid(10, 5);
```

Let's say we wanted to make the tile at (5,3) solid, so we can't travel there:
```
const point = {x: 5, y: 3};
const data = {pathCost: 1, isSolid: true};
grid.mutate(point, data);
```

If we wanted to get the tile at the point (4,6) we would do it like this:
```
grid.get({x: 4, y: 6});
```

The grid class contains minimal bound checks to speed up processing but we can check the boundaries on 
the grid with these helpful functions:
```
grid.inBounds(point);
grid.getWidth();
grid.getHeight();
```

This project also contains Pathfinders which can find the best path (capable by the algorithm) between an initial and goal point.

If we want to initialize a pathfinder we need to pass it a navigator.

A navigator is a class that encapsulates the grid by determining what tiles we can travel to from a given point. The project
contains two build in navigators, but you can make your own as long as they inherit from the abstract Navigator Class in ../pathfinding/core/Navigator.

If we wanted to initialize the "PlusNavigator" which allows movement in 4 directions (up,left,right,down) we can do so like:
```
const navigator = new PlusNavigator(grid);
```

We can access the neighbors of the point (3,3) like so:
```
const neighbors: Tile[] = navigator.neighbors({x: 3, y:3});
```

Now we can initialize a pathfinder that uses the AStar algorithm like this:
```
const pathfinder = new AStarPathfinder(navigator);
```

If we wanted to find the shortest path on the grid from (0,0) to (4,3) we would do it like this:
```
const initial = {x: 0, y: 0};
const goal = {x: 4, y: 3};
const path: Tile[] = pathfinder.findPath(initial, goal);
```

The AStar algorithm uses the Manhattan distance heuristic by default but you can find other heuristics in ../pathfinding/algorithms/Heuristics.

Lastly, we can randomly generate mazes with the TerrainMazeGenerator class:
```
const generator = new TerrainMazeGenerator(width, height);
```

We can invoke the random generation algorithm (recursive division) like:
```
const maze: Grid = generator.generateTerrain();
```
