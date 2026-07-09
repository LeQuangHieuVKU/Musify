import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Playlist } from '../../core/models/playlist.model';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth-service';
import { PlaylistService } from '../../core/services/playlist-service';
import { MusicPlayerService } from '../../core/services/music-player-service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-layout',
  standalone: false,
  templateUrl: './layout.html',
  styleUrl: './layout.css',
  animations: [
    trigger('expandCollapse', [
      state('collapsed', style({ height: '0px', opacity: 0, overflow: 'hidden' })),
      state('expanded', style({ height: '*', opacity: 1, overflow: 'visible' })),
      transition('collapsed <=> expanded', [animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)')]),
    ]),
  ],
})
export class Layout implements OnInit, OnDestroy {
  userName = 'User';
  private _playlists: Playlist[] = [];
  isAdmin = false;
  isUserMenuExpanded = false;

  playlistSearchQuery = '';

  currentPage = 0;
  pageSize = 10;
  hasMorePlaylists = true;
  loadingMorePlaylists = false;

  get playlists(): Playlist[] {
    return Array.isArray(this.playlists) ? this.playlists : [];
  }

  set playlists(value: Playlist[]) {
    this._playlists = Array.isArray(value) ? value : [];
  }

  private _scrollTriggeredPlaylists!: ElementRef;
  private playlistObserver!: IntersectionObserver;

  @ViewChild('scrollTriggeredPlaylists') set scrollTriggeredPlaylists(element: ElementRef) {
    if (element) {
      this._scrollTriggeredPlaylists = element;
    } else {
      this._scrollTriggeredPlaylists = null!;
    }
  }

  constructor(
    private router: Router,
    private location: Location,
    private authService: AuthService,
    private playlistService: PlaylistService,
    private musicPlayerService: MusicPlayerService,
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.userName = user.name;
        this.isAdmin = user.role === 'ADMIN';
      }
    });

    this.loadPlaylists();
    this.playlistService.playlistUpdated$.subscribe(() => {
      this.loadPlaylists();
    });
  }

  ngOnDestroy(): void {
    if (this.playlistObserver) {
      this.playlistObserver.disconnect();
    }
  }

  setupPlaylistInfiniteScroll() {
    if (this.playlistObserver) {
      this.playlistObserver.disconnect();
    }

    const options = {
      root: null,
      rootMargin: '100px',
      threshold: 0.1,
    };

    this.playlistObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !this.loadingMorePlaylists && this.hasMorePlaylists) {
          this.loadMoreplaylists();
        }
      });
    }, options);

    if (this._scrollTriggeredPlaylists?.nativeElement) {
      this.playlistObserver.observe(this._scrollTriggeredPlaylists.nativeElement);
    }
  }

  loadPlaylists() {
    this.currentPage = 0;
    this.playlists = [];
    this.loadingMorePlaylists = true;

    this.playlistService
      .getMyPlaylists(this.currentPage, this.pageSize, this.playlistSearchQuery)
      .subscribe({
        next: (response) => {
          this.playlists = response.content;
          this.hasMorePlaylists = !response.last;
          this.loadingMorePlaylists = false;
        },
        error: () => {
          this.playlists = [];
          this.loadingMorePlaylists = false;
        },
      });
  }

  loadMoreplaylists() {
    if (this.loadingMorePlaylists || !this.hasMorePlaylists) {
      return;
    }
    this.loadingMorePlaylists = true;
    this.currentPage++;
    this.playlistService
      .getMyPlaylists(this.currentPage, this.pageSize, this.playlistSearchQuery)
      .subscribe({
        next: (response) => {
          this.playlists = [...this.playlists, ...response.content];
          this.hasMorePlaylists = !response.last;
          this.loadingMorePlaylists = false;
        },
        error: () => {
          this.loadingMorePlaylists = false;
          this.currentPage--;
        },
      });
  }

  onSearchPlaylists() {
    this.loadPlaylists();
  }

  clearPlaylistSearch() {
    this.playlistSearchQuery = '';
    this.loadPlaylists();
  }

  goBack() {
    this.location.back();
  }

  goForward() {
    this.location.forward();
  }

  toggleUserMenu() {
    this.isUserMenuExpanded = !this.isUserMenuExpanded;
  }

  logout() {
    this.musicPlayerService.stop();
    this.authService.logout();
  }
}
