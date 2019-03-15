import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Board, Location, Shape, ShapeI, ShapeJ, ShapeL, ShapeO, ShapeS, ShapeT, ShapeZ, Type } from './shapes';

class MockBoard implements Board {
  cellSize: number = 10;
  filledCells: Location[] = [];
  currentShape: Shape;
  nextShape: Shape;
  audioPlayer: any;
  
  draw(): void {
    // mock draw
  }

  drop(): void {
    // mock drop
  }
}

function testMoveRight(component:Shape) {
  let beforeCells: Location[] = component.getCells();
  component.moveRight();

  expect(component).toBeTruthy();

  let cells: Location[] = component.getCells();
  for (var i = 0; i < cells.length; i++) {
    expect(cells[i].getY() === beforeCells[i].getY()).toBeTruthy();
    expect(cells[i].getX() === beforeCells[i].getX() + 1).toBeTruthy();
  }
}

function testMoveLeft(component:Shape) {
  let beforeCells: Location[] = component.getCells();
  component.moveLeft();

  expect(component).toBeTruthy();

  let cells: Location[] = component.getCells();
  for (var i = 0; i < cells.length; i++) {
    expect(cells[i].getY() === beforeCells[i].getY()).toBeTruthy();
    expect(cells[i].getX() === beforeCells[i].getX() - 1).toBeTruthy();
  }
}

function testDrop(component:Shape) {
  let beforeCells: Location[] = component.getCells();
  component.drop();

  expect(component).toBeTruthy();

  let cells: Location[] = component.getCells();
  for (var i = 0; i < cells.length; i++) {
    expect(cells[i].getY() === beforeCells[i].getY() + 1).toBeTruthy();
    expect(cells[i].getX() === beforeCells[i].getX()).toBeTruthy();
  }
}

function testDropUntilBoardBottom(component:Shape, pivotRow:number) {
  expect(component).toBeTruthy();
  let counter: number = 0;

  let beforeCells: Location[] = component.getCells();
  while(counter++ < pivotRow) {
    component.drop();
    let cells: Location[] = component.getCells();
    console.log('%s: %s=%s %s=%s %s=%s %s=%s', counter,
      beforeCells[0].getY() + counter, cells[0].getY(), 
      beforeCells[1].getY() + counter, cells[1].getY(), 
      beforeCells[2].getY() + counter, cells[2].getY(),
      beforeCells[3].getY() + counter, cells[3].getY());
    
    expect((beforeCells[0].getY() + counter) === cells[0].getY()).toBeTruthy();
    expect((beforeCells[1].getY() + counter) === cells[1].getY()).toBeTruthy();
    expect((beforeCells[2].getY() + counter) === cells[2].getY()).toBeTruthy();
    expect((beforeCells[3].getY() + counter) === cells[3].getY()).toBeTruthy();
  }

  component.drop();
  let cells: Location[] = component.getCells();
  expect((beforeCells[0].getY() + pivotRow) === cells[0].getY()).toBeTruthy();
  expect((beforeCells[1].getY() + pivotRow) === cells[1].getY()).toBeTruthy();
  expect((beforeCells[2].getY() + pivotRow) === cells[2].getY()).toBeTruthy();
  expect((beforeCells[3].getY() + pivotRow) === cells[3].getY()).toBeTruthy();
  expect(component.isDone()).toBeTruthy();
}

function testNotDroppedDueToOccupiedBoard(component: Shape, mockBoard: Board) {
  expect(component).toBeTruthy();

  // setup filled 2nd and 3rd rows 
  for (var i = 0; i < 10; i++) {
    mockBoard.filledCells.push(new Location(i, 2));
    mockBoard.filledCells.push(new Location(i, 3));
  }

  component.drop();
  let beforeCells: Location[] = component.getCells();
  component.drop(); // should not drop any more
  expect(component.isDone()).toBeTruthy();
  let cells: Location[] = component.getCells();
  for (var i = beforeCells.length - 1; i >= 0; i--) {
    expect(beforeCells[i].getX() === cells[i].getX()).toBeTruthy();
    expect(beforeCells[i].getY() === cells[i].getY()).toBeTruthy();
  }
}

function testNotMovedLeftBeyondBoard(component: Shape, numOfMoves: number = 4) {
  expect(component).toBeTruthy();
  let counter: number = 0;
  let beforeCells: Location[] = component.getCells();
  while(counter++ < numOfMoves) {
    component.moveLeft();
    let cells: Location[] = component.getCells();
    console.log('%s: %s=%s %s=%s %s=%s %s=%s', counter,
      beforeCells[0].getX() - counter, cells[0].getX(), 
      beforeCells[1].getX() - counter, cells[1].getX(), 
      beforeCells[2].getX() - counter, cells[2].getX(),
      beforeCells[3].getX() - counter, cells[3].getX());
    
    expect((beforeCells[0].getX() - counter) === cells[0].getX()).toBeTruthy();
    expect((beforeCells[1].getX() - counter) === cells[1].getX()).toBeTruthy();
    expect((beforeCells[2].getX() - counter) === cells[2].getX()).toBeTruthy();
    expect((beforeCells[3].getX() - counter) === cells[3].getX()).toBeTruthy();
  }

  component.moveLeft();
  let cells: Location[] = component.getCells();
  expect((beforeCells[0].getX() - numOfMoves) === cells[0].getX()).toBeTruthy();
  expect((beforeCells[1].getX() - numOfMoves) === cells[1].getX()).toBeTruthy();
  expect((beforeCells[2].getX() - numOfMoves) === cells[2].getX()).toBeTruthy();
  expect((beforeCells[3].getX() - numOfMoves) === cells[3].getX()).toBeTruthy();
}

function testNotMovedRightBeyondBoard(component: Shape, numOfMoves: number = 4) {
  expect(component).toBeTruthy();
  let counter: number = 0;
  let beforeCells: Location[] = component.getCells();
  while(counter++ < numOfMoves) {
    component.moveRight();
    let cells: Location[] = component.getCells();
    console.log('%s: %s=%s %s=%s %s=%s %s=%s', counter,
      beforeCells[0].getX() + counter, cells[0].getX(), 
      beforeCells[1].getX() + counter, cells[1].getX(), 
      beforeCells[2].getX() + counter, cells[2].getX(),
      beforeCells[3].getX() + counter, cells[3].getX());
    
    expect((beforeCells[0].getX() + counter) === cells[0].getX()).toBeTruthy();
    expect((beforeCells[1].getX() + counter) === cells[1].getX()).toBeTruthy();
    expect((beforeCells[2].getX() + counter) === cells[2].getX()).toBeTruthy();
    expect((beforeCells[3].getX() + counter) === cells[3].getX()).toBeTruthy();
  }

  component.moveRight();
  let cells: Location[] = component.getCells();
  expect((beforeCells[0].getX() + numOfMoves) === cells[0].getX()).toBeTruthy();
  expect((beforeCells[1].getX() + numOfMoves) === cells[1].getX()).toBeTruthy();
  expect((beforeCells[2].getX() + numOfMoves) === cells[2].getX()).toBeTruthy();
  expect((beforeCells[3].getX() + numOfMoves) === cells[3].getX()).toBeTruthy();
}

