import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PlaylistService } from '../../core/services/playlist-service';
import { Router } from '@angular/router';
import { NotificationService } from '../../core/services/notification-service';

@Component({
  selector: 'app-create-playlist',
  standalone: false,
  templateUrl: './create-playlist.html',
  styleUrl: './create-playlist.css',
})
export class CreatePlaylist implements OnDestroy {
  playlistForm: FormGroup;
  uploading = false;
  imageFileError = '';
  imageFile: File | null = null;
  imagePreviewUrl: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private playlistService: PlaylistService,
    private router: Router,
    private notificationService: NotificationService,
  ) {
    this.playlistForm = this.formBuilder.group({
      name: ['', Validators.required, Validators.minLength(2), Validators.maxLength(100)],
      description: ['', Validators.required, Validators.minLength(10), Validators.maxLength(500)],
      isPublic: [true],
    });
  }

  ngOnDestroy(): void {
    if (this.imagePreviewUrl) {
      URL.revokeObjectURL(this.imagePreviewUrl);
    }
  }

  onImageFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      if (!file.type.startsWith('image/')) {
        this.imageFileError = 'Please select a valid image file.';
        this.imageFile = null;
        this.imagePreviewUrl = null;
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        this.imageFileError = 'Image file size should not exceed 5MB.';
        this.imageFile = null;
        this.imagePreviewUrl = null;
        return;
      }

      if (this.imagePreviewUrl) {
        URL.revokeObjectURL(this.imagePreviewUrl);
      }

      this.imageFile = file;
      this.imagePreviewUrl = URL.createObjectURL(file);
      this.imageFileError = '';
    }
  }

  clearImageFile(): void {
    if (this.imagePreviewUrl) {
      URL.revokeObjectURL(this.imagePreviewUrl);
    }

    this.imageFile = null;
    this.imagePreviewUrl = null;
    this.imageFileError = '';
  }

  onSubmit(): void {
    this.uploading = true;
    const { name, description, isPublic } = this.playlistForm.value;

    this.playlistService
      .createPlaylist(name.trim(), description.trim(), isPublic, this.imageFile)
      .subscribe({
        next: (playlist) => {
          this.router.navigate(['/playlist', playlist.id]);
        },
        error: (error) => {
          const errorMessage =
            error.error?.message || 'Falled to create playlist. Please try again.';
          this.notificationService.error(errorMessage);
          this.uploading = false;
        },
      });
  }

  get isFormValid(): boolean {
    return this.playlistForm.valid && !this.imageFileError && !this.imageFileError;
  }

  
}
