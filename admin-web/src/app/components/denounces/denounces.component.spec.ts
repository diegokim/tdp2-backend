import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DenouncesComponent } from './denounces.component';

describe('DenouncesComponent', () => {
  let component: DenouncesComponent;
  let fixture: ComponentFixture<DenouncesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DenouncesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DenouncesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
