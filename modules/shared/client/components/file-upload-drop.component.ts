import { Component } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';

import { FileUploadComponent } from './file-upload.component';

@Component({
  selector: 'file-upload-drop',
  templateUrl: './../views/file-upload-drop.view.html',
  styles: [
    require('../styles/file-upload-drop.css')
  ]
})
export class FileUploadDropComponent extends FileUploadComponent {
  // last state -> true for file over uploader, false otherwise
  private lastState: boolean = false;

  /**
   * called when a file is over the uploader or has left the uploader
   * @param {boolean} e - true if the file is over, false if it is leaving
   */
  fileOver(e: any) {
    // file is no longer over, but was recently
    if (e === false && this.lastState) {
      // check for a new file
      if (this.uploader.queue.length) {
        // FileItem.some is actually protected. It is also the only
        // way to directly get the File. Luckily javascript does not care
        // TS does
        // TODO suppress TS error or find other way to access the File
        this.file = this.uploader.queue[this.uploader.queue.length-1]._file;
      } else {
        this.file = undefined;
      }

      // tell parent and possibly form
      this.propogateChange(this.file);
      this.fileChanged.emit(this.file);
    }

    this.lastState = e;
  }
}
