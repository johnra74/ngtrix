import { ElementRef } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

/** enum of shape rotations */
export enum Rotation {
  NORTH = 1,
  EAST,
  SOUTH,
  WEST,
}

/** enum of shape types */
export enum Type {
  L = 1,
  J,
  O,
  I,
  T,
  Z,
  S
}

/** interface for game board */
export interface Board {
  currentShape: Shape;
  nextShape: Shape;
  filledCells: Location[];
  cellSize: number;
  audioPlayer: any;

  /**
   * draw game on canvas
   */
  draw(): void;

  /**
   * drop current shape based on game gravity
   */
  drop(): void;
}

/** class representing the location of single cell in a shape */
export class Location {

  /** shape color */
  private color: string;

  /**
   * zero based index with top left corner with coordinate (0,0) and
   * bottom right corner with coordinate (9,19).
   *
   * @param x - x coordinate
   * @param y - y coordinate
   */
  constructor(private x: number, private y: number) {
  }

  /**
   * getter for shape color
   */
  getColor(): string {
    return this.color;
  }

  /**
   * setter for shape color
   * @color - HTML5 HEX or color literal
   */
  setColor(color: string): void {
    this.color = color;
  }

  /**
   * move left
   */
  moveLeft() : void {
    this.x--;
  }

  /**
   * move right
   */
  moveRight() : void {
    this.x++;
  }

  /**
   * move down
   */
  moveDown() : void {
    this.y++; // y-coordinates increases as it falls
  }

  /**
   * get x-coordinate of this cell
   */
  getX() : number {
    return this.x;
  }

  /**
   * get y-coordinate of this cell
   */
  getY() : number {
    return this.y;
  }
}

/** abstract class representation of Shape  */
export abstract class Shape {
  protected size: number;
  protected canMoveDown: boolean;

  /**
   * create a shape
   * @param board - game board
   * @param color - shape color
   * @param location - default starting location of this shape's pivot
   * @param rotation - default stance of this shape
   */
  constructor(protected board: Board,
              protected color: string,
              protected location: Location = new Location(4,0), 
              protected rotation: Rotation = Rotation.NORTH ) { 
    this.size = board.cellSize;
    this.canMoveDown = true;
  }

  /**
   * rotate shape clock-wise
   */
  rotateClockWise() {
    let targetRotation: Rotation = this.rotation + 1;
    if (targetRotation === 5) { 
      targetRotation = Rotation.NORTH;
    } 

    this.move(this.location, targetRotation);
  }

  /**
   * rotate shape counter clock-wise
   */
  rotateCounterClockWise() {
    let targetRotation: Rotation = this.rotation - 1;
    if (targetRotation === 0) { 
      targetRotation = Rotation.WEST;
    } 

    this.move(this.location, targetRotation);
  }

  /**
   * draw this shape
   * @param ctx - canvas 2D context to draw shape
   */
  draw(ctx: CanvasRenderingContext2D) : void {
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = this.color;

    switch (this.rotation) {
      case Rotation.NORTH:
        this.drawNorth(ctx);
        break;
      case Rotation.EAST:
        this.drawEast(ctx);
        break;
      case Rotation.SOUTH:
        this.drawSouth(ctx);
        break;
      case Rotation.WEST:
        this.drawWest(ctx);
        break;

      default:
        console.log('ERROR: unexpected rotation[%s] value!', this.rotation);
        break;
    }
  }

  /**
   * move shape left
   */
  moveLeft(): void {
    let targetLocation = new Location(this.location.getX() - 1, this.location.getY());
    this.move(targetLocation, this.rotation);
  }

  /**
   * move shape right
   */
  moveRight(): void {
    let targetLocation = new Location(this.location.getX() + 1, this.location.getY());
    this.move(targetLocation, this.rotation);
  }

  /**
   * drop shape
   */
  drop(): void {
    let targetLocation = new Location(this.location.getX(), this.location.getY() + 1);
    // validate if it can drop 
    let cells: Location[] = this.createCellsBasedOnLocation(targetLocation);
    for (var i = cells.length - 1; i >= 0; i--) {
      if(!this.canMoveDown) {
        break;
      } else if (cells[i].getY() > 19) {
        this.canMoveDown = false;
        break;
      } else {
        for (var j = this.board.filledCells.length - 1; j >= 0; j--) {
          if (this.board.filledCells[j].getX() === cells[i].getX() && 
              this.board.filledCells[j].getY() === cells[i].getY()) {
            this.canMoveDown = false;
            break;
          }          
        }
      }
    }

    if (this.canMoveDown) {
      this.location = targetLocation;
    }
  }

  /**
   * shape is done when it cannot move further
   */
  isDone(): boolean {
    return !this.canMoveDown;
  }

  /**
   * get the cell locations for this shape
   */
  getCells(): Location[] {
    return this.createCellsBasedOnLocation(this.location);
  }

  /**
   * get type - to be implemented by subclass
   */
  abstract getType(): Type;

  /**
   * helper method to determin if move is valid within board's fill space
   */
  protected isValidMove(targetLoc: Location, targetRotation: Rotation) : Observable<boolean> {
    let cells: Location[] = this.createCellsBasedOnLocation(targetLoc);
    let board: Location[] = this.board.filledCells;

    const obs = new Observable<boolean>((observer) => {
      let isValid: boolean = true;
      // validate no collision with filled area
      if (this.isValidBoardAction(targetLoc, targetRotation)) {
        for (var i = 0; i < cells.length; i++) {          
          for (var j = 0; j < board.length; j++) {
            if (cells[i].getX() === board[j].getX() && cells[i].getY() === board[j].getY()) {
              isValid = false;
              break;
            }
          }

          if (!isValid) {
            break;
          }
        }
        
        observer.next(isValid);
      } else {
        observer.next(false);
      }

      observer.complete();
    });

    return obs;
  }

  /**
   * retrieve cells for this shape - to be implemented by subclass
   * @param targetLoc - shape's pivot 
   */
  protected abstract createCellsBasedOnLocation(targetLoc: Location): Location[];

  /**
   * draw shape facing north - to be implemented by subclass
   * @param ctx - canvas 2D context to draw shape onto
   */
  protected abstract drawNorth(ctx: CanvasRenderingContext2D): void;
  
  /**
   * draw shape facing east - to be implemented by subclass
   * @param ctx - canvas 2D context to draw shape onto
   */
  protected abstract drawEast(ctx: CanvasRenderingContext2D): void;
  
  /**
   * draw shape facing south - to be implemented by subclass
   * @param ctx - canvas 2D context to draw shape onto
   */
  protected abstract drawSouth(ctx: CanvasRenderingContext2D): void;

  /**
   * draw shape facing west - to be implemented by subclass
   * @param ctx - canvas 2D context to draw shape onto
   */
  protected abstract drawWest(ctx: CanvasRenderingContext2D): void;

