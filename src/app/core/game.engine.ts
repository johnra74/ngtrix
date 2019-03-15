import { Injectable } from '@angular/core';
import { timer, Observable, Subscription } from 'rxjs';

import { Board, Location, Shape, ShapeI, ShapeJ, ShapeL, ShapeO, ShapeS, ShapeT, ShapeZ, Type } from '../core/shapes';

/** Class representing the core game logic */
@Injectable({
  providedIn: 'root'
})
export class GameEngine {

  /** game board */
  private board: Board;  

  /** counter used to control game speed */
  private counter: number;
  
  /** used to refresh UI */
  private renderSubscription: Subscription;
  /** used to control gravity */
  private engineSubscription: Subscription;

  private rowsCleared: number = 0;
  private numOfContinousTetris: number = 0;

  private _gameOver: boolean;
  get gameOver(): boolean {
    return this._gameOver;
  }

  set gameOver(gameOver: boolean) {
    this._gameOver = gameOver;
  }

  private _paused: boolean;
  get paused(): boolean {
    return this._paused;
  }

  set paused(paused: boolean) {
    this._paused = paused;
  }

  private _level: number;
  get level(): number {
    return this._level;
  }

  private _score: number = 0;
  get score(): number {
    return this._score;
  }

  constructor() { }

  /**
   * set game board
   * @param board - game board
   */
  public setBoard(board: Board): void {
    this.board = board;
    this._paused = false;
  }

  /**
   * reset data and start new game
   */
  public startGame(): void {
    this._score = 0;
    this._level = 1;

    this.gameOver = false;
    this.counter = 1;
    this.rowsCleared = 0;

    // setup frame rate - refresh screen every 15ms (~60fps)
    let renderTimer: Observable<number> = timer(1000, 15);
    this.renderSubscription = renderTimer.subscribe(() => {
      this.board.draw();
    });

    // setup gravity for current shape
    let engineTimer: Observable<number> = timer(1000, 100);
    this.engineSubscription = engineTimer.subscribe(() => {
      if (!this._paused) {
        let factor: number = (20 - this._level);
        if (factor < 1) {
          factor = 1; // don't increase speed beyond 1
        }
        
        if (this.counter++ % factor === 0) { // increase speed
          this.counter = 1; // reset counter.. avoid number overflow
          this.board.drop();
        }
      }
    });
  }

  /**
   * end game.
   */
  public endGame(): void {
    if (typeof this.renderSubscription !== 'undefined') {
      this.renderSubscription.unsubscribe();
    }
    if (typeof this.engineSubscription !== 'undefined') {
      this.engineSubscription.unsubscribe();
    }
  }

  /**
   * generates and retrieves next shape.
   */
  public nextShape(): Shape {
    let nextShape: Shape;
    let min = Math.ceil(1);
    let max = Math.floor(7);
    
    // The maximum is inclusive and the minimum is inclusive
    let rand:number = Math.floor(Math.random() * (max - min + 1)) + min; 
    if (rand === 1) {
      nextShape = new ShapeL(this.board);
    } else if (rand === 2) {
      nextShape = new ShapeO(this.board);
    } else if (rand === 3) {
      nextShape = new ShapeI(this.board);
    } else if (rand === 4) {
      nextShape = new ShapeT(this.board);
    } else if (rand === 5) {
      nextShape = new ShapeZ(this.board);
    } else if (rand === 6) {
      nextShape = new ShapeS(this.board);
    } else {
      nextShape = new ShapeJ(this.board);
    }

    return nextShape;
  }

  /**
   * when current shape is done and any cell is not exposed, game is over
   */
  public checkGameOver() : void {
    this.board.currentShape.getCells().forEach((cell:Location) => {
      if (cell.getY() < 0) {
        this._gameOver = true;
        if (typeof this.board.audioPlayer !== 'undefined') {
          this.board.audioPlayer.pause();
          this.board.audioPlayer.currentTime = 0;  
        }
        this.endGame();
      }
    })
  }

  /**
   * Note, there's no point in starting from bottom. It should only scan
   * only the unique rows of current shape.
   */
  public clearRows() : void {
    // extract rows to scan
    let clearRows: number[] = [];
    let cells: Location[] = this.board.currentShape.getCells();
    for (var i = 0; i < cells.length; i++) {
      if (clearRows.indexOf(cells[i].getY()) < 0) {
        clearRows.push(cells[i].getY());
      }
    }
    
    // scan for completely filled rows
    let removeRows: number[] = [];
    for (var i = 0; i < clearRows.length; i++) {
      let row: Location[] = this.board.filledCells.filter((cell:Location) => {
        return cell.getY() === clearRows[i];
      });

      if (row.length === 10) {
        removeRows.push(clearRows[i]);
      }
    }

    if (removeRows.length === 4) {
      this.numOfContinousTetris++;
      // TETRIS! if prior clear was tetris, give 1600 points. Otherwise, 800.
      this._score += this.numOfContinousTetris > 1 ? 1600 : 800;
      this.rowsCleared += 4;
    } else {
      this.numOfContinousTetris = 0;
      this._score += (removeRows.length * 100);
      this.rowsCleared += removeRows.length;
    }

    this._level = Math.floor(this.rowsCleared / 10) + 1;

    // remove rows
    removeRows = removeRows.sort();
    removeRows.forEach((row:number) => {
      // filter out all cells from row cleared
      this.board.filledCells = this.board.filledCells.filter((cell:Location) => {
        return cell.getY() != row;
      });

      // shift all rows above (lower number) down
      this.board.filledCells.forEach((cell: Location) => {
        if (cell.getY() < row) {
          cell.moveDown();
        }
      });
    })
  }
}
