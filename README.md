# Pathfinder

A website to visualize graph traversal algorithms and maze generation algorithms written using Typescript and React. Contains implementations of A*, Dijkstra, BFS, and DFS with bidirectional variants. Uses the recursive division algorithm to generate mazes with more horizontally or vertically biased variations. 

You can find an online demo [here](https://josephprichard.github.io/pathfinder)!

### The Algorithms

Each algorithm demonstrates different performance/correctness trade-offs.

`A*` - Guaranteed to always find the shortest path, minimizes number of nodes explored, very high constant time (more suitable for large graphs), uses a Heap for the frontier

`Dijkstra` - Guaranteed to always find the shortest path, explores many nodes (especially for unweighted graphs), tends to be slower than A*, uses a Heap for the frontier

`BFS` - Only finds the shortest path for unweighted graphs, explores a reasonable amount of nodes, very low constant time (more suitable for smaller graphs), uses a Queue for the frontier

`DFS` - Rarely finds the shortest path, explores few nodes, not optimal for pathfinding, uses a stack for the frontier

`Best First` - Not guaranteed to find the shortest path, explores the least amount of nodes, uses a Heap for the frontier

### Deployment

Add the following property to `package.json` containing the url the web page will be deployed at.
```
"homepage": "https://josephprichard.github.io/pathfinder"
```

Deploy the project to github pages using the following command.
```
npm run deploy
```

### Pathfinding

The project also contains standalone object-oriented style abstractions for pathfinding on a 2D grid.

The grid is based around 3 fundamental interfaces contained in `../pathfinding/core/Components`

Point, which represents an x,y location on the grid.
TileData, which stores the solidity of a tile and the cost to travel to a tile if it isn't solid.
Tile, which stores Point and TileData, representing a Vertex on the Grid.

We can create a grid with a width of 10 and a height of 5 like so:
```typescript
const grid = new Grid(10, 5);
```

Let's say we wanted to make the tile at (5,3) solid, so we can't travel there:
```typescript
const point = {x: 5, y: 3};
const data = {pathCost: 1, isSolid: true};
grid.mutate(point, data);
```

If we wanted to get the tile at the point (4,6) we would do it like this:
```typescript
grid.get({x: 4, y: 6});
```

The grid class contains minimal bound checks to speed up processing, but we can check the boundaries on 
the grid with these helpful functions:
```typescript
grid.inBounds(point);
grid.getWidth();
grid.getHeight();
```

This project also contains Pathfinders which can find the best path (capable by the algorithm) between an initial and goal point.

If we want to initialize a pathfinder we need to pass it a navigator.

A navigator is a class that encapsulates the grid by determining what tiles we can travel to from a given point. The project
contains two build in navigators, but you can make your own as long as they inherit from the abstract Navigator Class in `../pathfinding/core/Navigator`.

If we wanted to initialize the "PlusNavigator" which allows movement in 4 directions (up,left,right,down) we can do so like:
```typescript
const navigator = new PlusNavigator(grid);
```

We can access the neighbors of the point (3,3) like so:
```typescript
const neighbors: Tile[] = navigator.neighbors({x: 3, y:3});
```

Now we can initialize a pathfinder that uses the AStar algorithm like this:
```typescript
const pathfinder = new AStarPathfinder(navigator);
```

If we wanted to find the shortest path on the grid from (0,0) to (4,3) we would do it like this:
```typescript
const initial = {x: 0, y: 0};
const goal = {x: 4, y: 3};
const path: Tile[] = pathfinder.findPath(initial, goal);
```

The A* algorithm uses the Manhattan distance heuristic by default but you can find other heuristics in `../pathfinding/algorithms/Heuristics`.

Lastly, we can randomly generate mazes with the TerrainMazeGenerator class:
```typescript
const generator = new TerrainMazeGenerator(width, height);
```

We can invoke the random generation algorithm (recursive division) like:
```typescript
const maze: Grid = generator.generateTerrain();
```
