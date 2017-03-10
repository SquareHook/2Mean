import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';

@Component({
  selector: 'file-upload',
  templateUrl: './../views/file-upload.view.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileUploadComponent),
      multi: true
    }
  ]
})
export class FileUploadComponent implements ControlValueAccessor, OnChanges {
  propogateChange = (_: any) => {};

  @Input() endpoint: string;
  @Output() uriChanged = new EventEmitter<string>();
  @Output() fileChanged = new EventEmitter<any>();

  private file: any;
  uploader: FileUploader = new FileUploader({ url: this.endpoint });

  ngOnChanges(changes: SimpleChanges) {
    if (changes['endpoint']) {
      this.uploader.setOptions({ url: this.endpoint });
    }
  }

  writeValue(obj: any) {
    this.file = obj;
  }

  registerOnChange(fn: any) {
    this.propogateChange = fn;
  }

  registerOnTouched(fn: any) {

  }

  fileChange(fileInput: any) {
    if (fileInput.target.files && fileInput.target.files[0]) {
      this.file = fileInput.target.files[0];
    } else {
      this.file = undefined;
    }
    this.propogateChange(this.file);
    this.fileChanged.emit(this.file);
  }

  uploadFile() {
    if (this.uploader.queue.length > 0) {
      this.uploader.onCompleteItem = (item: any, response: string, status: number, headers: any) => {
        if (status === 200) {
          // Get new url
          let userRes = JSON.parse(response);
          this.uriChanged.emit(userRes.profileImageURL);

          // Clear the uploader queue
          this.uploader.queue = [];
        }
      };

      this.uploader.onErrorItem = this.onErrorItem;

      this.uploader.queue[0].upload();
    }
  }

  onErrorItem(item: any, response: any, status: number, headers: any) : void {

  }
}
