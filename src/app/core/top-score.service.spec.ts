import { TestBed } from '@angular/core/testing';
import { Score, TopScoreService } from './top-score.service';

describe('TopScoreService', () => {
  let service: TopScoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    localStorage.clear();
    service = TestBed.inject(TopScoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create default top score board when localStorage is empty', () => {
    service.getLocalScore().subscribe((scores: Score[]) => {
      expect(scores.length).toEqual(5);
    });
  });

  it('should preload default scores with expected names', () => {
    service.getLocalScore().subscribe((scores: Score[]) => {
      const names = scores.map(s => s.name);
      expect(names).toContain('Homer');
      expect(names).toContain('Marge');
    });
  });

  it('should load scores from existing localStorage data', () => {
    const existing: Score[] = [
      new Score('Alice', 5, 5000),
      new Score('Bob', 3, 3000),
    ];
    localStorage.setItem('top-score', JSON.stringify(existing));

    service.getLocalScore().subscribe((scores: Score[]) => {
      expect(scores.length).toBe(2);
      expect(scores[0].name).toBe('Alice');
      expect(scores[1].name).toBe('Bob');
    });
  });

  it('should save scores to localStorage', () => {
    const scores: Score[] = [new Score('Test', 2, 200)];
    service.save(scores);
    const raw = localStorage.getItem('top-score');
    expect(raw).not.toBeNull();
    const parsed: Score[] = JSON.parse(raw);
    expect(parsed.length).toBe(1);
    expect(parsed[0].name).toBe('Test');
  });

  it('should persist saved scores and reload them', () => {
    const topScore: Score = new Score('Foo', 11, 5000);
    service.getLocalScore().subscribe((scores: Score[]) => {
      scores.push(topScore);
      service.save(scores);
    });

    service.getLocalScore().subscribe((scores: Score[]) => {
      expect(scores.length).toEqual(6);
      const match = scores.find(s => s.score === 5000 && s.name === 'Foo');
      expect(match).toBeTruthy();
    });
  });

  it('should overwrite previous localStorage data on save', () => {
    service.save([new Score('First', 1, 100)]);
    service.save([new Score('Second', 2, 200)]);

    service.getLocalScore().subscribe((scores: Score[]) => {
      expect(scores.length).toBe(1);
      expect(scores[0].name).toBe('Second');
    });
  });
});
