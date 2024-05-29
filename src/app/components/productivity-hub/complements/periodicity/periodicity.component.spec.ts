import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodicityComponent } from './periodicity.component';

describe('PeriodicityComponent', () => {
  let component: PeriodicityComponent;
  let fixture: ComponentFixture<PeriodicityComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PeriodicityComponent]
    });
    fixture = TestBed.createComponent(PeriodicityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