function testNotMoveLeftDueToOccupiedBoard(component: Shape, mockBoard: Board) {
  expect(component).toBeTruthy();

  component.drop();
  // setup filled 3rd through 5th column 
  for (var i = 0; i < 20; i++) {
    mockBoard.filledCells.push(new Location(3, i));
    mockBoard.filledCells.push(new Location(4, i));
    mockBoard.filledCells.push(new Location(5, i));
  }
  
  let beforeCells: Location[] = component.getCells();
  component.moveLeft(); // should not drop any more
  let cells: Location[] = component.getCells();
  for (var i = beforeCells.length - 1; i >= 0; i--) {
    console.log('%s=%s %s=%s',
      beforeCells[i].getX(), cells[i].getX(), 
      beforeCells[i].getY(), cells[i].getY());
    expect(beforeCells[i].getX() === cells[i].getX()).toBeTruthy();
    expect(beforeCells[i].getY() === cells[i].getY()).toBeTruthy();
  }
}

function testNotMoveRightDueToOccupiedBoard(component: Shape, mockBoard: Board) {
  expect(component).toBeTruthy();

  component.drop();
  // setup filled 3rd through 5th column 
  for (var i = 0; i < 20; i++) {
    mockBoard.filledCells.push(new Location(3, i));
    mockBoard.filledCells.push(new Location(4, i));
    mockBoard.filledCells.push(new Location(5, i));
  }
  
  let beforeCells: Location[] = component.getCells();
  component.moveRight(); // should not drop any more
  let cells: Location[] = component.getCells();
  for (var i = beforeCells.length - 1; i >= 0; i--) {
    console.log('%s=%s %s=%s',
      beforeCells[i].getX(), cells[i].getX(), 
      beforeCells[i].getY(), cells[i].getY());
    expect(beforeCells[i].getX() === cells[i].getX()).toBeTruthy();
    expect(beforeCells[i].getY() === cells[i].getY()).toBeTruthy();
  }
}

function testNotDropDueToOccupiredBoard(component: Shape, mockBoard: Board) {
  expect(component).toBeTruthy();
  component.drop();
  // setup filled 5th and 6th column 
  for (var i = 0; i < 20; i++) {
    mockBoard.filledCells.push(new Location(5, i));
    mockBoard.filledCells.push(new Location(6, i));
  }
  
  let beforeCells: Location[] = component.getCells();
  component.moveRight(); // should not drop any more
  let cells: Location[] = component.getCells();
  for (var i = beforeCells.length - 1; i >= 0; i--) {
    expect(beforeCells[i].getX() === cells[i].getX()).toBeTruthy();
    expect(beforeCells[i].getY() === cells[i].getY()).toBeTruthy();
  }
}

