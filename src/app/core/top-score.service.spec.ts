import { TestBed } from '@angular/core/testing';
import { Observable, Observer, Subscription } from 'rxjs';

import { Score, TopScoreService } from './top-score.service';

describe('TopScoreService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
    localStorage.clear();
  });

  it('should be created', () => {
    const service: TopScoreService = TestBed.get(TopScoreService);
    expect(service).toBeTruthy();
  });

  it('should create default top score board', () => {
    const service: TopScoreService = TestBed.get(TopScoreService);
    service.getLocalScore().subscribe((scores: Score[]) => {
      expect(scores.length).toEqual(5);
    });
  });

  it('should save', () => {
    const service: TopScoreService = TestBed.get(TopScoreService);
    let topScore: Score = new Score('Foo', 11, 5000);
    service.getLocalScore().subscribe((scores: Score[]) => {
      scores.push(topScore);
      service.save(scores);
    }, (error) => {

    }, () => {
      service.getLocalScore().subscribe((scores: Score[]) => {
        expect(scores.length).toEqual(6);
        let matches: Score[] = 
          scores.filter((score:Score) => {
            return score.score === topScore.score && score.name === topScore.name && score.level === topScore.level;
          });
        expect(matches.length).toEqual(1);
      });
    })
  })
});
