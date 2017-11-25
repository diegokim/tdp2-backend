import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsAddAdvertisingComponent } from './settings-add-advertising.component';

describe('SettingsAddAdvertisingComponent', () => {
  let component: SettingsAddAdvertisingComponent;
  let fixture: ComponentFixture<SettingsAddAdvertisingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SettingsAddAdvertisingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsAddAdvertisingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