  /**
   * determine if move is valid for shape - to be implemented by subclass
   * @param targetLoc - target location of shape's pivot
   * @param targetRotation - shape target rotation
   */
  protected abstract isValidBoardAction(targetLoc: Location, targetRotation: Rotation): boolean;

  /**
   * helper method to move shape's pivot after confirming it can move
   * @param targetLoc - target location of shape's pivot
   * @param targetRotation - shape target rotation 
   */
  private move(targetLocation: Location, targetRotation: Rotation): void {
    this.isValidMove(targetLocation, targetRotation).subscribe((valid: boolean) => {
      if (valid) {
        this.location = targetLocation;
        this.rotation = targetRotation;
      }
    });
  }
}

/** class representing L-Shape  */
export class ShapeL extends Shape {

  /**
   * Create new L-Shape
   *
   *   (N)        (E)         (S)         (W)
   *
   * [ ]                    [ ][ ]           [ ]
   * [L]    -> [ ][L][ ] ->    [L]  -> [ ][L][ ]
   * [ ][ ]    [ ]             [ ]
   * 
   * L -> Location represents pivot cell used to rotate
   *
   * @param _board - game board 
   */
  constructor(private _board:Board) {
    super(_board, 'green');
  }

  /**
   * get type
   */
  getType(): Type {
    return Type.L;
  }

  /**
   * determine if move is valid for this shape 
   * @param targetLoc - target location of shape's pivot
   * @param targetRotation - shape target rotation
   */
  protected isValidBoardAction(targetLoc: Location, targetRotation: Rotation): boolean {
    let isValid: boolean = false;
    // validate bounds of board
    if (targetRotation === Rotation.NORTH && targetLoc.getX() >= 0 && targetLoc.getX() < 9 && targetLoc.getY() < 19) {
      isValid = true;
    } else if (targetRotation === Rotation.EAST && targetLoc.getX() > 0 && targetLoc.getX() < 9 && targetLoc.getY() < 19) {
      isValid = true;
    } else if (targetRotation === Rotation.SOUTH && targetLoc.getX() > 0 && targetLoc.getX() < 10 && targetLoc.getY() < 19) {
      isValid = true;
    } else if (targetRotation === Rotation.WEST && targetLoc.getX() > 0 && targetLoc.getX() < 9 && targetLoc.getY() < 20) {
      isValid = true;
    } 

    return isValid;
  }

  /**
   * retrieve cells for this shape
   * @param targetLoc - shape's pivot 
   */
  protected createCellsBasedOnLocation(location: Location): Location[] {
    let cells: Location[] = [];
    // add the pivot
    cells.push(location);

    switch (this.rotation) {
      case Rotation.NORTH:
        cells.push(new Location(location.getX(), location.getY() - 1));
        cells.push(new Location(location.getX(), location.getY() + 1));
        cells.push(new Location(location.getX() + 1, location.getY() + 1));
        break;
      
      case Rotation.EAST:
        cells.push(new Location(location.getX() + 1, location.getY()));
        cells.push(new Location(location.getX() - 1, location.getY()));
        cells.push(new Location(location.getX() - 1, location.getY() + 1));
        break;

      case Rotation.SOUTH:
        cells.push(new Location(location.getX(), location.getY() + 1));
        cells.push(new Location(location.getX(), location.getY() - 1));
        cells.push(new Location(location.getX() - 1, location.getY() - 1));
        break;

      case Rotation.WEST:
        cells.push(new Location(location.getX() - 1, location.getY()));
        cells.push(new Location(location.getX() + 1, location.getY()));
        cells.push(new Location(location.getX() + 1, location.getY() - 1));
        break;

      default:
        console.log('ERROR: unexpected error');
        break;
    }

    cells.forEach((location: Location) => {
      location.setColor(this.color);
    });

    return cells;
  }

  /**
   * draw shape facing north 
   *
   *   [1]    
   *   [2]    
   *   [3][4] 
   *
   * @param ctx - canvas 2D context to draw shape onto
   */
  protected drawNorth(ctx: CanvasRenderingContext2D) : void {
    // 1
    ctx.fillRect(this.location.getX() * this.size, (this.location.getY() - 1) * this.size, this.size, this.size);
    // 2 -- Pivot
    ctx.fillRect(this.location.getX() * this.size, this.location.getY() * this.size, this.size, this.size);
    // 3
    ctx.fillRect(this.location.getX() * this.size, (this.location.getY() + 1) * this.size, this.size, this.size);
    // 4
    ctx.fillRect((this.location.getX() + 1) * this.size, (this.location.getY() + 1) * this.size, this.size, this.size);

    // draw borders
    ctx.globalAlpha = 0.3;
    ctx.strokeRect(this.location.getX() * this.size, (this.location.getY() - 1) * this.size, this.size, this.size);
    ctx.strokeRect(this.location.getX() * this.size, this.location.getY() * this.size, this.size, this.size);
    ctx.strokeRect(this.location.getX() * this.size, (this.location.getY() + 1) * this.size, this.size, this.size);
    ctx.strokeRect((this.location.getX() + 1) * this.size, (this.location.getY() + 1) * this.size, this.size, this.size);
  }

  /**
   * draw shape facing east 
   *
   *   [3][2][1]
   *   [4]
   * 
   * @param ctx - canvas 2D context to draw shape onto      
   */
  protected drawEast(ctx: CanvasRenderingContext2D) : void {
    // 1
    ctx.fillRect((this.location.getX() + 1) * this.size, this.location.getY() * this.size, this.size, this.size);
    // 2 -- Pivot
    ctx.fillRect(this.location.getX() * this.size, this.location.getY() * this.size, this.size, this.size);
    // 3
    ctx.fillRect((this.location.getX() - 1) * this.size, this.location.getY() * this.size, this.size, this.size);
    // 4
    ctx.fillRect((this.location.getX() - 1) * this.size, (this.location.getY() + 1) * this.size, this.size, this.size);

    // draw borders
    ctx.globalAlpha = 0.3;
    ctx.strokeRect((this.location.getX() + 1) * this.size, this.location.getY() * this.size, this.size, this.size);
    ctx.strokeRect(this.location.getX() * this.size, this.location.getY() * this.size, this.size, this.size);
    ctx.strokeRect((this.location.getX() - 1) * this.size, this.location.getY() * this.size, this.size, this.size);
    ctx.strokeRect((this.location.getX() - 1) * this.size, (this.location.getY() + 1) * this.size, this.size, this.size);

  }

