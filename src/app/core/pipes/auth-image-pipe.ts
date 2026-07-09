import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { AuthHttpService } from '../services/auth-http-service';

@Pipe({
  name: 'authImage',
  pure: false,
  standalone: false,
})
export class AuthImagePipe implements PipeTransform, OnDestroy {
  private cachedUrl: string | null = null;
  private cachedSafeUrl: SafeUrl | null = null;
  private blobUrl: string | null = null;
  private loading = false;

  constructor(
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private authHttpService: AuthHttpService,
  ) {}

  transform(url: string): SafeUrl | string {
    if (!url){
      return 'default-album.png'; // Return a default image if the URL is empty
    }

    if (url === this.cachedUrl && this.cachedSafeUrl) {
      return this.cachedSafeUrl;
    }

    if (url.startsWith('http') && !url.includes('/api/file')) {
      return url;
    }
    
    if (!this.loading && url == this.cachedUrl) {
      return this.cachedSafeUrl || 'default-album.png';
    }

    if (this.blobUrl){
      URL.revokeObjectURL(this.blobUrl);
      this.blobUrl = null;
    }

    this.cachedUrl = url;
    this.loading = true;
    
    this.authHttpService.fetchBlob(url).then(blob => {
      this.blobUrl = URL.createObjectURL(blob);
      this.cachedSafeUrl = this.sanitizer.bypassSecurityTrustUrl(this.blobUrl);
      this.loading = false;
      this.cdr.markForCheck();
    }).catch(() => {
      this.loading = false;
    })

    return this.cachedSafeUrl || 'default-album.png';
  }

  ngOnDestroy(): void {
    if (this.blobUrl) {
      URL.revokeObjectURL(this.blobUrl);
      this.blobUrl = null;
    }
  }
}