describe('ShapeComponent::ShapeL', () => {
  let component: Shape;
  let mockBoard: Board;
  let canvasCtx: CanvasRenderingContext2D;

  beforeEach(() => {
    mockBoard = new MockBoard();
    mockBoard.filledCells = []; // always clear
    component = new ShapeL(mockBoard);
    canvasCtx = document.createElement('canvas').getContext('2d');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.getType()).toEqual(Type.L, 'incorrect type returned!');
  });

  it('should move right', () => {
    testMoveRight(component);
  });

  it('should move left', () => {
    testMoveRight(component);
  });

  it('should drop', () => {
    testDrop(component);
  });

  it('should not drop beyond bottom border', () => {
    testDropUntilBoardBottom(component, 18);
  });

  it('should not drop due to occupied board', () => {
    testNotDroppedDueToOccupiedBoard(component, mockBoard);
  });

  it('should not move left beyond border', () => {
    testNotMovedLeftBeyondBoard(component);
  });

  it('should not move right beyond border', () => {
    testNotMovedRightBeyondBoard(component);
  });

  it('should not move left due to occupied board', () => {
    testNotMoveLeftDueToOccupiedBoard(component, mockBoard);
  });

  it('should not move right due to occupied board', () => {
    testNotMoveRightDueToOccupiedBoard(component, mockBoard);
  });

  it('should not drop due to occupied board', () => {
    testNotDropDueToOccupiredBoard(component, mockBoard);
  });

  it('should turn clock-wise 4x', () => {
    expect(component).toBeTruthy();
    
    /**
     * [1]                
     * [0]    -> [3][0][1]
     * [2][3]    [4]      
     */  
    let beforeCells: Location[] = component.getCells();
    component.rotateClockWise();
    let cells: Location[] = component.getCells();
    expect(beforeCells[0].getX() === cells[0].getX()).toBeTruthy();
    expect(beforeCells[0].getY() === cells[0].getY()).toBeTruthy();

    expect((beforeCells[1].getX() + 1) === cells[1].getX()).toBeTruthy();
    expect((beforeCells[1].getY() + 1) === cells[1].getY()).toBeTruthy();

    expect((beforeCells[2].getX() - 1) === cells[2].getX()).toBeTruthy();
    expect((beforeCells[2].getY() - 1) === cells[2].getY()).toBeTruthy();

    expect((beforeCells[3].getX() - 2) === cells[3].getX()).toBeTruthy();
    expect(beforeCells[3].getY() === cells[3].getY()).toBeTruthy();

    component.draw(canvasCtx);

    /**
     *              [3][2]
     * [2][0][1] ->    [0]
     * [3]             [1]
     */  
    beforeCells = component.getCells();
    component.rotateClockWise();
    cells = component.getCells();
    expect(beforeCells[0].getX() === cells[0].getX()).toBeTruthy();
    expect(beforeCells[0].getY() === cells[0].getY()).toBeTruthy();

    expect((beforeCells[1].getX() - 1) === cells[1].getX()).toBeTruthy();
    expect((beforeCells[1].getY() + 1) === cells[1].getY()).toBeTruthy();

    expect((beforeCells[2].getX() + 1) === cells[2].getX()).toBeTruthy();
    expect((beforeCells[2].getY() - 1) === cells[2].getY()).toBeTruthy();

    expect(beforeCells[3].getX() === cells[3].getX()).toBeTruthy();
    expect((beforeCells[3].getY() - 2) === cells[3].getY()).toBeTruthy();
    
    component.draw(canvasCtx);

    /**
     * [3][2]           [3]
     *    [0]  -> [1][0][2]
     *    [1]
     */  
    beforeCells = component.getCells();
    component.rotateClockWise();
    cells = component.getCells();
    expect(beforeCells[0].getX() === cells[0].getX()).toBeTruthy();
    expect(beforeCells[0].getY() === cells[0].getY()).toBeTruthy();

    expect((beforeCells[1].getX() - 1) === cells[1].getX()).toBeTruthy();
    expect((beforeCells[1].getY() - 1) === cells[1].getY()).toBeTruthy();

    expect((beforeCells[2].getX() + 1) === cells[2].getX()).toBeTruthy();
    expect((beforeCells[2].getY() + 1) === cells[2].getY()).toBeTruthy();

    expect((beforeCells[3].getX() + 2) === cells[3].getX()).toBeTruthy();
    expect(beforeCells[3].getY() === cells[3].getY()).toBeTruthy();

    component.draw(canvasCtx);

    /**
     *       [3]       [1]
     * [1][0][2]  ->   [0]
     *                 [2][3]
     */  
    beforeCells = component.getCells();
    component.rotateClockWise();
    cells = component.getCells();
    expect(beforeCells[0].getX() === cells[0].getX()).toBeTruthy();
    expect(beforeCells[0].getY() === cells[0].getY()).toBeTruthy();

    expect((beforeCells[1].getX() + 1) === cells[1].getX()).toBeTruthy();
    expect((beforeCells[1].getY() - 1) === cells[1].getY()).toBeTruthy();

    expect((beforeCells[2].getX() - 1) === cells[2].getX()).toBeTruthy();
    expect((beforeCells[2].getY() + 1) === cells[2].getY()).toBeTruthy();

    expect(beforeCells[3].getX() === cells[3].getX()).toBeTruthy();
    expect((beforeCells[3].getY() + 2) === cells[3].getY()).toBeTruthy();

    component.draw(canvasCtx);
  });

  it('should turn counter clock-wise 4x', () => {
    expect(component).toBeTruthy();
    
    /**
     *         [3]     [1]     
     *   [1][0][2]  <- [0]    
     *                 [2][3]  
     */  
    let beforeCells: Location[] = component.getCells();
    component.rotateCounterClockWise();
    let cells: Location[] = component.getCells();
    expect(beforeCells[0].getX() === cells[0].getX()).toBeTruthy();
    expect(beforeCells[0].getY() === cells[0].getY()).toBeTruthy();

    expect((beforeCells[1].getX() - 1) === cells[1].getX()).toBeTruthy();
    expect((beforeCells[1].getY() + 1) === cells[1].getY()).toBeTruthy();

    expect((beforeCells[2].getX() + 1) === cells[2].getX()).toBeTruthy();
    expect((beforeCells[2].getY() - 1) === cells[2].getY()).toBeTruthy();

    expect(beforeCells[3].getX() === cells[3].getX()).toBeTruthy();
    expect((beforeCells[3].getY() - 2) === cells[3].getY()).toBeTruthy();

    /**
     * [3][2]           [3]
     *    [0]  <- [1][0][2]
     *    [1]          
     */  
    beforeCells = component.getCells();
    component.rotateCounterClockWise();
    cells = component.getCells();
    expect(beforeCells[0].getX() === cells[0].getX()).toBeTruthy();
    expect(beforeCells[0].getY() === cells[0].getY()).toBeTruthy();

    expect((beforeCells[1].getX() + 1) === cells[1].getX()).toBeTruthy();
    expect((beforeCells[1].getY() + 1) === cells[1].getY()).toBeTruthy();

    expect((beforeCells[2].getX() - 1) === cells[2].getX()).toBeTruthy();
    expect((beforeCells[2].getY() - 1) === cells[2].getY()).toBeTruthy();

    expect((beforeCells[3].getX() - 2) === cells[3].getX()).toBeTruthy();
    expect(beforeCells[3].getY() === cells[3].getY()).toBeTruthy();

    /**
     *              [3][2] 
     * [2][0][1] <-    [0] 
     * [3]             [1]
     */  
    beforeCells = component.getCells();
    component.rotateCounterClockWise();
    cells = component.getCells();
    expect(beforeCells[0].getX() === cells[0].getX()).toBeTruthy();
    expect(beforeCells[0].getY() === cells[0].getY()).toBeTruthy();

    expect((beforeCells[1].getX() + 1) === cells[1].getX()).toBeTruthy();
    expect((beforeCells[1].getY() - 1) === cells[1].getY()).toBeTruthy();

    expect((beforeCells[2].getX() - 1) === cells[2].getX()).toBeTruthy();
    expect((beforeCells[2].getY() + 1) === cells[2].getY()).toBeTruthy();

    expect(beforeCells[3].getX() === cells[3].getX()).toBeTruthy();
    expect((beforeCells[3].getY() + 2) === cells[3].getY()).toBeTruthy();

    /**
     * [1]           
     * [0]    <- [2][0][1]  
     * [2][3]    [3]        
     */  
    beforeCells = component.getCells();
    component.rotateCounterClockWise();
    cells = component.getCells();
    expect(beforeCells[0].getX() === cells[0].getX()).toBeTruthy();
    expect(beforeCells[0].getY() === cells[0].getY()).toBeTruthy();

    expect((beforeCells[1].getX() - 1) === cells[1].getX()).toBeTruthy();
    expect((beforeCells[1].getY() - 1) === cells[1].getY()).toBeTruthy();

    expect((beforeCells[2].getX() + 1) === cells[2].getX()).toBeTruthy();
    expect((beforeCells[2].getY() + 1) === cells[2].getY()).toBeTruthy();

    expect((beforeCells[3].getX() + 2) === cells[3].getX()).toBeTruthy();
    expect(beforeCells[3].getY() === cells[3].getY()).toBeTruthy();

  });
});

