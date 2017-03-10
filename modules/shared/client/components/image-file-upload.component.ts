import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { FileUploadComponent } from './file-upload.component';

@Component({
  selector: 'image-file-upload',
  templateUrl: './../views/image-file-upload.view.html'
})
export class ImageFileUploadComponent {
  @ViewChild(FileUploadComponent) private fileUploadComponent: FileUploadComponent;

  @Input() endpoint: string;
  @Output() uriChanged = new EventEmitter<string>();

  // Preview image source
  src: string | SafeUrl;
  // Alt text
  alt: string;
  file: any;

  constructor(
    private sanitizer: DomSanitizer
  ) {
    this.alt = 'Select an image';
  }

  /**
   * uriChange
   * @param {string} uri - uri sent by child component
   * Bubble up the new uri
   */
  uriChange(uri: string) {
    this.uriChanged.emit(uri);
  }

  /**
   * fileChange
   * @param {File} file - file sent by the child component
   * Update the preview
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
   * uploadFile
   * bubble down the event
   */
  uploadFile() {
    this.fileUploadComponent.uploadFile();
  }
}
