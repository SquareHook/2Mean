import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FileSelectDirective, FileDropDirective } from 'ng2-file-upload';

import { FileUploadComponent } from './components/file-upload.component';
import { ImageFileUploadComponent } from './components/image-file-upload.component';
import { FilePreviewComponent } from './components/file-preview.component';
import { FileUploadDropComponent } from './components/file-upload-drop.component';
import { ImageFileDropComponent } from './components/image-file-drop.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    FileSelectDirective,
    FileDropDirective,
    FileUploadComponent,
    FilePreviewComponent,
    ImageFileUploadComponent,
    FileUploadDropComponent,
    ImageFileDropComponent
  ],
  exports: [
    ImageFileUploadComponent,
    ImageFileDropComponent
  ]
})
export class SharedModule {}