  /**
   * draw shape facing south 
   *
   *    [4][3]    
   *       [2]    
   *       [1] 
   * 
   * @param ctx - canvas 2D context to draw shape onto
   */
  protected drawSouth(ctx: CanvasRenderingContext2D) : void {
    // 1
    ctx.fillRect(this.location.getX() * this.size, (this.location.getY() + 1) * this.size, this.size, this.size);
    // 2 -- Pivot
    ctx.fillRect(this.location.getX() * this.size, this.location.getY() * this.size, this.size, this.size);
    // 3
    ctx.fillRect(this.location.getX() * this.size, (this.location.getY() - 1) * this.size, this.size, this.size);
    // 4
    ctx.fillRect((this.location.getX() - 1) * this.size, (this.location.getY() - 1) * this.size, this.size, this.size);

    // draw borders
    ctx.globalAlpha = 0.3
    ctx.strokeRect(this.location.getX() * this.size, (this.location.getY() + 1) * this.size, this.size, this.size);
    ctx.strokeRect(this.location.getX() * this.size, this.location.getY() * this.size, this.size, this.size);
    ctx.strokeRect(this.location.getX() * this.size, (this.location.getY() - 1) * this.size, this.size, this.size);
    ctx.strokeRect((this.location.getX() - 1) * this.size, (this.location.getY() - 1) * this.size, this.size, this.size);
  }

  /**
   * draw shape facing west 
   *
   *          [4]
   *    [1][2][3]      
   *
   * @param ctx - canvas 2D context to draw shape onto
   */
  protected drawWest(ctx: CanvasRenderingContext2D) : void {
    // 1
    ctx.fillRect((this.location.getX() - 1) * this.size, this.location.getY() * this.size, this.size, this.size);
    // 2 -- Pivot
    ctx.fillRect(this.location.getX() * this.size, this.location.getY() * this.size, this.size, this.size);
    // 3
    ctx.fillRect((this.location.getX() + 1)  * this.size, this.location.getY() * this.size, this.size, this.size);
    // 4
    ctx.fillRect((this.location.getX() + 1) * this.size, (this.location.getY() - 1) * this.size, this.size, this.size);
  
    // draw borders
    ctx.globalAlpha = 0.3
    ctx.strokeRect((this.location.getX() - 1) * this.size, this.location.getY() * this.size, this.size, this.size);
    ctx.strokeRect(this.location.getX() * this.size, this.location.getY() * this.size, this.size, this.size);
    ctx.strokeRect((this.location.getX() + 1)  * this.size, this.location.getY() * this.size, this.size, this.size);
    ctx.strokeRect((this.location.getX() + 1) * this.size, (this.location.getY() - 1) * this.size, this.size, this.size);
  }
}

/** class representing J-Shape */
export class ShapeJ extends Shape {

  /**
   * Create new J-Shape
   *
   *    (N)          (E)           (S)         (W)
   *
   *    [ ]       [ ]            [ ][ ]           
   *    [L]    -> [ ][L][ ] ->   [L]     -> [ ][L][ ]
   * [ ][ ]                      [ ]              [ ]
   * 
   * L -> Location represents pivot cell used to rotate
   *
   * @param _board - game board 
   */
  constructor(private _board:Board) {
    super(_board, 'orange');
  }

  /**
   * get type
   */
  getType(): Type {
    return Type.J;
  }

  /**
   * determine if move is valid for this shape 
   * @param targetLoc - target location of shape's pivot
   * @param targetRotation - shape target rotation
   */
  protected isValidBoardAction(targetLoc: Location, targetRotation: Rotation): boolean {
    let isValid: boolean = false;
    // validate bounds of board
    if (targetRotation === Rotation.NORTH && targetLoc.getX() > 0 && targetLoc.getX() < 10 && targetLoc.getY() < 19) {
      isValid = true;
    } else if (targetRotation === Rotation.EAST && targetLoc.getX() > 0 && targetLoc.getX() < 9 && targetLoc.getY() < 20) {
      isValid = true;
    } else if (targetRotation === Rotation.SOUTH && targetLoc.getX() >= 0 && targetLoc.getX() < 9 && targetLoc.getY() < 19) {
      isValid = true;
    } else if (targetRotation === Rotation.WEST && targetLoc.getX() > 0 && targetLoc.getX() < 9 && targetLoc.getY() < 19) {
      isValid = true;
    } 

    return isValid;
  }

  /**
   * retrieve cells for this shape
   * @param targetLoc - shape's pivot 
   */
  protected createCellsBasedOnLocation(location: Location): Location[] {
    let cells: Location[] = [];
    // add the pivot
    cells.push(location);

    switch (this.rotation) {
      case Rotation.NORTH:
        cells.push(new Location(location.getX(), location.getY() - 1));
        cells.push(new Location(location.getX(), location.getY() + 1));
        cells.push(new Location(location.getX() - 1, location.getY() + 1));
        break;
      
      case Rotation.EAST:
        cells.push(new Location(location.getX() + 1, location.getY()));
        cells.push(new Location(location.getX() - 1, location.getY()));
        cells.push(new Location(location.getX() - 1, location.getY() - 1));
        break;

      case Rotation.SOUTH:
        cells.push(new Location(location.getX(), location.getY() + 1));
        cells.push(new Location(location.getX(), location.getY() - 1));
        cells.push(new Location(location.getX() + 1, location.getY() - 1));
        break;

      case Rotation.WEST:
        cells.push(new Location(location.getX() - 1, location.getY()));
        cells.push(new Location(location.getX() + 1, location.getY()));
        cells.push(new Location(location.getX() + 1, location.getY() + 1));
        break;

      default:
        console.log('ERROR: unexpected error');
        break;
    }

    cells.forEach((location: Location) => {
      location.setColor(this.color);
    });

    return cells;
  }

  /**
   * draw shape facing north 
   *
   *       [1]    
   *       [2]    
   *    [4][3] 
   *
   * @param ctx - canvas 2D context to draw shape onto
   */
  protected drawNorth(ctx: CanvasRenderingContext2D) : void {
    // 1
    ctx.fillRect(this.location.getX() * this.size, (this.location.getY() - 1) * this.size, this.size, this.size);
    // 2 -- Pivot
    ctx.fillRect(this.location.getX() * this.size, this.location.getY() * this.size, this.size, this.size);
    // 3
    ctx.fillRect(this.location.getX() * this.size, (this.location.getY() + 1) * this.size, this.size, this.size);
    // 4
    ctx.fillRect((this.location.getX() - 1) * this.size, (this.location.getY() + 1) * this.size, this.size, this.size);

    // draw borders
    ctx.globalAlpha = 0.3;
    ctx.strokeRect(this.location.getX() * this.size, (this.location.getY() - 1) * this.size, this.size, this.size);
    ctx.strokeRect(this.location.getX() * this.size, this.location.getY() * this.size, this.size, this.size);
    ctx.strokeRect(this.location.getX() * this.size, (this.location.getY() + 1) * this.size, this.size, this.size);
    ctx.strokeRect((this.location.getX() - 1) * this.size, (this.location.getY() + 1) * this.size, this.size, this.size);
  }

