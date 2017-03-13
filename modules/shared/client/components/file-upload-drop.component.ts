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
  selector: 'file-upload-drop',
  templateUrl: './../views/file-upload-drop.view.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileUploadDropComponent),
      multi: true
    }
  ]
})
export class FileUploadDropComponent implements ControlValueAccessor, OnChanges {
  propogateChange = (_: any) => {};

  @Input() endpoint: string;
  @Output() uriChanged = new EventEmitter<string>();
  @Output() fileChanged = new EventEmitter<any>();

  private file: any;
  uploader: FileUploader = new FileUploader({ url: this.endpoint });

  private lastState: boolean = false;

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

  fileOver(e: any) {
    if (e === false && this.lastState) {
      // check for a new file
      if (this.uploader.queue.length) {
        this.file = this.uploader.queue[this.uploader.queue.length-1].some;
      } else {
        this.file = undefined;
      }

      this.propogateChange(this.file);
      this.fileChanged.emit(this.file);
    }

    this.lastState = e;
  }
}
