import { Component, Input } from '@angular/core';

@Component({
  selector: 'file-preview',
  templateUrl: './../views/file-preview.view.html'
})
export class FilePreviewComponent {
  @Input() src: string;
  @Input() alt: string;
}
