import { Component, OnDestroy, OnInit } from '@angular/core';
import { Song } from '../../core/models/song.model';
import { MusicPlayerService, RepeatMode } from '../../core/services/music-player-service';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-music-player',
  standalone: false,
  templateUrl: './music-player.html',
  styleUrl: './music-player.css',
})
export class MusicPlayer implements OnInit, OnDestroy {
  currentSong: Song | null = null;
  isPlaying = false;
  currentTime = 0;
  duration = 0;
  volume = 1;
  isMuted = false;
  previousVolume = 1;
  hasNext = false;
  hasPrevious = false;
  isShuffle = false;
  repeatMode: RepeatMode = 'off';

  protected subscriptions: Subscription[] = [];

  constructor(protected musicPlayerService: MusicPlayerService) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.musicPlayerService.currentSong$.subscribe((song) => {
        this.currentSong = song;
      }),
      this.musicPlayerService.isPlaying$.subscribe((playing) => {
        this.isPlaying = playing;
      }),
      this.musicPlayerService.currentTime$.subscribe((time) => {
        this.currentTime = time;
      }),
      this.musicPlayerService.duration$.subscribe((duration) => {
        this.duration = duration;
      }),
      this.musicPlayerService.volume$.subscribe((volume) => {
        this.volume = volume;
      }),
      this.musicPlayerService.queue$.subscribe(() => {
        this.updateNavigationState();
      }),
      this.musicPlayerService.currentIndex$.subscribe(() => {
        this.updateNavigationState();
      }),
      this.musicPlayerService.isShuffle$.subscribe((shuffle) => {
        this.isShuffle = shuffle;
      }),
      this.musicPlayerService.repeatMode$.subscribe((mode) => {
        this.repeatMode = mode;
        this.updateNavigationState();
      }),
    );
  }

  private updateNavigationState(): void {
    this.hasNext = this.musicPlayerService.hasNext();
    this.hasPrevious = this.musicPlayerService.hasPrevious();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  togglePlayPause(): void {
    this.musicPlayerService.togglePlayPause();
  }

  skipNext(): void {
    this.musicPlayerService.playNext();
  }

  skipPrevious(): void {
    this.musicPlayerService.playPrevious();
  }

  playNext(): void {
    this.musicPlayerService.playNext();
  }

  playPrevious(): void {
    this.musicPlayerService.playPrevious();
  }

  onSeek(event: any): void {
    const time = parseFloat(event.target.value);
    this.musicPlayerService.seekTo(time);
  }

  onProgressClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (target.tagName.toLowerCase() === 'input') {
      return;
    }

    const progressBar = event.currentTarget as HTMLElement;
    const rect = progressBar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const width = rect.width;
    const percentage = clickX / width;
    const time = percentage * this.duration;

    if (time >= 0 && time <= this.duration) {
      this.musicPlayerService.seekTo(time);
    }
  }

  onVolumeChange(event: any): void {
    const volume = parseFloat(event.target.value);
    this.musicPlayerService.setVolume(volume);

    if (volume === 0) {
      this.isMuted = true;
    } else {
      this.isMuted = false;
      this.previousVolume = volume;
    }
  }

  onVolumeClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (target.tagName.toLowerCase() === 'input') {
      return;
    }

    const volumeBar = event.currentTarget as HTMLElement;
    const rect = volumeBar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const width = rect.width;
    const percentage = clickX / width;
    const volume = Math.max(0, Math.min(1, percentage));

    this.musicPlayerService.setVolume(volume);

    if (volume === 0) {
      this.isMuted = true;
    } else {
      this.isMuted = false;
      this.previousVolume = volume;
    }
  }

  toggleMute(): void {
    if (this.isMuted) {
      const volumeToRestore = this.previousVolume > 0 ? this.previousVolume : 1;
      this.musicPlayerService.setVolume(volumeToRestore);
      this.isMuted = false;
    } else {
      this.previousVolume = this.volume;
      this.musicPlayerService.setVolume(0);
      this.isMuted = true;
    }
  }

  toggleShuffle(): void {
    this.musicPlayerService.toggleShuffle();
  }

  toggleRepeat(): void {
    this.musicPlayerService.toggleRepeat();
  }

  getRepeatIcon(): string {
    if (this.repeatMode === 'one') {
      return 'repeat_one';
    }
    return 'repeat';
  }

  expandPlayer(): void {
    if (this.currentSong) {
      this.musicPlayerService.toggleExpand();
    }
  }

  formatTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) {
      return '0:00';
    }

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  get progress(): number {
    if (!this.duration) return 0;
    return (this.currentTime / this.duration) * 100;
  }

  get volumePercentage(): number {
    return this.volume * 100;
  }

  onProgressChange (event: any): void {
    const input = event.target as HTMLInputElement;
    const time = parseFloat(input.value);
    this.musicPlayerService.seekTo(time);
  }

  getImageUrl(imageUrl: string): string {
    if(!imageUrl) {
      return 'default-album.jpg';
    }
    if (!imageUrl.startsWith('http')) {
      return imageUrl;
    }
  return `${environment.apiUrl}/file/image/${imageUrl}`;
  }
}
