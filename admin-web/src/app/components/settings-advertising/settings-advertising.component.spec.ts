import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsAdvertisingComponent } from './settings-advertising.component';

describe('SettingsAdvertisingComponent', () => {
  let component: SettingsAdvertisingComponent;
  let fixture: ComponentFixture<SettingsAdvertisingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SettingsAdvertisingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsAdvertisingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
