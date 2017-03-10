import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FileSelectDirective } from 'ng2-file-upload';

import { FileUploadComponent } from './components/file-upload.component';
import { ImageFileUploadComponent } from './components/image-file-upload.component';
import { FilePreviewComponent } from './components/file-preview.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    FileSelectDirective,
    FileUploadComponent,
    FilePreviewComponent,
    ImageFileUploadComponent
  ],
  exports: [
    FileUploadComponent,
    ImageFileUploadComponent
  ]
})
export class SharedModule {}
