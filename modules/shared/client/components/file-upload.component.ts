import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { FileUploader } from 'ng2-file-upload';

@Component({
  selector: 'file-upload',
  templateUrl: './../views/file-upload.view.html'
})
export class FileUploadComponent implements OnInit {
  @Input() endpoint: string;
  @Output() uriChanged = new EventEmitter<string>();

  private file: any;
  uploader: FileUploader = new FileUploader({ url: this.endpoint });

  constructor(
  ) {

  }

  /**
   * Implementation of OnInit interface
   */
  ngOnInit() {

  }

  fileChange(fileInput: any) {
    if (fileInput.target.files && fileInput.target.files[0]) {
      this.file = fileInput.target.files[0];
    } else {
      this.file = undefined;
    }
  }

  uploadFile() {
    console.log(this.uploader.queue);
  }
}
