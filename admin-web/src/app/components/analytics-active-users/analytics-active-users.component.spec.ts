import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyticsActiveUsersComponent } from './analytics-active-users.component';

describe('AnalyticsActiveUsersComponent', () => {
  let component: AnalyticsActiveUsersComponent;
  let fixture: ComponentFixture<AnalyticsActiveUsersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnalyticsActiveUsersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnalyticsActiveUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
