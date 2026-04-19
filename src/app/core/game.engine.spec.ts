import { TestBed } from '@angular/core/testing';
import { Board, Location, Shape, ShapeI, ShapeJ, ShapeL, ShapeO, ShapeS, ShapeT, ShapeZ, Rotation, Type } from './shapes';
import { GameEngine } from './game.engine';

class MockBoard implements Board {
  cellSize: number = 10;
  filledCells: Location[] = [];
  currentShape: Shape;
  nextShape: Shape;
  audioPlayer: any;
  draw(): void {}
  drop(): void {}
}

class FixedShape extends Shape {
  constructor(board: Board, private _cells: Location[]) {
    super(board, 'red');
  }
  getType(): Type { return Type.I; }
  getCells(): Location[] { return this._cells; }
  protected createCellsBasedOnLocation(_loc: Location, _r?: Rotation): Location[] { return this._cells; }
  protected drawNorth(_ctx: CanvasRenderingContext2D): void {}
  protected drawEast(_ctx: CanvasRenderingContext2D): void {}
  protected drawSouth(_ctx: CanvasRenderingContext2D): void {}
  protected drawWest(_ctx: CanvasRenderingContext2D): void {}
  protected isValidBoardAction(_loc: Location, _r: Rotation): boolean { return true; }
}

function makeFullRow(y: number): Location[] {
  const cells: Location[] = [];
  for (let i = 0; i < 10; i++) cells.push(new Location(i, y));
  return cells;
}

