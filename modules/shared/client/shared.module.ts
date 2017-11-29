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
import { SpinnerChasingDotsComponent } from './components/spinner.chasing-dots.component';
import { SpinnerCircleComponent } from './components/spinner.circle.component';
import { SpinnerCubeGridComponent } from './components/spinner.cube-grid.component';
import { SpinnerDoubleBounceComponent } from './components/spinner.double-bounce.component';
import { SpinnerFadingCircleComponent } from './components/spinner.fading-circle.component';
import { SpinnerFoldingCubeComponent } from './components/spinner.folding-cube.component';
import { SpinnerPulseComponent } from './components/spinner.pulse.component';
import { SpinnerRotatingPlaneComponent } from './components/spinner.rotating-plane.component';
import { SpinnerThreeBounceComponent } from './components/spinner.three-bounce.component';
import { SpinnerWanderingCubesComponent } from './components/spinner.wandering-cubes.component';
import { SpinnerWaveComponent } from './components/spinner.wave.component';

// Logger
import { LoggerService } from './services/logger.service';

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
    SpinnerComponent,
    SpinnerChasingDotsComponent,
    SpinnerCircleComponent,
    SpinnerCubeGridComponent,
    SpinnerDoubleBounceComponent,
    SpinnerFadingCircleComponent,
    SpinnerFoldingCubeComponent,
    SpinnerPulseComponent,
    SpinnerRotatingPlaneComponent,
    SpinnerThreeBounceComponent,
    SpinnerWanderingCubesComponent,
    SpinnerWaveComponent
  ],
  exports: [
    ImageFileSelectComponent,
    ImageFileDropComponent,
    FileUploadComponent,
    SpinnerComponent,
    SpinnerChasingDotsComponent,
    SpinnerCircleComponent,
    SpinnerCubeGridComponent,
    SpinnerDoubleBounceComponent,
    SpinnerFadingCircleComponent,
    SpinnerFoldingCubeComponent,
    SpinnerPulseComponent,
    SpinnerRotatingPlaneComponent,
    SpinnerThreeBounceComponent,
    SpinnerWanderingCubesComponent,
    SpinnerWaveComponent
  ],
  providers: [
    LoggerService
  ]
})
export class SharedModule {}
