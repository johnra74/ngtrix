import { Injectable } from '@angular/core';
import { Observable, Observer, Subscription } from 'rxjs';

const KEY_TOP_SCORE: string = 'top-score';

export class Score {
  name: string;
  level: number;
  score: number;

  constructor(name: string, level: number, score: number) {
    this.score = score;
    this.level = level;
    this.name = name;
  }
}

@Injectable({
  providedIn: 'root'
})
export class TopScoreService {

  constructor() { }

  /**
   * get local score board
   */
  public getLocalScore(): Observable<Score[]> {
    return Observable.create((obs: Observer<Score[]>) => {
      let json:string = localStorage.getItem(KEY_TOP_SCORE);
      let topScores: Score[];
      if (typeof json !== 'undefined' && json !== null) {
        topScores = JSON.parse(json);
      } else {
        topScores = this.getPreLoadList();
        this.save(topScores);
      }
      obs.next(topScores);
      obs.complete();
    });
  }

  /**
   * save new top score board
   * @param scores - new score
   */
  public save(scores: Score[]): void {
    localStorage.setItem(KEY_TOP_SCORE, JSON.stringify(scores));
  }

  /**
   * get default score board
   */
  private getPreLoadList(): Score[] {
    let topScores: Score[] = [];
    topScores.push(new Score('Homer', 10, 10000));
    topScores.push(new Score('Marge', 8, 8000));
    topScores.push(new Score('Bart', 6, 6000));
    topScores.push(new Score('Lisa', 4, 4000));
    topScores.push(new Score('Maggie', 2, 2000));

    return topScores;
  }
}
