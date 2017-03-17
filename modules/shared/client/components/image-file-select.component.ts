import { Component, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { ImageFileUploadComponent } from './image-file-upload.component';
import { FileUploadComponent } from './file-upload.component';

@Component({
  selector: 'image-file-select',
  templateUrl: './../views/image-file-select.view.html'
})
export class ImageFileSelectComponent extends ImageFileUploadComponent {
  // child component that actually does the uploading
  @ViewChild(FileUploadComponent) private fileUploadComponent: FileUploadComponent;

  constructor(
    sanitizer: DomSanitizer
  ) {
    super(sanitizer);
  }

  /**
   * bubble down the event
   */
  uploadFile() {
    this.fileUploadComponent.uploadFile();
  }
}
