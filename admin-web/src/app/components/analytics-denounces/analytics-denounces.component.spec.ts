import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyticsDenouncesComponent } from './analytics-denounces.component';

describe('AnalyticsDenouncesComponent', () => {
  let component: AnalyticsDenouncesComponent;
  let fixture: ComponentFixture<AnalyticsDenouncesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnalyticsDenouncesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnalyticsDenouncesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
