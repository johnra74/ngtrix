import { TestBed } from '@angular/core/testing';

import { Board, Location, Shape, ShapeI, Type } from './shapes';
import { GameEngine } from './game.engine';

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

describe('GameEngine', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const game: GameEngine = TestBed.get(GameEngine);
    expect(game).toBeTruthy();
  });

  it('should pause/unpause', () => {
    const game: GameEngine = TestBed.get(GameEngine);
    expect(game).toBeTruthy();
    
    game.paused = true;
    expect(game.paused).toBeTruthy();

    game.paused = false;
    expect(game.paused).toBeFalsy();
  });

  it('should be game over', () => {
    const game: GameEngine = TestBed.get(GameEngine);

    let board: Board = new MockBoard();
    game.setBoard(board);

    board.currentShape = new ShapeI(board);
    game.checkGameOver();
    expect(game.gameOver).toBeTruthy();
  });


});
