import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { FileUploadService } from './services/file-upload.service';
import { FileUploadComponent } from './components/file-upload.component';

@NgModule({
  declarations: [
    FileUploadComponent
  ],
  exports: [
    FileUploadComponent
  ],
  providers: [
    FileUploadService
  ]
})
export class SharedModule {}
