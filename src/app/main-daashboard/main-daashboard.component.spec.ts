import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainDaashboardComponent } from './main-daashboard.component';

describe('MainDaashboardComponent', () => {
  let component: MainDaashboardComponent;
  let fixture: ComponentFixture<MainDaashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MainDaashboardComponent]
    });
    fixture = TestBed.createComponent(MainDaashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
