import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewComponent } from './preview.component';
import { Board, Location, Rotation, Shape, Type, ShapeI, ShapeJ, ShapeL, ShapeO, ShapeS, ShapeT, ShapeZ } from '../core/shapes';

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

class MockShape extends Shape {
  private called: boolean = false;
  constructor(private _board: Board) {
    super(_board, '#00FFFF');
  }

  getType(): Type {
    return Type.S;
  }

  drawEast(): void { }

  drawNorth(): void { }

  drawSouth(): void { }

  drawWest(): void { }

  isSuccessfullyCalled(): boolean {
    return this.called;
  }

  getCells(): Location[] {
    this.called = true;
    return [];
  }

  protected isValidBoardAction(targetLoc: Location, targetRotation: Rotation): boolean {
    return true;
  }

  protected createCellsBasedOnLocation(location: Location): Location[] {
    return [];
  }
}

describe('PreviewComponent', () => {
  let component: PreviewComponent;
  let fixture: ComponentFixture<PreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should draw mock shape in preview', () => {
    let mockShape: MockShape = new MockShape(new MockBoard());
    component.shape = mockShape;
    
    fixture.detectChanges();
    
    expect(mockShape.isSuccessfullyCalled()).toBe(true, 'preview shape successfully drawn')

  });

  it('should draw shape-I in preview', () => {
    let shape: Shape = new ShapeI(new MockBoard());
    component.shape = shape;
    fixture.detectChanges();
    expect(component.shape).toEqual(shape, 'preview did not return shape-I');
  });

  it('should draw shape-J in preview', () => {
    let shape: Shape = new ShapeJ(new MockBoard());
    component.shape = shape;
    fixture.detectChanges();
    expect(component.shape).toEqual(shape, 'preview did not return shape-J');
  });

  it('should draw shape-L in preview', () => {
    let shape: Shape = new ShapeL(new MockBoard());
    component.shape = shape;
    fixture.detectChanges();
    expect(component.shape).toEqual(shape, 'preview did not return shape-L');
  });

  it('should draw shape-O in preview', () => {
    let shape: Shape = new ShapeO(new MockBoard());
    component.shape = shape;
    fixture.detectChanges();
    expect(component.shape).toEqual(shape, 'preview did not return shape-O');
  });

  it('should draw shape-S in preview', () => {
    let shape: Shape = new ShapeS(new MockBoard());
    component.shape = shape;
    fixture.detectChanges();
    expect(component.shape).toEqual(shape, 'preview did not return shape-S');
  });

  it('should draw shape-L in preview', () => {
    let shape: Shape = new ShapeT(new MockBoard());
    component.shape = shape;
    fixture.detectChanges();
    expect(component.shape).toEqual(shape, 'preview did not return shape-T');
  });

  it('should draw shape-Z in preview', () => {
    let shape: Shape = new ShapeZ(new MockBoard());
    component.shape = shape;
    fixture.detectChanges();
    expect(component.shape).toEqual(shape, 'preview did not return shape-Z');
  });
});