describe('ShapeComponent::ShapeJ', () => {
  let component: Shape;
  let mockBoard: Board;
  let canvasCtx: CanvasRenderingContext2D;
  
  beforeEach(() => {
    mockBoard = new MockBoard();
    mockBoard.filledCells = []; // always clear
    component = new ShapeJ(mockBoard);
    canvasCtx = document.createElement('canvas').getContext('2d');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.getType()).toEqual(Type.J, 'incorrect type returned!');
  });

  it('should move right', () => {
    testMoveRight(component);
  });

  it('should move left', () => {
    testMoveRight(component);
  });

  it('should drop', () => {
    testDrop(component);
  });

  it('should not drop beyond bottom border', () => {
    testDropUntilBoardBottom(component, 18);
  });

  it('should not drop due to occupied board', () => {
    testNotDroppedDueToOccupiedBoard(component, mockBoard);
  });

  it('should not move left beyond border', () => {
    testNotMovedLeftBeyondBoard(component, 3);
  });

  it('should not move right beyond border', () => {
    testNotMovedRightBeyondBoard(component, 5);
  });

  it('should not move left due to occupied board', () => {
    testNotMoveLeftDueToOccupiedBoard(component, mockBoard);
  });

  it('should not move right due to occupied board', () => {
    testNotMoveRightDueToOccupiedBoard(component, mockBoard);
  });

  it('should not drop due to occupied board', () => {
    testNotDropDueToOccupiredBoard(component, mockBoard);
  });

  it('should turn clock-wise 4x', () => {
    expect(component).toBeTruthy();
    
    /**
     *    [1]    [3]            
     *    [0] -> [2][0][1]
     * [3][2]          
     */  
    let beforeCells: Location[] = component.getCells();
    component.rotateClockWise();
    let cells: Location[] = component.getCells();
    expect(beforeCells[0].getX() === cells[0].getX()).toBeTruthy();
    expect(beforeCells[0].getY() === cells[0].getY()).toBeTruthy();

    expect((beforeCells[1].getX() + 1) === cells[1].getX()).toBeTruthy();
    expect((beforeCells[1].getY() + 1) === cells[1].getY()).toBeTruthy();

    expect((beforeCells[2].getX() - 1) === cells[2].getX()).toBeTruthy();
    expect((beforeCells[2].getY() - 1) === cells[2].getY()).toBeTruthy();

    expect(beforeCells[3].getX() === cells[3].getX()).toBeTruthy();
    expect((beforeCells[3].getY() - 2) === cells[3].getY()).toBeTruthy();

    component.draw(canvasCtx);

    /**
     * [3]          [2][3]
     * [2][0][1] -> [0]
     *              [1]
     */  
    beforeCells = component.getCells();
    component.rotateClockWise();
    cells = component.getCells();
    expect(beforeCells[0].getX() === cells[0].getX()).toBeTruthy();
    expect(beforeCells[0].getY() === cells[0].getY()).toBeTruthy();

    expect((beforeCells[1].getX() - 1) === cells[1].getX()).toBeTruthy();
    expect((beforeCells[1].getY() + 1) === cells[1].getY()).toBeTruthy();

    expect((beforeCells[2].getX() + 1) === cells[2].getX()).toBeTruthy();
    expect((beforeCells[2].getY() - 1) === cells[2].getY()).toBeTruthy();

    expect((beforeCells[3].getX() + 2) === cells[3].getX()).toBeTruthy();
    expect(beforeCells[3].getY() === cells[3].getY()).toBeTruthy();

    component.draw(canvasCtx);

    /**
     * [2][3]
     * [0]  -> [1][0][2]
     * [1]           [3]
     */  
    beforeCells = component.getCells();
    component.rotateClockWise();
    cells = component.getCells();
    expect(beforeCells[0].getX() === cells[0].getX()).toBeTruthy();
    expect(beforeCells[0].getY() === cells[0].getY()).toBeTruthy();

    expect((beforeCells[1].getX() - 1) === cells[1].getX()).toBeTruthy();
    expect((beforeCells[1].getY() - 1) === cells[1].getY()).toBeTruthy();

    expect((beforeCells[2].getX() + 1) === cells[2].getX()).toBeTruthy();
    expect((beforeCells[2].getY() + 1) === cells[2].getY()).toBeTruthy();

    expect(beforeCells[3].getX() === cells[3].getX()).toBeTruthy();
    expect((beforeCells[3].getY() + 2) === cells[3].getY()).toBeTruthy();

    component.draw(canvasCtx);

    /**
     *                   [1]
     * [1][0][2]  ->     [0]
     *       [3]      [3][2]
     */  
    beforeCells = component.getCells();
    component.rotateClockWise();
    cells = component.getCells();
    expect(beforeCells[0].getX() === cells[0].getX()).toBeTruthy();
    expect(beforeCells[0].getY() === cells[0].getY()).toBeTruthy();

    expect((beforeCells[1].getX() + 1) === cells[1].getX()).toBeTruthy();
    expect((beforeCells[1].getY() - 1) === cells[1].getY()).toBeTruthy();

    expect((beforeCells[2].getX() - 1) === cells[2].getX()).toBeTruthy();
    expect((beforeCells[2].getY() + 1) === cells[2].getY()).toBeTruthy();

    expect((beforeCells[3].getX() - 2) === cells[3].getX()).toBeTruthy();
    expect(beforeCells[3].getY() === cells[3].getY()).toBeTruthy();

    component.draw(canvasCtx);
  });

  it('should turn counter clock-wise 4x', () => {
    expect(component).toBeTruthy();
    
    /**
     *                    [1]     
     *   [1][0][2]  <-    [0]    
     *         [3]     [3][2]  
     */  
    let beforeCells: Location[] = component.getCells();
    component.rotateCounterClockWise();
    let cells: Location[] = component.getCells();
    expect(beforeCells[0].getX() === cells[0].getX()).toBeTruthy();
    expect(beforeCells[0].getY() === cells[0].getY()).toBeTruthy();

    expect((beforeCells[1].getX() - 1) === cells[1].getX()).toBeTruthy();
    expect((beforeCells[1].getY() + 1) === cells[1].getY()).toBeTruthy();

    expect((beforeCells[2].getX() + 1) === cells[2].getX()).toBeTruthy();
    expect((beforeCells[2].getY() - 1) === cells[2].getY()).toBeTruthy();

    expect((beforeCells[3].getX() + 2) === cells[3].getX()).toBeTruthy();
    expect(beforeCells[3].getY() === cells[3].getY()).toBeTruthy();

    /**
     * [2][3]           
     * [0]     <- [1][0][2]
     * [1]              [3]
     */  
    beforeCells = component.getCells();
    component.rotateCounterClockWise();
    cells = component.getCells();
    expect(beforeCells[0].getX() === cells[0].getX()).toBeTruthy();
    expect(beforeCells[0].getY() === cells[0].getY()).toBeTruthy();

    expect((beforeCells[1].getX() + 1) === cells[1].getX()).toBeTruthy();
    expect((beforeCells[1].getY() + 1) === cells[1].getY()).toBeTruthy();

    expect((beforeCells[2].getX() - 1) === cells[2].getX()).toBeTruthy();
    expect((beforeCells[2].getY() - 1) === cells[2].getY()).toBeTruthy();

    expect(beforeCells[3].getX() === cells[3].getX()).toBeTruthy();
    expect((beforeCells[3].getY() - 2) === cells[3].getY()).toBeTruthy();

    /**
     * [3]          [2][3]
     * [2][0][1] <- [0] 
     *              [1]
     */  
    beforeCells = component.getCells();
    component.rotateCounterClockWise();
    cells = component.getCells();
    expect(beforeCells[0].getX() === cells[0].getX()).toBeTruthy();
    expect(beforeCells[0].getY() === cells[0].getY()).toBeTruthy();

    expect((beforeCells[1].getX() + 1) === cells[1].getX()).toBeTruthy();
    expect((beforeCells[1].getY() - 1) === cells[1].getY()).toBeTruthy();

    expect((beforeCells[2].getX() - 1) === cells[2].getX()).toBeTruthy();
    expect((beforeCells[2].getY() + 1) === cells[2].getY()).toBeTruthy();

    expect((beforeCells[3].getX() - 2) === cells[3].getX()).toBeTruthy();
    expect(beforeCells[3].getY() === cells[3].getY()).toBeTruthy();

    /**
     *    [1]     [3] 
     *    [0]  <- [2][0][1]  
     * [3][2]           
     */  
    beforeCells = component.getCells();
    component.rotateCounterClockWise();
    cells = component.getCells();
    expect(beforeCells[0].getX() === cells[0].getX()).toBeTruthy();
    expect(beforeCells[0].getY() === cells[0].getY()).toBeTruthy();

    expect((beforeCells[1].getX() - 1) === cells[1].getX()).toBeTruthy();
    expect((beforeCells[1].getY() - 1) === cells[1].getY()).toBeTruthy();

    expect((beforeCells[2].getX() + 1) === cells[2].getX()).toBeTruthy();
    expect((beforeCells[2].getY() + 1) === cells[2].getY()).toBeTruthy();

    expect(beforeCells[3].getX() === cells[3].getX()).toBeTruthy();
    expect((beforeCells[3].getY() + 2) === cells[3].getY()).toBeTruthy();

  });

});