  /**
   * draw shape facing east 
   *
   *    [4]
   *    [3][2][1]   
   *
   * @param ctx - canvas 2D context to draw shape onto
   */
  protected drawEast(ctx: CanvasRenderingContext2D) : void {
    // 1
    ctx.fillRect((this.location.getX() + 1) * this.size, this.location.getY() * this.size, this.size, this.size);
    // 2 -- Pivot
    ctx.fillRect(this.location.getX() * this.size, this.location.getY() * this.size, this.size, this.size);
    // 3
    ctx.fillRect((this.location.getX() - 1) * this.size, this.location.getY() * this.size, this.size, this.size);
    // 4
    ctx.fillRect((this.location.getX() - 1) * this.size, (this.location.getY() - 1) * this.size, this.size, this.size);

    // draw borders
    ctx.globalAlpha = 0.3;
    ctx.strokeRect((this.location.getX() + 1) * this.size, this.location.getY() * this.size, this.size, this.size);
    ctx.strokeRect(this.location.getX() * this.size, this.location.getY() * this.size, this.size, this.size);
    ctx.strokeRect((this.location.getX() - 1) * this.size, this.location.getY() * this.size, this.size, this.size);
    ctx.strokeRect((this.location.getX() - 1) * this.size, (this.location.getY() - 1) * this.size, this.size, this.size);

  }

  /**
   * draw shape facing south 
   *
   *    [3][4] 
   *    [2]    
   *    [1] 
   *
   * @param ctx - canvas 2D context to draw shape onto
   */
  protected drawSouth(ctx: CanvasRenderingContext2D) : void {
    // 1
    ctx.fillRect(this.location.getX() * this.size, (this.location.getY() + 1) * this.size, this.size, this.size);
    // 2 -- Pivot
    ctx.fillRect(this.location.getX() * this.size, this.location.getY() * this.size, this.size, this.size);
    // 3
    ctx.fillRect(this.location.getX() * this.size, (this.location.getY() - 1) * this.size, this.size, this.size);
    // 4
    ctx.fillRect((this.location.getX() + 1) * this.size, (this.location.getY() - 1) * this.size, this.size, this.size);

    // draw borders
    ctx.globalAlpha = 0.3
    ctx.strokeRect(this.location.getX() * this.size, (this.location.getY() + 1) * this.size, this.size, this.size);
    ctx.strokeRect(this.location.getX() * this.size, this.location.getY() * this.size, this.size, this.size);
    ctx.strokeRect(this.location.getX() * this.size, (this.location.getY() - 1) * this.size, this.size, this.size);
    ctx.strokeRect((this.location.getX() + 1) * this.size, (this.location.getY() - 1) * this.size, this.size, this.size);

  }

  /**
   * draw shape facing west 
   *
   *    [1][2][3] 
   *          [4]
   *
   * @param ctx - canvas 2D context to draw shape onto     
   */
  protected drawWest(ctx: CanvasRenderingContext2D) : void {
    // 1
    ctx.fillRect((this.location.getX() - 1) * this.size, this.location.getY() * this.size, this.size, this.size);
    // 2 -- Pivot
    ctx.fillRect(this.location.getX() * this.size, this.location.getY() * this.size, this.size, this.size);
    // 3
    ctx.fillRect((this.location.getX() + 1)  * this.size, this.location.getY() * this.size, this.size, this.size);
    // 4
    ctx.fillRect((this.location.getX() + 1) * this.size, (this.location.getY() + 1) * this.size, this.size, this.size);
  
    // draw borders
    ctx.globalAlpha = 0.3
    ctx.strokeRect((this.location.getX() - 1) * this.size, this.location.getY() * this.size, this.size, this.size);
    ctx.strokeRect(this.location.getX() * this.size, this.location.getY() * this.size, this.size, this.size);
    ctx.strokeRect((this.location.getX() + 1)  * this.size, this.location.getY() * this.size, this.size, this.size);
    ctx.strokeRect((this.location.getX() + 1) * this.size, (this.location.getY() + 1) * this.size, this.size, this.size);
  }
}

/** class representing O-Shape*/
export class ShapeO extends Shape {

  /**
   * Create new O-Shape
   *
   * ( N | E | S | W ) 
   *
   *      [ ][ ] 
   *      [L][ ]
   * 
   * L -> Location represents pivot cell used to rotate
   *
   * @param _board - game board 
   */
  constructor(private _board:Board) {
    super(_board, '#FF00FF'); // magenta
  }

  /**
   * get type
   */
  getType(): Type {
    return Type.O;
  }

  /**
   * determine if move is valid for this shape 
   * @param targetLoc - target location of shape's pivot
   * @param targetRotation - shape target rotation
   */
  protected isValidBoardAction(targetLoc: Location, targetRotation: Rotation): boolean {
    let isValid: boolean = false;
    // validate bounds of board
    if (targetLoc.getX() >= 0 && targetLoc.getX() < 9 && targetLoc.getY() < 20) {
      isValid = true;
    } 

    return isValid;
  }

  /**
   * retrieve cells for this shape
   * @param targetLoc - shape's pivot 
   */
  protected createCellsBasedOnLocation(location: Location): Location[] {
    let cells: Location[] = [];
    // add the pivot
    cells.push(location);
    cells.push(new Location(location.getX(), location.getY() - 1));
    cells.push(new Location(location.getX() + 1, location.getY() - 1));
    cells.push(new Location(location.getX() + 1, location.getY()));
   
    cells.forEach((location: Location) => {
      location.setColor(this.color);
    });

    return cells;
  }

  /**
   * draw shape facing north 
   *
   *    [1][3]    
   *    [2][4] 
   *
   * @param ctx - canvas 2D context to draw shape onto     
   */
  protected drawNorth(ctx: CanvasRenderingContext2D) : void {
    this.drawSquare(ctx);
  }

  /**    
   * draw shape facing east - to be implemented by subclass
   *
   *    [1][3]    
   *    [2][4] 
   *
   * @param ctx - canvas 2D context to draw shape onto   
   */
  protected drawEast(ctx: CanvasRenderingContext2D) : void {
    this.drawSquare(ctx);
  }

  /**    
   * draw shape facing south - to be implemented by subclass
   *
   *    [1][3]    
   *    [2][4] 
   *
   * @param ctx - canvas 2D context to draw shape onto   
   */
  protected drawSouth(ctx: CanvasRenderingContext2D) : void {
    this.drawSquare(ctx);
  }

  /**    
   * draw shape facing west 
   *
   *    [1][3]    
   *    [2][4] 
   *
   * @param ctx - canvas 2D context to draw shape onto  
   */
  protected drawWest(ctx: CanvasRenderingContext2D) : void {
    this.drawSquare(ctx);
  }

