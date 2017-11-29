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
  // for ControlValueAccessor interface
  propogateChange = (_: any) => {};

  // api endpoint to hit
  @Input() endpoint: string;
  // emit a new url to access the uploaded file
  @Output() uriChanged = new EventEmitter<string>();
  // emit the selected file (for use as a ChildView)
  @Output() fileChanged = new EventEmitter<any>();

  // tracks the file to upload
  protected file: any;
  // ng2-file-upload FileUploader - does actual uploading
  // ref: https://github.com/valor-software/ng2-file-upload
  protected uploader: FileUploader = new FileUploader({ url: this.endpoint });

  /**
   * Called with new changes to @Input/@Output
   * @param {SimpleChanges} changes - an object with keys named for changes to Input/Outputs
   */
  ngOnChanges(changes: SimpleChanges) {
    // The user has changed the api endpoint. Update the uploader
    if (changes['endpoint']) {
      this.uploader.setOptions({ url: this.endpoint });
    }
  }

  /**
   * For ControlValueAccessor interface
   */
  writeValue(obj: any) {
    this.file = obj;
  }

  /**
   * For ControlValueAccessor interface
   */
  registerOnChange(fn: any) {
    this.propogateChange = fn;
  }

  /**
   * For ControlValueAccessor interface
   */
  registerOnTouched(fn: any) {

  }

  /**
   * Called when the user has selected a new file
   * @param {HTMLInputElement} fileInput - the file input
   * @param {File[]} fileInput.target.files
   */
  fileChange(fileInput: any) {
    if (fileInput.target.files && fileInput.target.files[0]) {
      this.file = fileInput.target.files[0];
    } else {
      this.file = undefined;
    }
    this.propogateChange(this.file);
    this.fileChanged.emit(this.file);
  }

  /**
   * called when user wants to upload the file
   */
  uploadFile() {
    // sanity check on file existing
    if (this.uploader.queue.length > 0) {
      // register callbacks
      this.uploader.onCompleteItem = this.onCompleteItem;
      this.uploader.onErrorItem = this.onErrorItem;
      //TODO onProgressItem

      this.uploader.queue[0].upload();
    }
  }

  /**
   * called when the upload is complete - defined as an arrow function so this is the component
   * @param {} item
   * @param {} response
   * @param {number} status - the status code
   * @param {} headers
   */
  onCompleteItem = (item: any, response: any, status: number, headers:any) : void => {
    // upload succeeded
    if (status === 200) {
      // Get new url
      let userRes = JSON.parse(response);
      // tell parent component
      this.uriChanged.emit(userRes.profileImageURL);

      // Clear the uploader queue
      this.uploader.queue = [];
    }
  }

  /**
   * called if the upload fails - defined as an arrow function so this is the component
   * @param {} item
   * @param {} response
   * @param {number} status - the status code
   * @param {} headers
   */
  onErrorItem = (item: any, response: any, status: number, headers: any) : void => {
    // TODO handle
    console.log('Upload failed');
  }
}