describe('ShapeComponent::ShapeO', () => {
  let component: Shape;
  let mockBoard: Board;
  let canvasCtx: CanvasRenderingContext2D;

  beforeEach(() => {
    mockBoard = new MockBoard();
    mockBoard.filledCells = []; // always clear
    component = new ShapeO(mockBoard);
    canvasCtx = document.createElement('canvas').getContext('2d');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.getType()).toEqual(Type.O, 'incorrect type returned!');
  });

  it('should move right', () => {
    testMoveRight(component);
  });

  it('should move left', () => {
    testMoveRight(component);
  });

  it('should drop', () => {
    testDrop(component);
  });

  it('should not drop beyond bottom border', () => {
    testDropUntilBoardBottom(component, 19);
  });

  it('should not drop due to occupied board', () => {
    testNotDroppedDueToOccupiedBoard(component, mockBoard);
  });

  it('should not move left beyond border', () => {
    testNotMovedLeftBeyondBoard(component);
  });

  it('should not move right beyond border', () => {
    testNotMovedRightBeyondBoard(component);
  });

  it('should not move left due to occupied board', () => {
    testNotMoveLeftDueToOccupiedBoard(component, mockBoard);
  });

  it('should not move right due to occupied board', () => {
    testNotMoveRightDueToOccupiedBoard(component, mockBoard);
  });

  it('should not drop due to occupied board', () => {
    testNotDropDueToOccupiredBoard(component, mockBoard);
  });

  it('should turn clock-wise 4x', () => {
    expect(component).toBeTruthy();    
    /**
     * Rotating will always return same cells
     */  
    let beforeCells: Location[] = component.getCells();
    for (var i = 0; i < 5; i++) {
      component.rotateClockWise();
      let cells: Location[] = component.getCells();
      for (var j = 0; j < 4; j++) {
        expect(beforeCells[j].getX() === cells[j].getX()).toBeTruthy();
        expect(beforeCells[j].getY() === cells[j].getY()).toBeTruthy();
      }

      component.draw(canvasCtx);
    }
  });

  it('should turn counter clock-wise 4x', () => {
    expect(component).toBeTruthy();    
    /**
     * Rotating will always return same cells
     */  
    let beforeCells: Location[] = component.getCells();
    for (var i = 0; i < 5; i++) {
      component.rotateCounterClockWise();
      let cells: Location[] = component.getCells();
      for (var j = 0; j < 4; j++) {
        expect(beforeCells[j].getX() === cells[j].getX()).toBeTruthy();
        expect(beforeCells[j].getY() === cells[j].getY()).toBeTruthy();
      }
    }
  });
});

describe('ShapeComponent::ShapeI', () => {
  let component: Shape;
  let mockBoard: Board;
  let canvasCtx: CanvasRenderingContext2D;

  beforeEach(() => {
    mockBoard = new MockBoard();
    mockBoard.filledCells = []; // always clear
    component = new ShapeI(mockBoard);
    canvasCtx = document.createElement('canvas').getContext('2d');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.getType()).toEqual(Type.I, 'incorrect type returned!');
  });

  it('should move right', () => {
    testMoveRight(component);
  });

  it('should move left', () => {
    testMoveRight(component);
  });

  it('should drop', () => {
    testDrop(component);
  });

  it('should not drop beyond bottom border', () => {
    testDropUntilBoardBottom(component, 17);
  });

  it('should not drop due to occupied board', () => {
    testNotDroppedDueToOccupiedBoard(component, mockBoard);
  });

  it('should not move left beyond border', () => {
    testNotMovedLeftBeyondBoard(component);
  });

  it('should not move right beyond border', () => {
    testNotMovedRightBeyondBoard(component, 5);
  });

  it('should not move left due to occupied board', () => {
    testNotMoveLeftDueToOccupiedBoard(component, mockBoard);
  });

  it('should not move right due to occupied board', () => {
    testNotMoveRightDueToOccupiedBoard(component, mockBoard);
  });

  it('should not drop due to occupied board', () => {
    testNotDropDueToOccupiredBoard(component, mockBoard);
  });

  it('should turn clock-wise 4x', () => {
    expect(component).toBeTruthy();
    
    /**
     *    [1]       
     *    [0] -> [1][0][2][3] 
     *    [2] 
     *    [3]         
     */  
    let beforeCells: Location[] = component.getCells();
    for (var i = 0; i < 5; i++) {
      component.rotateClockWise();
      let cells: Location[] = component.getCells();

      if ( i % 2 === 0) {
        // now horizontal
        expect(beforeCells[0].getX() === cells[0].getX()).toBeTruthy();
        expect(beforeCells[0].getY() === cells[0].getY()).toBeTruthy();

        expect((beforeCells[1].getX() - 1) === cells[1].getX()).toBeTruthy();
        expect((beforeCells[1].getY() + 1) === cells[1].getY()).toBeTruthy();

        expect((beforeCells[2].getX() + 1) === cells[2].getX()).toBeTruthy();
        expect((beforeCells[2].getY() - 1) === cells[2].getY()).toBeTruthy();

        expect((beforeCells[3].getX() + 2) === cells[3].getX()).toBeTruthy();
        expect((beforeCells[3].getY() - 2) === cells[3].getY()).toBeTruthy();

        component.draw(canvasCtx);

      } else {
        // back to vertical...
        for (var j = 0; j < 4; j++) {
          expect(beforeCells[j].getX() === cells[j].getX()).toBeTruthy();
          expect(beforeCells[j].getY() === cells[j].getY()).toBeTruthy();
        }

        component.draw(canvasCtx);
      }
    }
  });

  it('should turn counter clock-wise 4x', () => {
    expect(component).toBeTruthy();
    
    /**
     *                    [1]       
     *  [1][0][2][3]  <-  [0]
     *                    [2] 
     *                    [3]         
     */  
    let beforeCells: Location[] = component.getCells();
    for (var i = 0; i < 5; i++) {
      component.rotateClockWise();
      let cells: Location[] = component.getCells();

      if ( i % 2 === 0) {
        // now horizontal
        expect(beforeCells[0].getX() === cells[0].getX()).toBeTruthy();
        expect(beforeCells[0].getY() === cells[0].getY()).toBeTruthy();

        expect((beforeCells[1].getX() - 1) === cells[1].getX()).toBeTruthy();
        expect((beforeCells[1].getY() + 1) === cells[1].getY()).toBeTruthy();

        expect((beforeCells[2].getX() + 1) === cells[2].getX()).toBeTruthy();
        expect((beforeCells[2].getY() - 1) === cells[2].getY()).toBeTruthy();

        expect((beforeCells[3].getX() + 2) === cells[3].getX()).toBeTruthy();
        expect((beforeCells[3].getY() - 2) === cells[3].getY()).toBeTruthy();
      } else {
        // back to vertical...
        for (var j = 0; j < 4; j++) {
          expect(beforeCells[j].getX() === cells[j].getX()).toBeTruthy();
          expect(beforeCells[j].getY() === cells[j].getY()).toBeTruthy();
        }
      }
    }  
  });
});