  /**
   * helper method to draw square tetris.
   * @param ctx - canvas 2D context to draw shape onto  
   */
  private drawSquare(ctx: CanvasRenderingContext2D) : void {
    // 1
    ctx.fillRect(this.location.getX() * this.size, (this.location.getY() - 1) * this.size, this.size, this.size);
    // 2 -- Pivot
    ctx.fillRect(this.location.getX() * this.size, this.location.getY() * this.size, this.size, this.size);
    // 3
    ctx.fillRect((this.location.getX() + 1) * this.size, (this.location.getY() - 1) * this.size, this.size, this.size);
    // 4
    ctx.fillRect((this.location.getX() + 1) * this.size, this.location.getY() * this.size, this.size, this.size);

    // draw borders
    ctx.globalAlpha = 0.3;
    ctx.strokeRect(this.location.getX() * this.size, (this.location.getY() - 1) * this.size, this.size, this.size);
    ctx.strokeRect(this.location.getX() * this.size, this.location.getY() * this.size, this.size, this.size);
    ctx.strokeRect((this.location.getX() + 1) * this.size, (this.location.getY() - 1) * this.size, this.size, this.size);
    ctx.strokeRect((this.location.getX() + 1) * this.size, this.location.getY() * this.size, this.size, this.size);
  }
}

/** class representing I-shape */
export class ShapeI extends Shape {

  /**
   * Create new I-Shape
   *
   * ( N | S )     ( E | W ) 
   *
   *    [ ] 
   *    [L]  ->  [ ][L][ ][ ] 
   *    [ ]
   *    [ ]
   * 
   * L -> Location represents pivot cell used to rotate
   *
   * @param _board - game board 
   */
  constructor(private _board:Board) {
    super(_board, 'blue');
  }

  /**
   * get type
   */
  getType(): Type {
    return Type.I;
  }

  /**
   * determine if move is valid for this shape 
   * @param targetLoc - target location of shape's pivot
   * @param targetRotation - shape target rotation
   */
  protected isValidBoardAction(targetLoc: Location, targetRotation: Rotation): boolean {
    let isValid: boolean = false;
    // validate bounds of board
    if ((targetRotation === Rotation.NORTH || targetRotation === Rotation.SOUTH) && targetLoc.getX() >= 0 && targetLoc.getX() < 10 && targetLoc.getY() < 18) {
      isValid = true;
    } else if ((targetRotation === Rotation.EAST || targetRotation === Rotation.WEST) && targetLoc.getX() > 0 && targetLoc.getX() < 8 && targetLoc.getY() < 20 ) {
      isValid = true;
    }
  
    return isValid;
  }

  /**
   * retrieve cells for this shape
   * @param targetLoc - shape's pivot 
   */
  protected createCellsBasedOnLocation(location: Location): Location[] {
    let cells: Location[] = [];
    // add the pivot
    cells.push(location);

    switch(this.rotation) {
      case Rotation.NORTH:
      case Rotation.SOUTH:
        cells.push(new Location(location.getX(), location.getY() - 1));
        cells.push(new Location(location.getX(), location.getY() + 1));
        cells.push(new Location(location.getX(), location.getY() + 2));
        break;

      case Rotation.EAST:
      case Rotation.WEST:
        cells.push(new Location(location.getX() - 1, location.getY()));
        cells.push(new Location(location.getX() + 1, location.getY()));
        cells.push(new Location(location.getX() + 2, location.getY()));
        break;

      default:
        console.log('ERROR: unexpected error');
        break;
    }
    
   
    cells.forEach((location: Location) => {
      location.setColor(this.color);
    });

    return cells;
  }

  /** 
   * draw shape facing north  
   *
   *    [1]    
   *    [2]
   *    [3]
   *    [4]
   *
   * @param ctx - canvas 2D context to draw shape onto   
   */
  protected drawNorth(ctx: CanvasRenderingContext2D) : void {
    this.drawVertical(ctx);
  }

  /**    
   * draw shape facing east 
   *
   * [1][2][3][4]   
   *
   * @param ctx - canvas 2D context to draw shape onto 
   */
  protected drawEast(ctx: CanvasRenderingContext2D) : void {
    this.drawHorizontal(ctx);
  }

  /** 
   * draw shape facing sout 
   *
   *    [1]    
   *    [2]
   *    [3]
   *    [4]
   *
   * @param ctx - canvas 2D context to draw shape onto   
   */
  protected drawSouth(ctx: CanvasRenderingContext2D) : void {
    this.drawVertical(ctx);
  }

  /**    
   * draw shape facing west 
   *
   * [1][2][3][4]   
   *
   * @param ctx - canvas 2D context to draw shape onto 
   */
  protected drawWest(ctx: CanvasRenderingContext2D) : void {
    this.drawHorizontal(ctx);
  }

  /**
   * helper method to draw vertical tetris.
   * @param ctx - canvas 2D context to draw shape onto 
   */
  private drawVertical(ctx: CanvasRenderingContext2D) : void {
    // 1
    ctx.fillRect(this.location.getX() * this.size, (this.location.getY() - 1) * this.size, this.size, this.size);
    // 2 -- Pivot
    ctx.fillRect(this.location.getX() * this.size, this.location.getY() * this.size, this.size, this.size);
    // 3
    ctx.fillRect(this.location.getX() * this.size, (this.location.getY() + 1) * this.size, this.size, this.size);
    // 4
    ctx.fillRect(this.location.getX() * this.size, (this.location.getY() + 2) * this.size, this.size, this.size);

    // draw borders
    ctx.globalAlpha = 0.3;
    ctx.strokeRect(this.location.getX() * this.size, (this.location.getY() - 1) * this.size, this.size, this.size);
    ctx.strokeRect(this.location.getX() * this.size, this.location.getY() * this.size, this.size, this.size);
    ctx.strokeRect(this.location.getX() * this.size, (this.location.getY() + 1) * this.size, this.size, this.size);
    ctx.strokeRect(this.location.getX() * this.size, (this.location.getY() + 2) * this.size, this.size, this.size);
  }

  /**
   * helper method to draw horizontal tetris.
   * @param ctx - canvas 2D context to draw shape onto 
   */
  private drawHorizontal(ctx: CanvasRenderingContext2D) : void {
    // 1
    ctx.fillRect((this.location.getX() - 1) * this.size, this.location.getY() * this.size, this.size, this.size);
    // 2 -- Pivot
    ctx.fillRect(this.location.getX() * this.size, this.location.getY() * this.size, this.size, this.size);
    // 3
    ctx.fillRect((this.location.getX() + 1) * this.size, this.location.getY() * this.size, this.size, this.size);
    // 4
    ctx.fillRect((this.location.getX() + 2) * this.size, this.location.getY() * this.size, this.size, this.size);

    // draw borders
    ctx.globalAlpha = 0.3;
    ctx.strokeRect((this.location.getX() - 1) * this.size, this.location.getY() * this.size, this.size, this.size);
    ctx.strokeRect(this.location.getX() * this.size, this.location.getY() * this.size, this.size, this.size);
    ctx.strokeRect((this.location.getX() + 1) * this.size, this.location.getY() * this.size, this.size, this.size);
    ctx.strokeRect((this.location.getX() + 2) * this.size, this.location.getY() * this.size, this.size, this.size);
  }
}

