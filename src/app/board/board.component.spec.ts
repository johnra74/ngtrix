import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { AdsenseModule } from 'ng2-adsense'
import { faPlay, faPause, faVolumeMute, faVolumeUp } from '@fortawesome/free-solid-svg-icons';

import { BoardComponent } from './board.component';
import { PreviewComponent } from '../preview/preview.component';
import { TopScoreComponent } from '../top-score/top-score.component';
import { Board, Location, Rotation, Shape, Type } from '../core/shapes';

class MockBoard implements Board {
  currentShape: Shape;
  nextShape: Shape;
  filledCells: Location[] = [];
  cellSize: number;
  audioPlayer: any;

  draw(): void { }
  drop(): void { }
}

class MockShape extends Shape {
  moveLeftCalled: boolean = false;
  moveRightCalled: boolean = false;
  dropCalled: boolean = false;
  rotateClockWiseCalled: boolean = false;
  rotateCounterClockWiseCalled: boolean = false;
  createCellsBasedOnLocationCalled: boolean = false;

  constructor() {
    super(new MockBoard(), 'purple');
  }
  
  getType(): Type {
    return Type.O;
  }

  moveLeft(): void {
    this.moveLeftCalled = true;
  }

  moveRight(): void {
    this.moveRightCalled = true;
  }

  drop(): void {
    this.dropCalled = true;
  }

  rotateClockWise(): void {
    this.rotateClockWiseCalled = true;
  }

  rotateCounterClockWise(): void {
    this.rotateCounterClockWiseCalled = true;
  }

  setCanMove(canMoveDown: boolean): void {
    this.canMoveDown = canMoveDown;
  }

  protected createCellsBasedOnLocation(targetLoc: Location, _rotation?: Rotation): Location[] {
    this.createCellsBasedOnLocationCalled = true;
    let cells: Location[] = [];
    cells.push(new Location(5,5));
    return cells;
  }

  protected drawNorth(ctx: CanvasRenderingContext2D): void { }
  protected drawEast(ctx: CanvasRenderingContext2D): void { }
  protected drawSouth(ctx: CanvasRenderingContext2D): void { }
  protected drawWest(ctx: CanvasRenderingContext2D): void { }

  protected isValidBoardAction(targetLoc: Location, targetRotation: Rotation): boolean {
    return true;
  }
}

