import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'addHtml'
})
export class AddHtmlPipe implements PipeTransform {

  constructor(private sanitizer:DomSanitizer){}

  transform(value: any, columnName:string, firstCol:string): any {
   // return "world-"+value;

  return (columnName == firstCol) ?  '<mdb-badge default="true">new</mdb-badge>' + value : value;
 // return (columnName == firstCol) ? "<mdb-badge default='true'>"+value+"</mdb-badge>" : value;
// return (columnName == firstCol) ? this.sanitizer.bypassSecurityTrustHtml("<mdb-badge default='true'>"+value+"</mdb-badge>") : value;
//return (columnName == firstCol) ? this.sanitizer.bypassSecurityTrustHtml("<h3>"+value+"</h3>") : value;
  }

}