/** class representing T-Shape */
export class ShapeT extends Shape {

  /**
   * Create new T-Shape
   *
   *   ( N )        ( E )         ( S )        ( W ) 
   *
   *    [ ]         [ ]                          [ ]
   * [ ][L][ ]  ->  [L][ ]  ->  [ ][L][ ]  -> [ ][L] 
   *                [ ]            [ ]           [ ]
   * 
   * L -> Location represents pivot cell used to rotate
   *
   * @param _board - game board 
   */
  constructor(private _board:Board) {
    super(_board, 'yellow');
  }

  /**
   * get type
   */
  getType(): Type {
    return Type.T;
  }

  /**
   * determine if move is valid for this shape 
   * @param targetLoc - target location of shape's pivot
   * @param targetRotation - shape target rotation
   */
  protected isValidBoardAction(targetLoc: Location, targetRotation: Rotation): boolean {
    let isValid: boolean = false;
    // validate bounds of board
    if (targetRotation === Rotation.NORTH && targetLoc.getX() > 0 && targetLoc.getX() < 9 && targetLoc.getY() < 20) {
      isValid = true;
    } else if (targetRotation === Rotation.EAST && targetLoc.getX() >= 0 && targetLoc.getX() < 9 && targetLoc.getY() < 19 ) {
      isValid = true;
    } else if (targetRotation === Rotation.SOUTH && targetLoc.getX() > 0 && targetLoc.getX() < 9 && targetLoc.getY() < 19) {
      isValid = true;
    } else if (targetRotation === Rotation.WEST && targetLoc.getX() > 0 && targetLoc.getX() < 10 && targetLoc.getY() < 19) {
      isValid = true;
    } 
  
    return isValid;
  }

  /**
   * retrieve cells for this shape
   * @param targetLoc - shape's pivot 
   */
  protected createCellsBasedOnLocation(location: Location): Location[] {
    let cells: Location[] = [];
    // add the pivot
    cells.push(location);

    switch(this.rotation) {
      case Rotation.NORTH:
        cells.push(new Location(location.getX() - 1, location.getY()));
        cells.push(new Location(location.getX() + 1, location.getY()));
        cells.push(new Location(location.getX(), location.getY() - 1));
        break;

      case Rotation.EAST:
        cells.push(new Location(location.getX(), location.getY() - 1));
        cells.push(new Location(location.getX(), location.getY() + 1));
        cells.push(new Location(location.getX() + 1, location.getY()));
        break;

      case Rotation.SOUTH:
        cells.push(new Location(location.getX() + 1, location.getY()));
        cells.push(new Location(location.getX() - 1, location.getY()));
        cells.push(new Location(location.getX(), location.getY() + 1));
        break;

      case Rotation.WEST:
        cells.push(new Location(location.getX(), location.getY() + 1));
        cells.push(new Location(location.getX(), location.getY() - 1));
        cells.push(new Location(location.getX() - 1, location.getY()));
        break;

      default:
        console.log('ERROR: unexpected error');
        break;
    }
    
   
    cells.forEach((location: Location) => {
      location.setColor(this.color);
    });

    return cells;
  }

  /** 
   * draw shape facing north    
   *
   *       [4]    
   *    [1][2][3]
   *
   * @param ctx - canvas 2D context to draw shape onto   
   */
  protected drawNorth(ctx: CanvasRenderingContext2D) : void {
    // 1
    ctx.fillRect((this.location.getX() - 1) * this.size, this.location.getY() * this.size, this.size, this.size);
    // 2 -- Pivot
    ctx.fillRect(this.location.getX() * this.size, this.location.getY() * this.size, this.size, this.size);
    // 3
    ctx.fillRect((this.location.getX() + 1) * this.size, this.location.getY() * this.size, this.size, this.size);
    // 4
    ctx.fillRect(this.location.getX() * this.size, (this.location.getY() - 1) * this.size, this.size, this.size);

    // draw borders
    ctx.globalAlpha = 0.3;
    ctx.strokeRect((this.location.getX() - 1) * this.size, this.location.getY() * this.size, this.size, this.size);
    ctx.strokeRect(this.location.getX() * this.size, this.location.getY() * this.size, this.size, this.size);
    ctx.strokeRect((this.location.getX() + 1) * this.size, this.location.getY() * this.size, this.size, this.size);
    ctx.strokeRect(this.location.getX() * this.size, (this.location.getY() - 1) * this.size, this.size, this.size);
  }

  /**    
   * draw shape facing east   
   *
   *    [1]
   *    [2][4]
   *    [3]   
   *
   * @param ctx - canvas 2D context to draw shape onto   
   */
  protected drawEast(ctx: CanvasRenderingContext2D) : void {
    // 1
    ctx.fillRect(this.location.getX() * this.size, (this.location.getY() - 1) * this.size, this.size, this.size);
    // 2 -- Pivot
    ctx.fillRect(this.location.getX() * this.size, this.location.getY() * this.size, this.size, this.size);
    // 3 
    ctx.fillRect(this.location.getX() * this.size, (this.location.getY() + 1) * this.size, this.size, this.size);
    // 4
    ctx.fillRect((this.location.getX() + 1) * this.size, this.location.getY() * this.size, this.size, this.size);

    // draw borders
    ctx.globalAlpha = 0.3;
    ctx.strokeRect(this.location.getX() * this.size, (this.location.getY() - 1) * this.size, this.size, this.size);
    ctx.strokeRect(this.location.getX() * this.size, this.location.getY() * this.size, this.size, this.size);
    ctx.strokeRect(this.location.getX() * this.size, (this.location.getY() + 1) * this.size, this.size, this.size);
    ctx.strokeRect((this.location.getX() + 1) * this.size, this.location.getY() * this.size, this.size, this.size);
  }

  /**    
   * draw shape facing south 
   *
   *    [3][2][1]
   *       [4] 
   *
   * @param ctx - canvas 2D context to draw shape onto  
   */
  protected drawSouth(ctx: CanvasRenderingContext2D) : void {
    // 1
    ctx.fillRect((this.location.getX() + 1) * this.size, this.location.getY() * this.size, this.size, this.size);
    // 2 -- Pivot
    ctx.fillRect(this.location.getX() * this.size, this.location.getY() * this.size, this.size, this.size);
    // 3
    ctx.fillRect((this.location.getX() - 1) * this.size, this.location.getY() * this.size, this.size, this.size);
    // 4
    ctx.fillRect(this.location.getX() * this.size, (this.location.getY() + 1) * this.size, this.size, this.size);

    // draw borders
    ctx.globalAlpha = 0.3;    
    ctx.strokeRect((this.location.getX() + 1) * this.size, this.location.getY() * this.size, this.size, this.size);
    ctx.strokeRect(this.location.getX() * this.size, this.location.getY() * this.size, this.size, this.size);
    ctx.strokeRect((this.location.getX() - 1) * this.size, this.location.getY() * this.size, this.size, this.size);
    ctx.strokeRect(this.location.getX() * this.size, (this.location.getY() + 1) * this.size, this.size, this.size);
  }

