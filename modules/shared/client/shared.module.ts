import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FileSelectDirective, FileDropDirective } from 'ng2-file-upload';

// Standalone
import { FileUploadComponent } from './components/file-upload.component';
import { FilePreviewComponent } from './components/file-preview.component';
import { FileUploadDropComponent } from './components/file-upload-drop.component';

// Composite
import { ImageFileUploadComponent } from './components/image-file-upload.component';
import { ImageFileDropComponent } from './components/image-file-drop.component';
import { ImageFileSelectComponent } from './components/image-file-select.component';

// Spinner
import { SpinnerComponent } from './components/spinner.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    FileSelectDirective,
    FileDropDirective,
    FileUploadComponent,
    FilePreviewComponent,
    FileUploadDropComponent,
    ImageFileUploadComponent,
    ImageFileDropComponent,
    ImageFileSelectComponent,
    SpinnerComponent
  ],
  exports: [
    ImageFileSelectComponent,
    ImageFileDropComponent,
    SpinnerComponent
  ]
})
export class SharedModule {}
