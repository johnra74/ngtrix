import { Component, ElementRef, HostListener, OnInit, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { timer, Observable, Subscription } from 'rxjs';

import { faAngleLeft, faAngleDoubleDown, faAngleRight, faAngleUp, faAward, faInfoCircle, faPlay, faPause, faRedoAlt, faUndoAlt, faVolumeMute, faVolumeUp } from '@fortawesome/free-solid-svg-icons';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

import { Board, Location, Shape } from '../core/shapes';
import { GameEngine } from '../core/game.engine';
import { Score } from '../core/top-score.service';
import { TopScoreComponent } from '../top-score/top-score.component';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit, OnDestroy, Board {

  @ViewChild('mainCanvas') mainCanvasRef: ElementRef;
  /*
   * hidden canvas for pre-drawing to improve animation (aka double-buffering)
   */
  @ViewChild('dbCanvas') dbCanvasRef: ElementRef;
  @ViewChild('audioBackground') audioRef: ElementRef;
  @ViewChild('topScore') topScore: TopScoreComponent;

  currentShape: Shape;
  nextShape: Shape;

  filledCells: Location[];
  cellSize: number = 30;

  isMuted: boolean = true;
  isPaused: boolean = false;
  
  /*
   * font-awesom for UI control icons
   */
  faClockwise = faRedoAlt;
  faCounterClockwise = faUndoAlt;
  faUp = faAngleUp;
  faLeft = faAngleLeft;
  faRight = faAngleRight;
  faDown = faAngleDoubleDown;
  faPlay = faPlay;
  faMuteFlag = faVolumeMute;
  faPauseFlag = faPause;
  faInfo = faInfoCircle;
  faTopScore = faAward;
  
  modalRef: BsModalRef;
  topScoreModalRef: BsModalRef;

  audioPlayer: any;

  readonly width: number = this.cellSize * 10;
  readonly height: number = this.cellSize * 20;
  
  private dbCanvas: any;
  private mainCtx: CanvasRenderingContext2D;
  private dbCtx: CanvasRenderingContext2D;

  constructor(public gameEngine: GameEngine, private modalService: BsModalService) { 
    this.gameEngine.gameOver = false;
  }

  ngOnInit() {
    this.audioPlayer = this.audioRef.nativeElement;

    let mainCanvas: any = this.mainCanvasRef.nativeElement;
    this.mainCtx = mainCanvas.getContext('2d');

    this.dbCanvas = this.dbCanvasRef.nativeElement;
    this.dbCtx = this.dbCanvas.getContext('2d');
    
    this.gameEngine.setBoard(this);
    this.startNewGame();
  }

  ngOnDestroy() {
    this.gameEngine.endGame();
  }

  /**
   * handle keyboard events
   * @param event - key event
   */
  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) { 
    switch (event.key) {
      case 'a':
        this.moveLeft();
        break;
      case 'd':
        this.moveRight();
        break;
      case 's':
        this.drop();
        break;
      case '.':
      case ']':
        this.rotateClockWise();
        break;
      case ',':
      case '[':
        this.rotateCounterClockWise();
        break;
      default:
        console.log('invalid move[%s]. Valid moves are left[a], right[d], drop[s], turn clockwise [.], turn counter-clockwise[,]', event.key);
        break;
    }
  }

  /**
   * move current shape left
   */
  moveLeft(): void {
    if (!this.isPaused) {
      this.currentShape.moveLeft();
    }
  }

  /**
   * move current shape right
   */
  moveRight(): void {
    if (!this.isPaused) {
      this.currentShape.moveRight();
    }
  }

  /**
   * drop current shape
   */
  drop(): void {
    if (!this.isPaused && !this.gameEngine.gameOver) {
      this.currentShape.drop();

      if (this.currentShape.isDone()) {
        let cells: Location[] = this.currentShape.getCells();
        cells.forEach((cell:Location) => { 
          this.filledCells.push(cell); 
        });

        this.gameEngine.checkGameOver();
        this.gameEngine.clearRows();

        // next shape becomes current shape
        this.currentShape = this.nextShape; 
        this.nextShape = this.gameEngine.nextShape();

        if (this.gameEngine.gameOver) {
          this.topScore.openModal(new Score(null, this.gameEngine.level, this.gameEngine.score));
        }
      }
    }
  }

  /**
   * rotate current shape clock-wise
   */
  rotateClockWise(): void {
    if (!this.isPaused) {
      this.currentShape.rotateClockWise();
    }
  }

  /**
   * rotate current shape counter clock-wise
   */
  rotateCounterClockWise(): void {
    if (!this.isPaused) {
      this.currentShape.rotateCounterClockWise();
    }
  }

  /**
   * start a new game
   */
  startNewGame(): void {
    if (!this.isMuted) {
      this.audioPlayer.play();
    }
    
    this.currentShape = this.gameEngine.nextShape();
    this.nextShape = this.gameEngine.nextShape();

    this.filledCells = [];
    this.gameEngine.startGame();
  }

  /**
   * mute/unmute background music
   */
  toggleMute() : void {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.faMuteFlag = faVolumeMute;
      this.audioPlayer.pause();
    } else {
      this.faMuteFlag = faVolumeUp;
      this.audioPlayer.play();
    }
  }

  /**
   * pause game
   */
  togglePause() : void {
    this.gameEngine.paused = !this.gameEngine.paused;
    this.isPaused = this.gameEngine.paused;
    if (this.isPaused) {
      this.faPauseFlag = faPlay;
    } else {
      this.faPauseFlag = faPause;
    }
  }

  /**
   * open modal containing controller information
   */
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  /**
   * open top-score modal containing controller information
   */
  openTopScoreModal(template: TemplateRef<any>) {
    this.topScoreModalRef = this.modalService.show(template);
  }

  /**
   * refresh canvas with latest sprites
   */
  draw() : void {
    this.doubleBufferDraw();
    this.mainCtx.drawImage(this.dbCanvas, 0, 0);
  }

  /**
   * helper function to draw offscreen - double buffering
   */
  private doubleBufferDraw() : void {
    this.dbCtx.fillStyle = "black";
    this.dbCtx.fillRect(0, 0, this.width, this.height);

    this.filledCells.forEach((cell:Location) => {
      this.dbCtx.globalAlpha = 1.0;
      this.dbCtx.fillStyle = cell.getColor();
      this.dbCtx.fillRect(cell.getX() * this.cellSize, cell.getY() * this.cellSize, this.cellSize, this.cellSize);
      this.dbCtx.globalAlpha = 0.3;
      this.dbCtx.strokeRect(cell.getX() * this.cellSize, cell.getY() * this.cellSize, this.cellSize, this.cellSize);
    });

    this.currentShape.draw(this.dbCtx);
  }
}
