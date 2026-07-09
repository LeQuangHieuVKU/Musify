import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, Subject } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PageResponse } from '../models/user.models';
import { Playlist } from '../models/playlist.model';

@Injectable({
  providedIn: 'root',
})
export class PlaylistService {
  private baseUrl = `${environment.apiUrl}/playlists`;
  private playlistUpdateSubject = new Subject<void>();

  playlistUpdated$ = this.playlistUpdateSubject.asObservable();

  constructor(private http: HttpClient) {

  }

  getMyPlaylists(page:number = 0,size:number = 10, search?: string) :Observable<PageResponse<Playlist>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', 'id,desc');

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<PageResponse<Playlist>>(`${this.baseUrl}/getMyPlaylists`, { params });
  }
}