describe('ShapeComponent::ShapeT', () => {
  let component: Shape;
  let mockBoard: Board;
  let canvasCtx: CanvasRenderingContext2D;

  beforeEach(() => {
    mockBoard = new MockBoard();
    mockBoard.filledCells = []; // always clear
    component = new ShapeT(mockBoard);
    canvasCtx = document.createElement('canvas').getContext('2d');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.getType()).toEqual(Type.T, 'incorrect type returned!');
  });

  it('should move right', () => {
    testMoveRight(component);
  });

  it('should move left', () => {
    testMoveRight(component);
  });

  it('should drop', () => {
    testDrop(component);
  });

  it('should not drop beyond bottom border', () => {
    testDropUntilBoardBottom(component, 19);
  });

  it('should not drop due to occupied board', () => {
    testNotDroppedDueToOccupiedBoard(component, mockBoard);
  });

  it('should not move left beyond border', () => {
    testNotMovedLeftBeyondBoard(component, 3);
  });

  it('should not move right beyond border', () => {
    testNotMovedRightBeyondBoard(component);
  });

  it('should not move left due to occupied board', () => {
    testNotMoveLeftDueToOccupiedBoard(component, mockBoard);
  });

  it('should not move right due to occupied board', () => {
    testNotMoveRightDueToOccupiedBoard(component, mockBoard);
  });

  it('should not drop due to occupied board', () => {
    testNotDropDueToOccupiredBoard(component, mockBoard);
  });

  it('should turn clock-wise 4x', () => {
    expect(component).toBeTruthy();
    
    /**
     *    [3]       [1]            
     * [1][0][2] -> [0][3]
     *              [2]
     */  
    let beforeCells: Location[] = component.getCells();
    component.rotateClockWise();
    let cells: Location[] = component.getCells();
    expect(beforeCells[0].getX() === cells[0].getX()).toBeTruthy();
    expect(beforeCells[0].getY() === cells[0].getY()).toBeTruthy();

    expect((beforeCells[1].getX() + 1) === cells[1].getX()).toBeTruthy();
    expect((beforeCells[1].getY() - 1) === cells[1].getY()).toBeTruthy();

    expect((beforeCells[2].getX() - 1) === cells[2].getX()).toBeTruthy();
    expect((beforeCells[2].getY() + 1) === cells[2].getY()).toBeTruthy();

    expect((beforeCells[3].getX() + 1) === cells[3].getX()).toBeTruthy();
    expect((beforeCells[3].getY() + 1) === cells[3].getY()).toBeTruthy();

    component.draw(canvasCtx);

    /**
     * [1]                   
     * [0][3] -> [2][0][1]
     * [2]          [3]
     */  
    beforeCells = component.getCells();
    component.rotateClockWise();
    cells = component.getCells();
    expect(beforeCells[0].getX() === cells[0].getX()).toBeTruthy();
    expect(beforeCells[0].getY() === cells[0].getY()).toBeTruthy();

    expect((beforeCells[1].getX() + 1) === cells[1].getX()).toBeTruthy();
    expect((beforeCells[1].getY() + 1) === cells[1].getY()).toBeTruthy();

    expect((beforeCells[2].getX() - 1) === cells[2].getX()).toBeTruthy();
    expect((beforeCells[2].getY() - 1) === cells[2].getY()).toBeTruthy();

    expect((beforeCells[3].getX() - 1) === cells[3].getX()).toBeTruthy();
    expect((beforeCells[3].getY() + 1) === cells[3].getY()).toBeTruthy();

    component.draw(canvasCtx);

    /**
     *                 [2]
     * [2][0][1] -> [3][0]
     *    [3]          [1]
     */  
    beforeCells = component.getCells();
    component.rotateClockWise();
    cells = component.getCells();
    expect(beforeCells[0].getX() === cells[0].getX()).toBeTruthy();
    expect(beforeCells[0].getY() === cells[0].getY()).toBeTruthy();

    expect((beforeCells[1].getX() - 1) === cells[1].getX()).toBeTruthy();
    expect((beforeCells[1].getY() + 1) === cells[1].getY()).toBeTruthy();

    expect((beforeCells[2].getX() + 1) === cells[2].getX()).toBeTruthy();
    expect((beforeCells[2].getY() - 1) === cells[2].getY()).toBeTruthy();

    expect((beforeCells[3].getX() - 1) === cells[3].getX()).toBeTruthy();
    expect((beforeCells[3].getY() - 1) === cells[3].getY()).toBeTruthy();

    component.draw(canvasCtx);

    /**
     *    [2]        [3]
     * [3][0]  -> [1][0][2]
     *    [1]          
     */  
    beforeCells = component.getCells();
    component.rotateClockWise();
    cells = component.getCells();
    expect(beforeCells[0].getX() === cells[0].getX()).toBeTruthy();
    expect(beforeCells[0].getY() === cells[0].getY()).toBeTruthy();

    expect((beforeCells[1].getX() - 1) === cells[1].getX()).toBeTruthy();
    expect((beforeCells[1].getY() - 1) === cells[1].getY()).toBeTruthy();

    expect((beforeCells[2].getX() + 1) === cells[2].getX()).toBeTruthy();
    expect((beforeCells[2].getY() + 1) === cells[2].getY()).toBeTruthy();

    expect((beforeCells[3].getX() + 1) === cells[3].getX()).toBeTruthy();
    expect((beforeCells[3].getY() - 1) === cells[3].getY()).toBeTruthy();

    component.draw(canvasCtx);
  });

  it('should turn counter clock-wise 4x', () => {
    expect(component).toBeTruthy();
    
    /**
     *     [2]        [3]                
     *  [3][0]  <- [1][0][2] 
     *     [1]   
     */  
    let beforeCells: Location[] = component.getCells();
    component.rotateCounterClockWise();
    let cells: Location[] = component.getCells();
    expect(beforeCells[0].getX() === cells[0].getX()).toBeTruthy();
    expect(beforeCells[0].getY() === cells[0].getY()).toBeTruthy();

    expect((beforeCells[1].getX() + 1) === cells[1].getX()).toBeTruthy();
    expect((beforeCells[1].getY() + 1) === cells[1].getY()).toBeTruthy();

    expect((beforeCells[2].getX() - 1) === cells[2].getX()).toBeTruthy();
    expect((beforeCells[2].getY() - 1) === cells[2].getY()).toBeTruthy();

    expect((beforeCells[3].getX() - 1) === cells[3].getX()).toBeTruthy();
    expect((beforeCells[3].getY() + 1) === cells[3].getY()).toBeTruthy();

    /**
     *                   [2]                
     *  [2][0][1]  <- [3][0] 
     *     [3]           [1]
     */  
    beforeCells = component.getCells();
    component.rotateCounterClockWise();
    cells = component.getCells();
    expect(beforeCells[0].getX() === cells[0].getX()).toBeTruthy();
    expect(beforeCells[0].getY() === cells[0].getY()).toBeTruthy();

    expect((beforeCells[1].getX() + 1) === cells[1].getX()).toBeTruthy();
    expect((beforeCells[1].getY() - 1) === cells[1].getY()).toBeTruthy();

    expect((beforeCells[2].getX() - 1) === cells[2].getX()).toBeTruthy();
    expect((beforeCells[2].getY() + 1) === cells[2].getY()).toBeTruthy();

    expect((beforeCells[3].getX() + 1) === cells[3].getX()).toBeTruthy();
    expect((beforeCells[3].getY() + 1) === cells[3].getY()).toBeTruthy();

    /**
     *   [1]                          
     *   [0][3]  <-  [2][0][1]   
     *   [2]            [3]     
     */  
    beforeCells = component.getCells();
    component.rotateCounterClockWise();
    cells = component.getCells();
    expect(beforeCells[0].getX() === cells[0].getX()).toBeTruthy();
    expect(beforeCells[0].getY() === cells[0].getY()).toBeTruthy();

    expect((beforeCells[1].getX() - 1) === cells[1].getX()).toBeTruthy();
    expect((beforeCells[1].getY() - 1) === cells[1].getY()).toBeTruthy();

    expect((beforeCells[2].getX() + 1) === cells[2].getX()).toBeTruthy();
    expect((beforeCells[2].getY() + 1) === cells[2].getY()).toBeTruthy();

    expect((beforeCells[3].getX() + 1) === cells[3].getX()).toBeTruthy();
    expect((beforeCells[3].getY() - 1) === cells[3].getY()).toBeTruthy();

    /**
     *    [3]       [1]                          
     * [1][0][2] <- [0][3]   
     *              [2]     
     */  
    beforeCells = component.getCells();
    component.rotateCounterClockWise();
    cells = component.getCells();
    expect(beforeCells[0].getX() === cells[0].getX()).toBeTruthy();
    expect(beforeCells[0].getY() === cells[0].getY()).toBeTruthy();

    expect((beforeCells[1].getX() - 1) === cells[1].getX()).toBeTruthy();
    expect((beforeCells[1].getY() + 1) === cells[1].getY()).toBeTruthy();

    expect((beforeCells[2].getX() + 1) === cells[2].getX()).toBeTruthy();
    expect((beforeCells[2].getY() - 1) === cells[2].getY()).toBeTruthy();

    expect((beforeCells[3].getX() - 1) === cells[3].getX()).toBeTruthy();
    expect((beforeCells[3].getY() - 1) === cells[3].getY()).toBeTruthy();
  });
});

