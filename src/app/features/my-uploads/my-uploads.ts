import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Song } from '../../core/models/song.model';
import { SongService } from '../../core/services/song-service';
import { MusicPlayerService } from '../../core/services/music-player-service';
import { MatDialog } from '@angular/material/dialog';
import { NotificationService } from '../../core/services/notification-service';
import { AuthService } from '../../core/services/auth-service';
import { EditSongDialog } from '../../shared/edit-song-dialog/edit-song-dialog';
import { ConfirmationDialog } from '../../shared/confirmation-dialog/confirmation-dialog';

@Component({
  selector: 'app-my-uploads',
  standalone: false,
  templateUrl: './my-uploads.html',
  styleUrl: './my-uploads.css',
})
export class MyUploads implements OnDestroy, OnInit {
  songs: Song[] = [];
  loading = true;
  loadingMore = false;
  errorMessage = '';

  userId!: number;
  searchQuery = '';

  currentPage = 0;
  pageSize = 1;
  totalElements = 0;
  hasMoreSongs = true;

  private _scrollTriggered!: ElementRef;
  private observer!: IntersectionObserver;

  @ViewChild('scrollTriggered') set scrollTrigger(element: ElementRef) {
    if (element) {
      this._scrollTriggered = element;
      this.setupInfiniteScroll();
    } else {
      this._scrollTriggered = null!;
    }
  }

  constructor(
    private songService: SongService,
    private musicPlayerService: MusicPlayerService,
    private authService: AuthService,
    private dialog: MatDialog,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getCurrentUser()!.id;
    this.loadMySongs();
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  setupInfiniteScroll() {
    if (this.observer) {
      this.observer.disconnect();
    }

    const options = {
      root: null,
      rootMargin: '200px',
      threshold: 0.1,
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !this.loadingMore && this.hasMoreSongs) {
          this.loadMoreSongs();
        }
      });
    }, options);

    if (this._scrollTriggered?.nativeElement) {
      this.observer.observe(this._scrollTriggered.nativeElement);
    }
  }

  loadMySongs() {
    this.loading = true;
    this.errorMessage = '';
    this.currentPage = 0;
    this.songs = [];

    this.songService
      .getAllSongs(this.currentPage, this.pageSize, this.searchQuery, this.userId)
      .subscribe({
        next: (response) => {
          this.songs = response.content;
          this.totalElements = response.totalElements;
          this.hasMoreSongs = !response.last;
          this.loading = false;
        },
        error: (error) => {
          console.log('Error loading songs:', error);
          this.errorMessage = 'Failed to load songs. Please try again later.';
          this.loading = false;
        },
      });
  }

  loadMoreSongs() {
    if (this.loadingMore || !this.hasMoreSongs) {
      return;
    }

    this.loadingMore = true;
    this.currentPage++;

    this.songService
      .getAllSongs(this.currentPage, this.pageSize, this.searchQuery, this.userId)
      .subscribe({
        next: (response) => {
          this.songs = [...this.songs, ...response.content];
          this.hasMoreSongs = !response.last;
          this.loadingMore = false;
        },
        error: (error) => {
          console.log('Error loading songs:', error);
          this.currentPage--;
          this.loadingMore = false;
        },
      });
  }

  onSearch() {
    this.loadMySongs();
  }

  clearSearch() {
    this.searchQuery = '';
    this.loadMySongs();
  }

  playSong(song: Song) {
    this.musicPlayerService.playSong(song);
  }

  openAddToPlaylistDialog(event: Event, song: Song) {
    event.stopPropagation();
    //TODO
  }

  editSong(event: Event, song: Song) {
    event.stopPropagation();

    const dialogRef = this.dialog.open(EditSongDialog, {
      width: '90vw',
      maxWidth: '1200px',
      panelClass: ['custom-dialog-container', 'edit-song-dialog'],
      data: { song },
    });

    dialogRef.afterClosed().subscribe((formData) => {
      if (!formData) {
        return;
      }
      this.songService.updateSong(song.id, formData).subscribe({
        next: (updatedSong) => {
          const index = this.songs.findIndex((s) => s.id === song.id);
          if (index !== -1) {
            this.songs[index] = updatedSong;
          }
          this.notificationService.success('Song updated successfully!');
        },
        error: (error) => {
          console.log('Error updating song:', error);
          const errorMessage =
            error?.error?.message || 'Failed to update song. Please try again later.';
          this.notificationService.error(errorMessage);
        },
      });
    });
  }

  deleteSong(event: Event, song: Song) {
    event.stopPropagation();

    const dialogRef = this.dialog.open(ConfirmationDialog, {
      width: '450px',
      maxWidth: '90vw',
      panelClass: 'custom-dialog-container',
      data: {
        title: 'Delete Song',
        message: `Are you sure you want to delete the song "${song.title}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmColor: 'warn',
      },
    });

    dialogRef.afterClosed().subscribe((confirm) => {
      if (!confirm) {
        return;
      }
      this.songService.deleteSong(song.id).subscribe({
        next: (response) => {
          this.songs = this.songs.filter((s) => s.id !== song.id);

          this.notificationService.success(response.message || 'Song deleted successfully!');
        },
        error: (error) => {
          console.log('Error updating song:', error);
          const errorMessage =
            error?.error?.message || 'Failed to delete song. Please try again later.';
          this.notificationService.error(errorMessage);
        },
      });
    });
  }
}
