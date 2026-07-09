import { Injectable } from '@angular/core';
import { AuthService } from './auth-service';

@Injectable({
  providedIn: 'root',
})
export class AuthHttpService {
  constructor(private authService: AuthService) {}

  fetchBlob(url: string): Promise<Blob> {
    return this.makeRequest(url, false);
  }

  private makeRequest(url: string, isRetry: boolean): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'blob';
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      xhr.setRequestHeader('Cache-Control', 'no-cache');

      const token = this.authService.getAccessToken();

      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve(xhr.response);
        } else if ((xhr.status === 401 || xhr.status == 403) && !isRetry) {
          this.authService
            .refreshAccessTokenAsync()
            .then(() => this.makeRequest(url, true))
            .then(resolve)
            .catch(reject);
        } else {
          reject(new Error(`Request failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error'));
      }

      xhr.send();
    });
  }
}