describe('ShapeComponent::ShapeZ', () => {
  let component: Shape;
  let mockBoard: Board;
  let canvasCtx: CanvasRenderingContext2D;

  beforeEach(() => {
    mockBoard = new MockBoard();
    mockBoard.filledCells = []; // always clear
    component = new ShapeZ(mockBoard);
    canvasCtx = document.createElement('canvas').getContext('2d');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.getType()).toEqual(Type.Z, 'incorrect type returned!');
  });

  it('should move right', () => {
    testMoveRight(component);
  });

  it('should move left', () => {
    testMoveRight(component);
  });

  it('should drop', () => {
    testDrop(component);
  });

  it('should not drop beyond bottom border', () => {
    testDropUntilBoardBottom(component, 18);
  });

  it('should not drop due to occupied board', () => {
    testNotDroppedDueToOccupiedBoard(component, mockBoard);
  });

  it('should not move left beyond border', () => {
    testNotMovedLeftBeyondBoard(component, 3);
  });

  it('should not move right beyond border', () => {
    testNotMovedRightBeyondBoard(component);
  });

  it('should not move left due to occupied board', () => {
    testNotMoveLeftDueToOccupiedBoard(component, mockBoard);
  });

  it('should not move right due to occupied board', () => {
    testNotMoveRightDueToOccupiedBoard(component, mockBoard);
  });

  it('should not drop due to occupied board', () => {
    testNotDropDueToOccupiredBoard(component, mockBoard);
  });

  it('should turn clock-wise 4x', () => {
    expect(component).toBeTruthy();
    
    /**
     *                   [1]    
     *  [1][0]    ->  [2][0]
     *     [2][3]     [3]          
     */    
    let beforeCells: Location[] = component.getCells();
    for (var i = 0; i < 5; i++) {
      component.rotateClockWise();
      let cells: Location[] = component.getCells();

      if ( i % 2 === 0) {
        // now horizontal
        expect(beforeCells[0].getX() === cells[0].getX()).toBeTruthy();
        expect(beforeCells[0].getY() === cells[0].getY()).toBeTruthy();

        expect((beforeCells[1].getX() + 1) === cells[1].getX()).toBeTruthy();
        expect((beforeCells[1].getY() - 1) === cells[1].getY()).toBeTruthy();

        expect((beforeCells[2].getX() - 1) === cells[2].getX()).toBeTruthy();
        expect((beforeCells[2].getY() - 1) === cells[2].getY()).toBeTruthy();

        expect((beforeCells[3].getX() - 2) === cells[3].getX()).toBeTruthy();
        expect(beforeCells[3].getY() === cells[3].getY()).toBeTruthy();

        component.draw(canvasCtx);

      } else {
        // back to vertical...
        for (var j = 0; j < 4; j++) {
          expect(beforeCells[j].getX() === cells[j].getX()).toBeTruthy();
          expect(beforeCells[j].getY() === cells[j].getY()).toBeTruthy();
        }

        component.draw(canvasCtx);
      }
    }
  });
  
  it('should turn counter clock-wise 4x', () => {
    expect(component).toBeTruthy();
    
    /**
     *     [1]               
     *  [2][0]  <- [1][0]
     *  [3]           [2][3]          
     */  
    let beforeCells: Location[] = component.getCells();
    for (var i = 0; i < 5; i++) {
      component.rotateClockWise();
      let cells: Location[] = component.getCells();

      if ( i % 2 === 0) {
        // now horizontal
        expect(beforeCells[0].getX() === cells[0].getX()).toBeTruthy();
        expect(beforeCells[0].getY() === cells[0].getY()).toBeTruthy();

        expect((beforeCells[1].getX() + 1) === cells[1].getX()).toBeTruthy();
        expect((beforeCells[1].getY() - 1) === cells[1].getY()).toBeTruthy();

        expect((beforeCells[2].getX() - 1) === cells[2].getX()).toBeTruthy();
        expect((beforeCells[2].getY() - 1) === cells[2].getY()).toBeTruthy();

        expect((beforeCells[3].getX() - 2) === cells[3].getX()).toBeTruthy();
        expect(beforeCells[3].getY() === cells[3].getY()).toBeTruthy();
      } else {
        // back to vertical...
        for (var j = 0; j < 4; j++) {
          expect(beforeCells[j].getX() === cells[j].getX()).toBeTruthy();
          expect(beforeCells[j].getY() === cells[j].getY()).toBeTruthy();
        }
      }
    }  
  });
});

