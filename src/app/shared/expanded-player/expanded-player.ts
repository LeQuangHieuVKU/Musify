import { animate, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MusicPlayer } from '../music-player/music-player';
import { AiSongData, Song } from '../../core/models/song.model';
import { SongService } from '../../core/services/song-service';
import { MusicPlayerService } from '../../core/services/music-player-service';

@Component({
  selector: 'app-expanded-player',
  standalone: false,
  templateUrl: './expanded-player.html',
  styleUrl: './expanded-player.css',
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ],
})
export class ExpandedPlayer extends MusicPlayer implements OnInit, OnDestroy {
  @ViewChild('expandedPlayerContainer') expandedPlayerContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('aiPanel') aiPanel!: ElementRef<HTMLDivElement>;

  queue: Song[] = [];
  currentIndex = 0;
  isExpanded = false;

  showAiPanel = false;
  isAiPanelActive = false;
  aiPanelTop = 0;
  aiSongData: AiSongData | null = null;
  aiError: string | null = null;
  currentLoadingStep = 0;
  showFlyingParticles = false;
  loadingAiData = false;

  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private animationFrameId: number | null = null;
  audioLevel = 0;

  constructor(
    musicPlayerSerice: MusicPlayerService,
    private songService: SongService,
  ) {
    super(musicPlayerSerice);
  }

  override ngOnInit(): void {
    super.ngOnInit();

    this.subscriptions.push(
      this.musicPlayerService.isPlaying$.subscribe((playing) => {
        if (playing) {
          this.startAudioVisualization();
        } else {
          this.stopAudioVisualization();
        }
      }),
    );

    this.subscriptions.push(
      this.musicPlayerService.queue$.subscribe((queue) => {
        this.queue = queue;
      }),
      this.musicPlayerService.currentIndex$.subscribe((index) => {
        this.currentIndex = index;
      }),
      this.musicPlayerService.isExpanded$.subscribe((expanded) => {
        this.isExpanded = expanded;
      }),
    );
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.stopAudioVisualization();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }

  collapse() {
    this.musicPlayerService.toggleExpand();
  }

  playFromQueue(index: number): void {
    this.musicPlayerService.setQueue(this.queue, index);
  }

  toggleAiPanel(): void {
    if (!this.showAiPanel) {
      if (this.expandedPlayerContainer?.nativeElement) {
        this.aiPanelTop = this.expandedPlayerContainer.nativeElement.scrollTop;
      }
      this.showAiPanel = true;
      this.showFlyingParticles = true;

      setTimeout(() => {
        this.showAiPanel = true;
        if (this.currentSong) {
          this.loadAiInsights();
        }
      }, 400);

      setTimeout(() => {
        this.showFlyingParticles = false;
      }, 300);
    } else {
      this.showAiPanel = false;
      this.isAiPanelActive = false;
    }
  }

  loadAiInsights() {
    if (!this.currentSong) {
      return;
    }
    this.loadingAiData = true;
    this.aiError = null;
    this.aiSongData = null;
    this.currentLoadingStep = 0;

    setTimeout(() => {
      this.currentLoadingStep = 1;
    }, 2000);

    setTimeout(() => {
      this.currentLoadingStep = 2;
    }, 4000);

    setTimeout(() => {
      this.songService.getSongAiInsights(this.currentSong!.id).subscribe({
        next: (data) => {
          this.aiSongData = data;
          this.loadingAiData = false;
          this.currentLoadingStep = 0;
        },
        error: (error) => {
          console.error('Error loading AI insights:', error);
          this.aiError = 'Failed to load AI insights. Please try again later.';
          this.loadingAiData = false;
          this.currentLoadingStep = 0;
        },
      });
    }, 6000);
  }

  private startAudioVisualization() {
    try {
      const audioElement = (this.musicPlayerService as any).audio;

      if (!audioElement) {
        console.warn('Audio element not found for visualization.');
        return;
      }

      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;

        const source = this.audioContext.createMediaElementSource(audioElement);
        source.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);

        const bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(bufferLength);
      }
      this.visualize();
    } catch (error) {
      console.error('Error starting audio visualization:', error);
    }
  }

  stopAudioVisualization() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.audioLevel = 0;
  }

  private visualize() {
    if (!this.analyser || !this.dataArray) {
      return;
    }

    this.animationFrameId = requestAnimationFrame(() => this.visualize());

    this.analyser.getByteFrequencyData(this.dataArray);

    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
    }
    const average = sum / this.dataArray.length;
    this.audioLevel = average / 255;

    document.documentElement.style.setProperty('--audio-level', this.audioLevel.toString());
  }
}
