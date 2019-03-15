import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Location, Shape, Type } from '../core/shapes';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class PreviewComponent implements OnInit {

  private _shape: Shape;
  private isReady: boolean = false;

  get shape(): Shape {
    return this._shape;
  }

  @Input() 
  set shape(shape: Shape) {
    this._shape = shape;
    if (this.isReady) {
      this.draw();
    }
  }

  @ViewChild('nextShapeCanvas') canvasRef: ElementRef;

  private nextShapeCtx: CanvasRenderingContext2D;

  constructor() { }

  ngOnInit() {
    let nextShapeCanvas: any = this.canvasRef.nativeElement;
    this.nextShapeCtx = nextShapeCanvas.getContext('2d');
    this.isReady = true;
    if (typeof this._shape !== 'undefined') {
      this.draw();
    }
  }

  /**
   * function to draw next shape
   */
  private draw() : void {
    this.nextShapeCtx.globalAlpha = 1.0;
    this.nextShapeCtx.fillStyle = "black";
    this.nextShapeCtx.fillRect(0, 0, 120, 120);

    let cells: Location[] = this._shape.getCells();
    let xOffSet:number, yOffSet:number;
    switch (this._shape.getType()) {
      case Type.I:
        xOffSet = 1.5;
        yOffSet = 2;
        break;
      case Type.O:
        xOffSet = 2;
        yOffSet = 3;
        break;
      case Type.T:
        xOffSet = 1.5;
        yOffSet = 3;
        break;
      case Type.Z:
      case Type.S:
        xOffSet = 1.5;
        yOffSet = 2;
        break;
      case Type.J:
        xOffSet = 1;
        yOffSet = 2.5;
        break;
      case Type.L:
        xOffSet = 1;
        yOffSet = 2.5;
      default:
        xOffSet = 2;
        yOffSet = 2;
        break;
    }
    
    cells.forEach((cell:Location) => {
      this.nextShapeCtx.globalAlpha = 1.0;
      this.nextShapeCtx.fillStyle = cell.getColor();
      this.nextShapeCtx.fillRect((cell.getX()-xOffSet) * 20, (cell.getY()+yOffSet) * 20, 20, 20);
      this.nextShapeCtx.globalAlpha = 0.3;
      this.nextShapeCtx.strokeRect((cell.getX()-xOffSet) * 20, (cell.getY()+yOffSet) * 20, 20, 20);
    })
  }
}
