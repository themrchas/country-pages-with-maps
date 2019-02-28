import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableItemDialogComponent } from './table-item-dialog.component';

describe('TableItemDialogComponent', () => {
  let component: TableItemDialogComponent;
  let fixture: ComponentFixture<TableItemDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableItemDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableItemDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