describe('GameEngine', () => {
  let game: GameEngine;
  let board: MockBoard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    game = TestBed.inject(GameEngine);
    board = new MockBoard();
    game.setBoard(board);
  });

  afterEach(() => {
    game.endGame();
  });

  it('should be created', () => {
    expect(game).toBeTruthy();
  });

  it('should initialize paused to false after setBoard', () => {
    expect(game.paused).toBeFalsy();
  });

  it('should get and set paused', () => {
    game.paused = true;
    expect(game.paused).toBeTruthy();
    game.paused = false;
    expect(game.paused).toBeFalsy();
  });

  it('should get and set gameOver', () => {
    game.gameOver = true;
    expect(game.gameOver).toBeTruthy();
    game.gameOver = false;
    expect(game.gameOver).toBeFalsy();
  });

  it('should initialize score, level, and gameOver on startGame', () => {
    game.startGame();
    expect(game.score).toBe(0);
    expect(game.level).toBe(1);
    expect(game.gameOver).toBeFalsy();
  });

  it('should not throw when endGame called before startGame', () => {
    expect(() => game.endGame()).not.toThrow();
  });

  it('should not throw when endGame called after startGame', () => {
    game.startGame();
    expect(() => game.endGame()).not.toThrow();
  });

  describe('nextShape', () => {
    it('should return ShapeL when rand resolves to 1', () => {
      spyOn(Math, 'random').and.returnValue(0.0);
      expect(game.nextShape() instanceof ShapeL).toBeTruthy();
    });

    it('should return ShapeO when rand resolves to 2', () => {
      spyOn(Math, 'random').and.returnValue(0.2);
      expect(game.nextShape() instanceof ShapeO).toBeTruthy();
    });

    it('should return ShapeI when rand resolves to 3', () => {
      spyOn(Math, 'random').and.returnValue(0.3);
      expect(game.nextShape() instanceof ShapeI).toBeTruthy();
    });

    it('should return ShapeT when rand resolves to 4', () => {
      spyOn(Math, 'random').and.returnValue(0.5);
      expect(game.nextShape() instanceof ShapeT).toBeTruthy();
    });

    it('should return ShapeZ when rand resolves to 5', () => {
      spyOn(Math, 'random').and.returnValue(0.6);
      expect(game.nextShape() instanceof ShapeZ).toBeTruthy();
    });

    it('should return ShapeS when rand resolves to 6', () => {
      spyOn(Math, 'random').and.returnValue(0.75);
      expect(game.nextShape() instanceof ShapeS).toBeTruthy();
    });

    it('should return ShapeJ when rand resolves to 7', () => {
      spyOn(Math, 'random').and.returnValue(0.9);
      expect(game.nextShape() instanceof ShapeJ).toBeTruthy();
    });
  });

  describe('checkGameOver', () => {
    it('should set gameOver when a shape cell is at y < 0', () => {
      board.currentShape = new FixedShape(board, [new Location(4, -1)]);
      game.checkGameOver();
      expect(game.gameOver).toBeTruthy();
    });

    it('should pause and reset audio when gameOver and audioPlayer is defined', () => {
      const mockAudio = { pause: jasmine.createSpy('pause'), currentTime: 5 };
      board.audioPlayer = mockAudio;
      board.currentShape = new FixedShape(board, [new Location(4, -1)]);
      game.checkGameOver();
      expect(mockAudio.pause).toHaveBeenCalled();
      expect(mockAudio.currentTime).toBe(0);
    });

    it('should not set gameOver when all cells are at y >= 0', () => {
      board.currentShape = new FixedShape(board, [new Location(4, 0), new Location(4, 1)]);
      game.checkGameOver();
      expect(game.gameOver).toBeFalsy();
    });

    it('should set gameOver for default ShapeI position (has cell at y=-1)', () => {
      board.currentShape = new ShapeI(board);
      game.checkGameOver();
      expect(game.gameOver).toBeTruthy();
    });

    it('should not set gameOver when audioPlayer is undefined', () => {
      board.audioPlayer = undefined;
      board.currentShape = new FixedShape(board, [new Location(4, -1)]);
      expect(() => game.checkGameOver()).not.toThrow();
      expect(game.gameOver).toBeTruthy();
    });
  });

  describe('clearRows', () => {
    beforeEach(() => {
      game.startGame();
    });

    it('should not score for incomplete rows', () => {
      board.currentShape = new FixedShape(board, [new Location(0, 5)]);
      for (let i = 0; i < 9; i++) board.filledCells.push(new Location(i, 5));
      game.clearRows();
      expect(game.score).toBe(0);
    });

    it('should keep incomplete rows in filledCells', () => {
      board.currentShape = new FixedShape(board, [new Location(0, 5)]);
      for (let i = 0; i < 9; i++) board.filledCells.push(new Location(i, 5));
      game.clearRows();
      expect(board.filledCells.length).toBe(9);
    });

    it('should score 100 for clearing one row', () => {
      board.currentShape = new FixedShape(board, [new Location(0, 5)]);
      board.filledCells.push(...makeFullRow(5));
      game.clearRows();
      expect(game.score).toBe(100);
    });

    it('should remove cleared row from filledCells', () => {
      board.currentShape = new FixedShape(board, [new Location(0, 5)]);
      board.filledCells.push(...makeFullRow(5));
      game.clearRows();
      expect(board.filledCells.filter(c => c.getY() === 5).length).toBe(0);
    });

    it('should shift cells above cleared row down by one', () => {
      board.currentShape = new FixedShape(board, [new Location(0, 5)]);
      board.filledCells.push(...makeFullRow(5));
      board.filledCells.push(new Location(2, 3));
      game.clearRows();
      const shifted = board.filledCells.find(c => c.getX() === 2);
      expect(shifted.getY()).toBe(4);
    });

    it('should not shift cells below cleared row', () => {
      board.currentShape = new FixedShape(board, [new Location(0, 5)]);
      board.filledCells.push(...makeFullRow(5));
      board.filledCells.push(new Location(2, 8));
      game.clearRows();
      const below = board.filledCells.find(c => c.getX() === 2);
      expect(below.getY()).toBe(8);
    });

    it('should score 200 for clearing two rows', () => {
      board.currentShape = new FixedShape(board, [new Location(0, 4), new Location(0, 5)]);
      board.filledCells.push(...makeFullRow(4), ...makeFullRow(5));
      game.clearRows();
      expect(game.score).toBe(200);
    });

    it('should score 300 for clearing three rows', () => {
      board.currentShape = new FixedShape(board, [
        new Location(0, 3), new Location(0, 4), new Location(0, 5)
      ]);
      board.filledCells.push(...makeFullRow(3), ...makeFullRow(4), ...makeFullRow(5));
      game.clearRows();
      expect(game.score).toBe(300);
    });

    it('should score 800 for clearing four rows (tetris)', () => {
      board.currentShape = new FixedShape(board, [
        new Location(0, 2), new Location(0, 3), new Location(0, 4), new Location(0, 5)
      ]);
      board.filledCells.push(...makeFullRow(2), ...makeFullRow(3), ...makeFullRow(4), ...makeFullRow(5));
      game.clearRows();
      expect(game.score).toBe(800);
    });

    it('should score 1600 for second consecutive tetris', () => {
      board.currentShape = new FixedShape(board, [
        new Location(0, 2), new Location(0, 3), new Location(0, 4), new Location(0, 5)
      ]);
      board.filledCells.push(...makeFullRow(2), ...makeFullRow(3), ...makeFullRow(4), ...makeFullRow(5));
      game.clearRows();

      board.currentShape = new FixedShape(board, [
        new Location(0, 6), new Location(0, 7), new Location(0, 8), new Location(0, 9)
      ]);
      board.filledCells.push(...makeFullRow(6), ...makeFullRow(7), ...makeFullRow(8), ...makeFullRow(9));
      game.clearRows();

      expect(game.score).toBe(2400);
    });

    it('should reset consecutive tetris counter after non-tetris clear', () => {
      // First tetris
      board.currentShape = new FixedShape(board, [
        new Location(0, 2), new Location(0, 3), new Location(0, 4), new Location(0, 5)
      ]);
      board.filledCells.push(...makeFullRow(2), ...makeFullRow(3), ...makeFullRow(4), ...makeFullRow(5));
      game.clearRows();

      // Non-tetris clear
      board.currentShape = new FixedShape(board, [new Location(0, 10)]);
      board.filledCells.push(...makeFullRow(10));
      game.clearRows();

      // Next tetris should score 800 again, not 1600
      board.currentShape = new FixedShape(board, [
        new Location(0, 11), new Location(0, 12), new Location(0, 13), new Location(0, 14)
      ]);
      board.filledCells.push(...makeFullRow(11), ...makeFullRow(12), ...makeFullRow(13), ...makeFullRow(14));
      game.clearRows();

      expect(game.score).toBe(1700); // 800 + 100 + 800
    });

    it('should advance to level 2 after 10 rows cleared', () => {
      expect(game.level).toBe(1);
      for (let row = 5; row < 15; row++) {
        board.currentShape = new FixedShape(board, [new Location(0, row)]);
        board.filledCells.push(...makeFullRow(row));
        game.clearRows();
      }
      expect(game.level).toBe(2);
    });

    it('should advance to level 3 after 20 rows cleared', () => {
      for (let row = 0; row < 20; row++) {
        board.currentShape = new FixedShape(board, [new Location(0, row)]);
        board.filledCells.push(...makeFullRow(row));
        game.clearRows();
      }
      expect(game.level).toBe(3);
    });

    it('should add rows cleared from shape cells only once per unique row', () => {
      // currentShape has two cells in the same row — should only count that row once
      board.currentShape = new FixedShape(board, [new Location(0, 5), new Location(1, 5)]);
      board.filledCells.push(...makeFullRow(5));
      game.clearRows();
      expect(game.score).toBe(100); // row 5 cleared once
    });
  });
});
