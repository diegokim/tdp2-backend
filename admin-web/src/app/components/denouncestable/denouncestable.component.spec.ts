import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DenouncestableComponent } from './denouncestable.component';

describe('DenouncestableComponent', () => {
  let component: DenouncestableComponent;
  let fixture: ComponentFixture<DenouncestableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DenouncestableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DenouncestableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
