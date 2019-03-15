import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';

import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { PartialObserver } from 'rxjs';

import { Score, TopScoreService } from '../core/top-score.service';

@Component({
  selector: 'top-score',
  templateUrl: './top-score.component.html',
  styleUrls: ['./top-score.component.scss']
})
export class TopScoreComponent implements OnInit {

  @Input() showHeader: boolean = true;
  @ViewChild('template') template: TemplateRef<any>;

  topScore: Score[];
  score: Score
  modalRef: BsModalRef;
  name: string;

  constructor(private topScoreService: TopScoreService, private modalService: BsModalService) { }

  ngOnInit(): void {
    this.topScoreService.getLocalScore().subscribe((scores:Score[])=>{
      this.topScore = scores;
    });
  }

  /**
   * open modal containing controller information
   */
  openModal(score: Score): void {
    this.score = score;
    if (this.getRank() !== -1) {
      this.modalRef = this.modalService.show(this.template);
    }   
  }

  /**
   * save to new top score
   */
  save(name: string): void {
    if (name === null || name === '') {
      this.score.name = 'UNKNOWN';
    } else {
      this.score.name = name;
    }

    let newTopList: Score[] = [];
    let rank = this.getRank();
    if (rank >= 0 && rank <= 10) {
      for (var i = 0; i < rank; i++) {
        newTopList.push(this.topScore[i]);
      }
      newTopList.push(this.score);
      for (var i = rank; i < this.topScore.length; i++) {
        newTopList.push(this.topScore[i]);
      }

      // only keep top ten scores
      this.topScore = newTopList.slice(0, newTopList.length > 10 ? 10 : newTopList.length);
      this.topScoreService.save(this.topScore);      
    }

    this.modalRef.hide()
  }

  /**
   * find rank based on current score
   */
  private getRank() : number {
    let rank: number = -1;
    if (typeof this.score !== 'undefined') {
      for (var i = 0; i < this.topScore.length; i++) {
        if (this.topScore[i].score < this.score.score) {
          rank = i;
          break;
        }
      } 
    }

    return rank;
  }
}
