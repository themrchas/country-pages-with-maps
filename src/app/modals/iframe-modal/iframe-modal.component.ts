import { Component, OnInit } from '@angular/core';
import { MDBModalRef} from 'angular-bootstrap-md';
import { BehaviorSubject } from 'rxjs';
import { Country } from '../../model/country';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-iframe-modal',
  templateUrl: './iframe-modal.component.html',
  styleUrls: ['./iframe-modal.component.scss']
})
export class IframeModalComponent implements OnInit {
  modalTitle: string;
  settings: any;
  country: BehaviorSubject<Country>;
  url: SafeResourceUrl;
  constructor(public modalRef: MDBModalRef, public sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl(this.settings.url);
  }

}
