import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CountryFactBoxComponent } from './country-fact-box.component';

describe('CountryFactBoxComponent', () => {
  let component: CountryFactBoxComponent;
  let fixture: ComponentFixture<CountryFactBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CountryFactBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CountryFactBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
