import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TileContainerComponent } from './tile-container.component';

describe('TileContainerComponent', () => {
  let component: TileContainerComponent;
  let fixture: ComponentFixture<TileContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TileContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TileContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
