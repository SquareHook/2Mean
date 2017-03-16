import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { FileUploadComponent } from './file-upload.component';

@Component({
  template: ''
})
export class ImageFileUploadComponent {
  @Input() endpoint: string;
  @Output() uriChanged = new EventEmitter<string>();

  // Preview image source
  src: string | SafeUrl;
  // Alt text
  alt: string;
  // file shared between the upload and preview
  file: any;

  constructor(
    private sanitizer: DomSanitizer
  ) {
    this.alt = 'Select an image';
  }

  /**
   * Bubble up the new uri
   * @param {string} uri - uri sent by child component
   */
  uriChange(uri: string) {
    this.uriChanged.emit(uri);
  }

  /**
   * Update the preview
   * @param {File} file - file sent by the child component
   */
  fileChange(file: any) {
    if (file) {
      // Use the sanitizer to make angular display the blob
      this.src = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file));
    } else {
      this.src = undefined;
    }
  }

  /**
   * bubble down the event
   * let children implement this
   */
  uploadFile() {

  }
}
