// Baseado em: https://angular.dev/guide/components
import { Component, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarLayoutComponent } from '../shared/layout/sidebar-layout.component';

@Component({
  selector: 'app-tutorial',
  standalone: true,
  imports: [CommonModule, SidebarLayoutComponent],
  templateUrl: './tutorial.component.html',
  styleUrl: './tutorial.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TutorialComponent {
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;

  seekToTime(seconds: number): void {
    if (this.videoPlayer?.nativeElement) {
      this.videoPlayer.nativeElement.currentTime = seconds;
      this.videoPlayer.nativeElement.play();
    }
  }
}
