import { Component, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { ImageFileUploadComponent } from './image-file-upload.component';
import { FileUploadDropComponent } from './file-upload-drop.component';

@Component({
  selector: 'image-file-drop',
  templateUrl: './../views/image-file-drop.view.html'
})
export class ImageFileDropComponent extends ImageFileUploadComponent {
  // child component that actually does the uploading
  @ViewChild(FileUploadDropComponent) private fileUploadDropComponent: FileUploadDropComponent;

  constructor(
    sanitizer: DomSanitizer
  ) {
    super(sanitizer);
  }

  /**
   * bubble down the event
   */
  uploadFile() {
    this.fileUploadDropComponent.uploadFile();
  }
}
