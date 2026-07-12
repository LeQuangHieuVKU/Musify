import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PageResponse } from '../models/user.models';
import { Song } from '../models/song.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SongService {
  private baseUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getAllSongs(
    page: number = 0,
    size: number = 10,
    search?: string,
    userId?: number,
  ): Observable<PageResponse<Song>> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());

    if (search?.trim()) {
      params = params.set('search', search.trim());
    }

    if (userId) {
      params = params.set('userId', userId.toString());
    }

    return this.http.get<PageResponse<Song>>(`${this.baseUrl}/getAllSongs`, { params });
  }

  getSongById(id: number): Observable<Song> {
    return this.http.get<Song>(`${this.baseUrl}/getSongById/${id}`);
  }
  addsSong(formData: FormData): Observable<Song> {
    return this.http.post<Song>(`${this.baseUrl}/addSong`, formData);
  }
}
