import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, Subject, tap } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MessageResponse, PageResponse } from '../models/user.models';
import { Playlist } from '../models/playlist.model';

@Injectable({
  providedIn: 'root',
})
export class PlaylistService {
  private baseUrl = `${environment.apiUrl}/playlists`;
  private playlistUpdatedSubject = new Subject<void>();

  playlistUpdated$ = this.playlistUpdatedSubject.asObservable();

  constructor(private http: HttpClient) {}

  getMyPlaylists(
    page: number = 0,
    size: number = 10,
    search?: string,
  ): Observable<PageResponse<Playlist>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', 'id,desc');

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<PageResponse<Playlist>>(`${this.baseUrl}/getMyPlaylists`, { params });
  }

  createPlaylist(
    name: string,
    description: string | null,
    isPublic: boolean,
    imageFile: File | null,
  ): Observable<Playlist> {
    let params = new HttpParams().set('name', name).set('isPublic', isPublic.toString());

    if (description) {
      params = params.set('description', description);
    }

    const formData = new FormData();
    if (imageFile) {
      formData.append('imageFile', imageFile);
    }

    return this.http
      .post<Playlist>(`${this.baseUrl}/createPlaylist`, formData, { params })
      .pipe(tap(() => this.playlistUpdatedSubject.next()));
  }

  addSongToPlaylist(playlistId: number, songId: number): Observable<MessageResponse> {
    const params = new HttpParams().set('songId', songId.toString());
    return this.http.post<MessageResponse>(
      `${this.baseUrl}/addSongToPlaylist/${playlistId}`,
      null,
      { params },
    );
  }
}
