import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MDBModalRef} from 'angular-bootstrap-md';
import { BehaviorSubject } from 'rxjs';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { ConfigProvider } from 'src/app/providers/configProvider';
import { Location } from '@angular/common';

@Component({
  selector: 'app-iframe-modal',
  templateUrl: './iframe-modal.component.html',
  styleUrls: ['./iframe-modal.component.scss']
})
export class IframeModalComponent implements OnInit, AfterViewInit {
  @ViewChild('iframe') iframe: any;

  // Inputs
  modalTitle: string;
  settings: any;

  previewUrl: SafeResourceUrl;
  fullScreenUrl$: string;
  itemUrl$: string;
  downloadUrl$: string;
  fileType: string;
  iframeLoaded: boolean;
  noPreview: boolean;
  isSpModal: boolean;

  constructor(public modalRef: MDBModalRef, public sanitizer: DomSanitizer, public location: Location) { }

  ngOnInit() {
    this.noPreview = this.settings.fileType &&
      !ConfigProvider.settings.docPreviewSupportedTypes.includes(this.settings.fileType.toUpperCase());
    this.iframeLoaded = this.noPreview;
    this.isSpModal = this.settings.itemUrl$ ? false : true;
    this.settings.previewUrl$.subscribe(x => {
      this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(x);
    });
    this.fullScreenUrl$ = this.settings.fullScreenUrl$;
    this.downloadUrl$ = this.settings.downloadUrl$;
    this.itemUrl$ = this.settings.itemUrl$;
  }

  ngAfterViewInit() {
    if (!this.noPreview) {
      this.iframe.nativeElement.addEventListener('load', this.onLoad.bind(this));
    }
  }

  onLoad(e) {
    // If the iframe loaded the SP display form, want to hide the edit ribbon and the Close button
    if (this.isSpModal) {
      const iframeDoc = e.currentTarget.contentWindow.document;
      let cssUrl = this.location.prepareExternalUrl('assets/sp-iframe.css');
      cssUrl = cssUrl.replace('/index.aspx', '');

      const cssLink = document.createElement('link');
      cssLink.href = cssUrl;
      cssLink.rel = 'stylesheet';
      cssLink.type = 'text/css';

      iframeDoc.head.appendChild(cssLink);
    }
    this.iframeLoaded = true;
  }

}
