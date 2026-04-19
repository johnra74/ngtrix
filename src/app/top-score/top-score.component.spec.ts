import { TemplateRef } from '@angular/core';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, Observer, Subscription } from 'rxjs';

import { ModalModule, BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';

import { TopScoreComponent } from './top-score.component';
import { Score, TopScoreService } from '../core/top-score.service';

class MockTopScoreService {
  saveCalled: boolean = false;
  getLocalScore(): Observable<Score[]> {
    return Observable.create((obs: Observer<Score[]>) => {
      let topScores: Score[] = [];
      topScores.push(new Score('Mock', 1, 100));

      obs.next(topScores);
      obs.complete();
    });
  }

  save(scores: Score[]): void {
    this.saveCalled = true;
  }
}

class MockBsModalRef extends BsModalRef {
  hideCalled: boolean = false;
  hide: any = () => {
    this.hideCalled = true;
  }

  constructor() {
    super();
  }
}

class MockBsModalService extends BsModalService {
  showCalled: boolean = false;
  show(template: TemplateRef<any>): any {
    this.showCalled = true;
    return null;
  }
}

describe('TopScoreComponent', () => {
  let component: TopScoreComponent;
  let fixture: ComponentFixture<TopScoreComponent>;
  let modalService: MockBsModalService;
  let topScoreService: MockTopScoreService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TopScoreComponent ],
      providers: [
        {provide: TopScoreService, useClass: MockTopScoreService},
        {provide: BsModalService, useClass: MockBsModalService}
      ],
      imports: [ ModalModule.forRoot(), TabsModule.forRoot() ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopScoreComponent);
    component = fixture.componentInstance;
    modalService = TestBed.inject(BsModalService) as unknown as MockBsModalService;
    topScoreService = TestBed.inject(TopScoreService) as unknown as MockTopScoreService;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open modal', () => {
    component.openModal(new Score(null, 1, 5000));
    expect(modalService.showCalled).toBeTruthy();
  })

  it('should not open modal', () => {
    component.openModal(new Score(null, 1, 50));    
    expect(modalService.showCalled).toBeFalsy();
  })

  it('should save', () => {
    let modalRef = new MockBsModalRef();
    component.modalRef = modalRef;

    component.score = new Score(null, 1, 7000);
    component.save('Moe');

    expect(component.score.name).toEqual('Moe');
    expect(topScoreService.saveCalled).toBeTruthy();
    expect(modalRef.hideCalled).toBeTruthy();
  });

  it('should NOT save', () => {
    let modalRef = new MockBsModalRef();
    component.modalRef = modalRef;
    component.topScore = [];
    component.topScore.push(new Score('Tyler', 10, 1840));
    component.topScore.push(new Score('Harrison', 9, 1840));
    component.topScore.push(new Score('Van Buren', 8, 1836));
    component.topScore.push(new Score('Jackson', 7, 1828));
    component.topScore.push(new Score('Adams', 6, 1824));
    component.topScore.push(new Score('Monroe', 5, 1816));
    component.topScore.push(new Score('Madison', 4, 1808));
    component.topScore.push(new Score('Jefferson', 3, 1800));
    component.topScore.push(new Score('Adams', 2, 1796));
    component.topScore.push(new Score('Washington', 1, 1788));

    component.score = new Score(null, 1, 10);
    component.save(null);

    expect(component.score.name).toEqual('UNKNOWN');
    expect(topScoreService.saveCalled).toBeFalsy();
    expect(modalRef.hideCalled).toBeTruthy();
  }); 

  it('should save only top 10', () => {
    let modalRef = new MockBsModalRef();
    component.modalRef = modalRef;
    component.topScore = [];
    component.topScore.push(new Score('Lincoln', 16, 1860));
    component.topScore.push(new Score('Harrison', 9, 1840));
    component.topScore.push(new Score('Van Buren', 8, 1836));
    component.topScore.push(new Score('Jackson', 7, 1828));
    component.topScore.push(new Score('Adams', 6, 1824));
    component.topScore.push(new Score('Monroe', 5, 1816));
    component.topScore.push(new Score('Madison', 4, 1808));
    component.topScore.push(new Score('Jefferson', 3, 1800));
    component.topScore.push(new Score('Adams', 2, 1796));
    component.topScore.push(new Score('Washington', 1, 1788));

    component.score = new Score(null, 10, 1840);
    component.save('Tyler');

    expect(component.score.name).toEqual('Tyler');
    expect(topScoreService.saveCalled).toBeTruthy();
    expect(component.topScore.length).toEqual(10);
    expect(modalRef.hideCalled).toBeTruthy();
  });

  it('should use UNKNOWN when name is empty string', () => {
    let modalRef = new MockBsModalRef();
    component.modalRef = modalRef;
    component.score = new Score(null, 1, 7000);
    component.save('');
    expect(component.score.name).toEqual('UNKNOWN');
  });

  it('should reflect showHeader input', () => {
    component.showHeader = false;
    fixture.detectChanges();
    expect(component.showHeader).toBeFalsy();

    component.showHeader = true;
    fixture.detectChanges();
    expect(component.showHeader).toBeTruthy();
  });

  it('should not open modal when score does not make top list', () => {
    component.topScore = [
      new Score('A', 10, 9000), new Score('B', 9, 8000), new Score('C', 8, 7000),
      new Score('D', 7, 6000), new Score('E', 6, 5000),
    ];
    component.openModal(new Score(null, 1, 100));
    expect(modalService.showCalled).toBeFalsy();
  });
});