describe('ShapeComponent::ShapeS', () => {
  let component: Shape;
  let mockBoard: Board;
  let canvasCtx: CanvasRenderingContext2D;

  beforeEach(() => {
    mockBoard = new MockBoard();
    mockBoard.filledCells = []; // always clear
    component = new ShapeS(mockBoard);
    canvasCtx = document.createElement('canvas').getContext('2d');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.getType()).toEqual(Type.S, 'incorrect type returned!');
  });

  it('should move right', () => {
    testMoveRight(component);
  });

  it('should move left', () => {
    testMoveRight(component);
  });

  it('should drop', () => {
    testDrop(component);
  });

  it('should not drop beyond bottom border', () => {
    testDropUntilBoardBottom(component, 18);
  });

  it('should not drop due to occupied board', () => {
    testNotDroppedDueToOccupiedBoard(component, mockBoard);
  });

  it('should not move left beyond border', () => {
    testNotMovedLeftBeyondBoard(component, 3);
  });

  it('should not move right beyond border', () => {
    testNotMovedRightBeyondBoard(component);
  });

  it('should not move left due to occupied board', () => {
    testNotMoveLeftDueToOccupiedBoard(component, mockBoard);
  });

  it('should not move right due to occupied board', () => {
    testNotMoveRightDueToOccupiedBoard(component, mockBoard);
  });

  it('should not drop due to occupied board', () => {
    testNotDropDueToOccupiredBoard(component, mockBoard);
  });

  it('should turn clock-wise 4x', () => {
    expect(component).toBeTruthy();
    
    /**
     *                 [1]    
     *     [0][1]  ->  [0][2]
     *  [3][2]            [3]          
     */    
    let beforeCells: Location[] = component.getCells();
    for (var i = 0; i < 5; i++) {
      component.rotateClockWise();
      let cells: Location[] = component.getCells();

      if ( i % 2 === 0) {
        // now horizontal
        expect(beforeCells[0].getX() === cells[0].getX()).toBeTruthy();
        expect(beforeCells[0].getY() === cells[0].getY()).toBeTruthy();

        expect((beforeCells[1].getX() - 1) === cells[1].getX()).toBeTruthy();
        expect((beforeCells[1].getY() - 1) === cells[1].getY()).toBeTruthy();

        expect((beforeCells[2].getX() + 1) === cells[2].getX()).toBeTruthy();
        expect((beforeCells[2].getY() - 1) === cells[2].getY()).toBeTruthy();

        expect((beforeCells[3].getX() + 2) === cells[3].getX()).toBeTruthy();
        expect(beforeCells[3].getY() === cells[3].getY()).toBeTruthy();

        component.draw(canvasCtx);
      } else {
        // back to vertical...
        for (var j = 0; j < 4; j++) {
          expect(beforeCells[j].getX() === cells[j].getX()).toBeTruthy();
          expect(beforeCells[j].getY() === cells[j].getY()).toBeTruthy();
        }

        component.draw(canvasCtx);
      }
    }
  });
  
  it('should turn counter clock-wise 4x', () => {
    expect(component).toBeTruthy();
    
    /**
     *  [1]               
     *  [0][2]  <-    [0][1]
     *     [3]     [3][2]          
     */  
    let beforeCells: Location[] = component.getCells();
    for (var i = 0; i < 5; i++) {
      component.rotateClockWise();
      let cells: Location[] = component.getCells();

      if ( i % 2 === 0) {
        // now horizontal
        expect(beforeCells[0].getX() === cells[0].getX()).toBeTruthy();
        expect(beforeCells[0].getY() === cells[0].getY()).toBeTruthy();

        expect((beforeCells[1].getX() - 1) === cells[1].getX()).toBeTruthy();
        expect((beforeCells[1].getY() - 1) === cells[1].getY()).toBeTruthy();

        expect((beforeCells[2].getX() + 1) === cells[2].getX()).toBeTruthy();
        expect((beforeCells[2].getY() - 1) === cells[2].getY()).toBeTruthy();

        expect((beforeCells[3].getX() + 2) === cells[3].getX()).toBeTruthy();
        expect(beforeCells[3].getY() === cells[3].getY()).toBeTruthy();
      } else {
        // back to vertical...
        for (var j = 0; j < 4; j++) {
          expect(beforeCells[j].getX() === cells[j].getX()).toBeTruthy();
          expect(beforeCells[j].getY() === cells[j].getY()).toBeTruthy();
        }
      }
    }  
  });
});

describe('ShapeComponent::Location', () => {
  let component: Location;

  beforeEach(() => {
    component = new Location(5,0);
  });

  it('should move left', () => {
    component.moveLeft();
    expect(component.getX()).toEqual(4);
    expect(component.getY()).toEqual(0);
  });

  it('should move right', () => {
    component.moveRight();
    expect(component.getX()).toEqual(6);
    expect(component.getY()).toEqual(0);
  });

  it('should drop', () => {
    component.moveDown();
    expect(component.getX()).toEqual(5);
    expect(component.getY()).toEqual(1);
  });
});