  /**   
   * draw shape facing west   
   *
   *       [3]
   *    [4][2]
   *       [1]   
   *
   * @param ctx - canvas 2D context to draw shape onto 
   */
  protected drawWest(ctx: CanvasRenderingContext2D) : void {
    // 1
    ctx.fillRect(this.location.getX() * this.size, (this.location.getY() + 1) * this.size, this.size, this.size);
    // 2 -- Pivot
    ctx.fillRect(this.location.getX() * this.size, this.location.getY() * this.size, this.size, this.size);
    // 3 
    ctx.fillRect(this.location.getX() * this.size, (this.location.getY() - 1) * this.size, this.size, this.size);
    // 4
    ctx.fillRect((this.location.getX() - 1) * this.size, this.location.getY() * this.size, this.size, this.size);

    // draw borders
    ctx.globalAlpha = 0.3;
    ctx.strokeRect(this.location.getX() * this.size, (this.location.getY() + 1) * this.size, this.size, this.size);
    ctx.strokeRect(this.location.getX() * this.size, this.location.getY() * this.size, this.size, this.size);
    ctx.strokeRect(this.location.getX() * this.size, (this.location.getY() - 1) * this.size, this.size, this.size);
    ctx.strokeRect((this.location.getX() - 1) * this.size, this.location.getY() * this.size, this.size, this.size);    
  }

}

/** class representing Z-Shape */
export class ShapeZ extends Shape {

  /**
   * Create new T-Shape
   *
   *   ( N | S )      ( E | W )
   *
   *    [ ][L]            [ ]  
   *       [ ][ ]  ->  [ ][L]  
   *                   [ ]  
   * 
   * L -> Location represents pivot cell used to rotate
   *
   * @param _board - game board 
   */
  constructor(private _board:Board) {
    super(_board, 'red');
  }

  /**
   * get type
   */
  getType(): Type {
    return Type.Z;
  }

  /**
   * determine if move is valid for this shape 
   * @param targetLoc - target location of shape's pivot
   * @param targetRotation - shape target rotation
   */
  protected isValidBoardAction(targetLoc: Location, targetRotation: Rotation): boolean {
    let isValid: boolean = false;
    // validate bounds of board
    if ((targetRotation === Rotation.NORTH || targetRotation === Rotation.SOUTH) && targetLoc.getX() > 0 && targetLoc.getX() < 9 && targetLoc.getY() < 19) {
      isValid = true;
    } else if ((targetRotation === Rotation.EAST || targetRotation === Rotation.WEST) && targetLoc.getX() > 0 && targetLoc.getX() < 10 && targetLoc.getY() < 19 ) {
      isValid = true;
    }
  
    return isValid;
  }

  /**
   * retrieve cells for this shape
   * @param targetLoc - shape's pivot 
   */
  protected createCellsBasedOnLocation(location: Location): Location[] {
    let cells: Location[] = [];
    // add the pivot
    cells.push(location);

    switch(this.rotation) {
      case Rotation.NORTH:
      case Rotation.SOUTH:
        cells.push(new Location(location.getX()-1, location.getY()));
        cells.push(new Location(location.getX(), location.getY() + 1));
        cells.push(new Location(location.getX()+1, location.getY() + 1));
        break;

      case Rotation.EAST:
      case Rotation.WEST:
        cells.push(new Location(location.getX(), location.getY()-1));
        cells.push(new Location(location.getX() - 1, location.getY()));
        cells.push(new Location(location.getX() - 1, location.getY()+1));
        break;

      default:
        console.log('ERROR: unexpected error');
        break;
    }
   
    cells.forEach((location: Location) => {
      location.setColor(this.color);
    });

    return cells;
  }

  /** 
   * draw shape facing north 
   *
   *    [1][2]
   *       [3][4]
   *
   * @param ctx - canvas 2D context to draw shape onto   
   */
  protected drawNorth(ctx: CanvasRenderingContext2D) : void {
    this.drawHorizontal(ctx);
  }

  /**   
   * draw shape facing east  
   *
   *        [1] 
   *     [3][2]
   *     [4]   
   * @param ctx - canvas 2D context to draw shape onto   
   */
  protected drawEast(ctx: CanvasRenderingContext2D) : void {
    this.drawVertical(ctx);
  }

  /**    
   * draw shape facing south
   *
   * [1][2]
   *    [3][4]
   * 
   * @param ctx - canvas 2D context to draw shape onto  
   */
  protected drawSouth(ctx: CanvasRenderingContext2D) : void {
    this.drawHorizontal(ctx);
  }

  /**   
   * draw shape facing east  
   *
   *        [1] 
   *     [3][2]
   *     [4]   
   * @param ctx - canvas 2D context to draw shape onto   
   */
  protected drawWest(ctx: CanvasRenderingContext2D) : void {
    this.drawVertical(ctx);
  }

  /**
   * helper method to draw vertical tetris.
   * @param ctx - canvas 2D context to draw shape onto   
   */
  private drawVertical(ctx: CanvasRenderingContext2D) : void {
    // 1
    ctx.fillRect(this.location.getX() * this.size, (this.location.getY() - 1) * this.size, this.size, this.size);
    // 2 -- Pivot
    ctx.fillRect(this.location.getX() * this.size, this.location.getY() * this.size, this.size, this.size);
    // 3
    ctx.fillRect((this.location.getX() - 1) * this.size, this.location.getY() * this.size, this.size, this.size);
    // 4
    ctx.fillRect((this.location.getX() - 1) * this.size, (this.location.getY() + 1) * this.size, this.size, this.size);

    // draw borders
    ctx.globalAlpha = 0.3;
    ctx.strokeRect(this.location.getX() * this.size, (this.location.getY() - 1) * this.size, this.size, this.size);
    ctx.strokeRect(this.location.getX() * this.size, this.location.getY() * this.size, this.size, this.size);
    ctx.strokeRect((this.location.getX() - 1) * this.size, this.location.getY() * this.size, this.size, this.size);
    ctx.strokeRect((this.location.getX() - 1) * this.size, (this.location.getY() + 1) * this.size, this.size, this.size);
  }

