import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PromotedLinksComponent } from './promoted-links.component';

describe('PromotedLinksComponent', () => {
  let component: PromotedLinksComponent;
  let fixture: ComponentFixture<PromotedLinksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PromotedLinksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PromotedLinksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
