import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-table-item-dialog',
  templateUrl: './table-item-dialog.component.html',
  styleUrls: ['./table-item-dialog.component.css']
})
export class TableItemDialogComponent implements OnInit {

  modalData: any;

  closeTheModal() {
    console.log('you clikced the close button');
    this.dialogRef.close('Dialog has been closed in dialog component');
  }

  constructor(private dialogRef: MatDialogRef<TableItemDialogComponent>,
              @Inject(MAT_DIALOG_DATA) data) { 

                this.modalData = data;

                console.log('data passed to modal is', this.modalData);
              }

 // onNoClick() : void {
   close() {
     console.log('dialog is closing');
this.dialogRef.close('Dialog has been closed');
}
  ngOnInit() {


  }

}