  /**
   * helper method to draw horizontal tetris.
   * @param ctx - canvas 2D context to draw shape onto   
   */
  private drawHorizontal(ctx: CanvasRenderingContext2D) : void {
    // 1
    ctx.fillRect((this.location.getX() - 1) * this.size, this.location.getY() * this.size, this.size, this.size);
    // 2 -- Pivot
    ctx.fillRect(this.location.getX() * this.size, this.location.getY() * this.size, this.size, this.size);
    // 3
    ctx.fillRect(this.location.getX() * this.size, (this.location.getY() + 1) * this.size, this.size, this.size);
    // 4
    ctx.fillRect((this.location.getX() + 1) * this.size, (this.location.getY() + 1) * this.size, this.size, this.size);

    // draw borders
    ctx.globalAlpha = 0.3;
    ctx.strokeRect((this.location.getX() - 1) * this.size, this.location.getY() * this.size, this.size, this.size);
    ctx.strokeRect(this.location.getX() * this.size, this.location.getY() * this.size, this.size, this.size);
    ctx.strokeRect(this.location.getX() * this.size, (this.location.getY() + 1) * this.size, this.size, this.size);
    ctx.strokeRect((this.location.getX() + 1) * this.size, (this.location.getY() + 1) * this.size, this.size, this.size);
  }
}

/** class representing S-Shape */
export class ShapeS extends Shape {

  /**
   * Create new T-Shape
   *
   *   ( N | S )      ( E | W )
   *
   *      [L][ ]       [ ]   
   *   [ ][ ]     ->   [L][ ]  
   *                      [ ]     
   * 
   * L -> Location represents pivot cell used to rotate
   *
   * @param _board - game board 
   */
  constructor(private _board:Board) {
    super(_board, '#00FFFF'); // cyan
  }

  /**
   * get type
   */
  getType(): Type {
    return Type.S;
  }

  /**
   * determine if move is valid for this shape 
   * @param targetLoc - target location of shape's pivot
   * @param targetRotation - shape target rotation
   */
  protected isValidBoardAction(targetLoc: Location, targetRotation: Rotation): boolean {
    let isValid: boolean = false;
    // validate bounds of board
    if ((targetRotation === Rotation.NORTH || targetRotation === Rotation.SOUTH) && targetLoc.getX() > 0 && targetLoc.getX() < 9 && targetLoc.getY() < 19 ) {
      isValid = true;
    } else if ((targetRotation === Rotation.EAST || targetRotation === Rotation.WEST) && targetLoc.getX() >= 0 && targetLoc.getX() < 9 && targetLoc.getY() < 19 ) {
      isValid = true;
    }
  
    return isValid;
  }

  /**
   * retrieve cells for this shape
   * @param targetLoc - shape's pivot 
   */
  protected createCellsBasedOnLocation(location: Location): Location[] {
    let cells: Location[] = [];
    // add the pivot
    cells.push(location);

    switch(this.rotation) {
      case Rotation.NORTH:
      case Rotation.SOUTH:
        cells.push(new Location(location.getX() + 1, location.getY()));
        cells.push(new Location(location.getX(), location.getY() + 1));
        cells.push(new Location(location.getX() - 1, location.getY() + 1));
        break;

      case Rotation.EAST:
      case Rotation.WEST:
        cells.push(new Location(location.getX(), location.getY() - 1));
        cells.push(new Location(location.getX() + 1, location.getY()));
        cells.push(new Location(location.getX() + 1, location.getY() + 1));
        break;

      default:
        console.log('ERROR: unexpected error');
        break;
    }
    
    cells.forEach((location: Location) => {
      location.setColor(this.color);
    });

    return cells;
  }

  /**    
   * draw shape facing north
   *
   *    [2][1]
   * [4][3]
   *
   * @param ctx - canvas 2D context to draw shape onto
   */
  protected drawNorth(ctx: CanvasRenderingContext2D) : void {
    this.drawHorizontal(ctx);
  }

  /**  
   * draw shape facing east
   * 
   *   [1] 
   *   [2][3]
   *      [4]   
   *  
   * @param ctx - canvas 2D context to draw shape onto
   */
  protected drawEast(ctx: CanvasRenderingContext2D) : void {
    this.drawVertical(ctx);
  }

  /**    
   * draw shape facing south
   *
   *       [2][1]
   *    [4][3]
   *
   * @param ctx - canvas 2D context to draw shape onto
   */
  protected drawSouth(ctx: CanvasRenderingContext2D) : void {
    this.drawHorizontal(ctx);
  }

  /**   
   * draw shape facing west
   *
   *    [1] 
   *    [2][3]
   *       [4]   
   *
   * @param ctx - canvas 2D context to draw shape onto
   */
  protected drawWest(ctx: CanvasRenderingContext2D) : void {
    this.drawVertical(ctx);
  }

  /**
   * helper method to draw vertical shape.
   * @param ctx - canvas 2D context to draw shape onto
   */
  private drawVertical(ctx: CanvasRenderingContext2D) : void {
    // 1
    ctx.fillRect(this.location.getX() * this.size, (this.location.getY() - 1) * this.size, this.size, this.size);
    // 2 -- Pivot
    ctx.fillRect(this.location.getX() * this.size, this.location.getY() * this.size, this.size, this.size);
    // 3
    ctx.fillRect((this.location.getX() + 1) * this.size, this.location.getY() * this.size, this.size, this.size);
    // 4
    ctx.fillRect((this.location.getX() + 1) * this.size, (this.location.getY() + 1) * this.size, this.size, this.size);

    // draw borders
    ctx.globalAlpha = 0.3;
    ctx.strokeRect(this.location.getX() * this.size, (this.location.getY() - 1) * this.size, this.size, this.size);
    ctx.strokeRect(this.location.getX() * this.size, this.location.getY() * this.size, this.size, this.size);
    ctx.strokeRect((this.location.getX() + 1) * this.size, this.location.getY() * this.size, this.size, this.size);
    ctx.strokeRect((this.location.getX() + 1) * this.size, (this.location.getY() + 1) * this.size, this.size, this.size);
  }

  /**
   * helper method to draw horizontal shape.
   * @param ctx - canvas 2D context to draw shape onto
   */
  private drawHorizontal(ctx: CanvasRenderingContext2D) : void {
    // 1
    ctx.fillRect((this.location.getX() + 1) * this.size, this.location.getY() * this.size, this.size, this.size);
    // 2 -- Pivot
    ctx.fillRect(this.location.getX() * this.size, this.location.getY() * this.size, this.size, this.size);
    // 3
    ctx.fillRect(this.location.getX() * this.size, (this.location.getY() + 1) * this.size, this.size, this.size);
    // 4
    ctx.fillRect((this.location.getX() - 1) * this.size, (this.location.getY() + 1) * this.size, this.size, this.size);

    // draw borders
    ctx.globalAlpha = 0.3;
    ctx.strokeRect((this.location.getX() + 1) * this.size, this.location.getY() * this.size, this.size, this.size);
    ctx.strokeRect(this.location.getX() * this.size, this.location.getY() * this.size, this.size, this.size);
    ctx.strokeRect(this.location.getX() * this.size, (this.location.getY() + 1) * this.size, this.size, this.size);
    ctx.strokeRect((this.location.getX() - 1) * this.size, (this.location.getY() + 1) * this.size, this.size, this.size);
  }
}