describe('BoardComponent', () => {
  let component: BoardComponent;
  let fixture: ComponentFixture<BoardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BoardComponent, PreviewComponent, TopScoreComponent ],
      imports: [FontAwesomeModule, ModalModule.forRoot(), TabsModule.forRoot(), AdsenseModule.forRoot({}) ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render app-preview', () => {
    const fixture = TestBed.createComponent(BoardComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('app-preview').innerHTML ).toContain('canvas');
  });

  it('should move left', () => {
    let mockShape: MockShape = new MockShape();
    component.currentShape = mockShape;
    component.handleKeyboardEvent(new KeyboardEvent('keydown', { key: 'a' }));

    expect(mockShape.moveLeftCalled).toBeTruthy();
  })

  it('should move right', () => {
    let mockShape: MockShape = new MockShape();
    component.currentShape = mockShape;
    component.handleKeyboardEvent(new KeyboardEvent('keydown', { key: 'd' }));

    expect(mockShape.moveRightCalled).toBeTruthy();
  })

  it('should move drop', () => {
    let mockShape: MockShape = new MockShape();
    component.currentShape = mockShape;
    component.handleKeyboardEvent(new KeyboardEvent('keydown', { key: 's' }));

    expect(mockShape.dropCalled).toBeTruthy();
  })

  it('should move clock-wise', () => {
    let mockShape: MockShape = new MockShape();
    component.currentShape = mockShape;
    component.handleKeyboardEvent(new KeyboardEvent('keydown', { key: '.' }));

    expect(mockShape.rotateClockWiseCalled).toBeTruthy();
  })

  it('should move counter clock-wise', () => {
    let mockShape: MockShape = new MockShape();
    component.currentShape = mockShape;
    component.handleKeyboardEvent(new KeyboardEvent('keydown', { key: ',' }));

    expect(mockShape.rotateCounterClockWiseCalled).toBeTruthy();
  })

  it('should move clock-wise - alternative', () => {
    let mockShape: MockShape = new MockShape();
    component.currentShape = mockShape;
    component.handleKeyboardEvent(new KeyboardEvent('keydown', { key: ']' }));

    expect(mockShape.rotateClockWiseCalled).toBeTruthy();
  })

  it('should move counter clock-wise - alternative', () => {
    let mockShape: MockShape = new MockShape();
    component.currentShape = mockShape;
    component.handleKeyboardEvent(new KeyboardEvent('keydown', { key: '[' }));

    expect(mockShape.rotateCounterClockWiseCalled).toBeTruthy();
  })

  it('should not action invalid key', () => {
    let mockShape: MockShape = new MockShape();
    component.currentShape = mockShape;
    component.handleKeyboardEvent(new KeyboardEvent('keydown', { key: 'z' }));

    expect(mockShape.moveLeftCalled).toBeFalsy();
    expect(mockShape.moveRightCalled).toBeFalsy();
    expect(mockShape.dropCalled).toBeFalsy();
    expect(mockShape.rotateClockWiseCalled).toBeFalsy();
    expect(mockShape.rotateCounterClockWiseCalled).toBeFalsy()
  })

  it('should not drop current shape', () => {
    let mockShape: MockShape = new MockShape();
    mockShape.setCanMove(false);
    
    component.currentShape = mockShape;
    component.drop();
    expect(mockShape.createCellsBasedOnLocationCalled).toBeTruthy();
  });

  it('should toggle mute', () => {
    component.isMuted = false;
    component.toggleMute();
    expect(component.isMuted).toBeTruthy();
    expect(component.faMuteFlag).toEqual(faVolumeMute);
    component.toggleMute();
    expect(component.isMuted).toBeFalsy();
    expect(component.faMuteFlag).toEqual(faVolumeUp);
  });

  it('should toggle pause', () => {
    component.gameEngine.paused = false;
    component.togglePause()
    expect(component.gameEngine.paused).toBeTruthy();
    expect(component.faPauseFlag).toEqual(faPlay);
    component.togglePause();
    expect(component.gameEngine.paused).toBeFalsy();
    expect(component.faPauseFlag).toEqual(faPause);
  });

  it('should not move left when paused', () => {
    let mockShape: MockShape = new MockShape();
    component.currentShape = mockShape;
    component.isPaused = true;
    component.moveLeft();
    expect(mockShape.moveLeftCalled).toBeFalsy();
  });

  it('should not move right when paused', () => {
    let mockShape: MockShape = new MockShape();
    component.currentShape = mockShape;
    component.isPaused = true;
    component.moveRight();
    expect(mockShape.moveRightCalled).toBeFalsy();
  });

  it('should not rotate clockwise when paused', () => {
    let mockShape: MockShape = new MockShape();
    component.currentShape = mockShape;
    component.isPaused = true;
    component.rotateClockWise();
    expect(mockShape.rotateClockWiseCalled).toBeFalsy();
  });

  it('should not rotate counter-clockwise when paused', () => {
    let mockShape: MockShape = new MockShape();
    component.currentShape = mockShape;
    component.isPaused = true;
    component.rotateCounterClockWise();
    expect(mockShape.rotateCounterClockWiseCalled).toBeFalsy();
  });

  it('should not drop when paused', () => {
    let mockShape: MockShape = new MockShape();
    component.currentShape = mockShape;
    component.isPaused = true;
    component.drop();
    expect(mockShape.dropCalled).toBeFalsy();
  });

  it('should not drop when game is over', () => {
    let mockShape: MockShape = new MockShape();
    component.currentShape = mockShape;
    component.gameEngine.gameOver = true;
    component.drop();
    expect(mockShape.dropCalled).toBeFalsy();
  });

  it('should advance to next shape when current shape completes', () => {
    let doneShape: MockShape = new MockShape();
    doneShape.setCanMove(false);
    let nextShape: MockShape = new MockShape();
    component.currentShape = doneShape;
    component.nextShape = nextShape;
    component.drop();
    expect(component.currentShape).toBe(nextShape);
  });

  it('should push done shape cells to filledCells when shape completes', () => {
    let doneShape: MockShape = new MockShape();
    doneShape.setCanMove(false);
    component.currentShape = doneShape;
    component.nextShape = new MockShape();
    component.filledCells = [];
    component.drop();
    expect(component.filledCells.length).toBeGreaterThan(0);
  });

  it('should not drop when game is already over before drop', () => {
    let mockShape: MockShape = new MockShape();
    component.currentShape = mockShape;
    component.isPaused = false;
    component.gameEngine.gameOver = true;
    component.drop();
    expect(mockShape.dropCalled).toBeFalsy();
  });

});
