import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SongService } from '../../core/services/song-service';
import { Router } from '@angular/router';
import { NotificationService } from '../../core/services/notification-service';

@Component({
  selector: 'app-upload-song',
  standalone: false,
  templateUrl: './upload-song.html',
  styleUrl: './upload-song.css',
})
export class UploadSong implements OnDestroy {
  songForm: FormGroup;
  uploading = false;

  songFile: File | null = null;
  imageFile: File | null = null;

  imagePreviewUrl: string | null = null;
  audioPreviewUrl: string | null = null;

  songFileError = '';
  imageFileError = '';

  constructor(
    private formBuilder: FormBuilder,
    private songService: SongService,
    private router: Router,
    private notificationService: NotificationService,
  ) {
    this.songForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      artist: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    });
  }

  ngOnDestroy(): void {
    if (this.imagePreviewUrl) {
      URL.revokeObjectURL(this.imagePreviewUrl);
    }

    if (this.audioPreviewUrl) {
      URL.revokeObjectURL(this.audioPreviewUrl);
    }
  }

  onSongFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      if (!file.type.startsWith('audio/')) {
        this.songFileError = 'Please select a valid audio file.';
        this.songFile = null;
        this.audioPreviewUrl = null;
        return;
      }

      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        this.songFileError = 'Audio file size should not exceed 50MB.';
        this.songFile = null;
        this.audioPreviewUrl = null;
        return;
      }

      if (this.audioPreviewUrl) {
        URL.revokeObjectURL(this.audioPreviewUrl);
      }

      this.songFile = file;
      this.audioPreviewUrl = URL.createObjectURL(file);
      this.songFileError = '';
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

  clearSongFile(): void {
    if (this.audioPreviewUrl) {
      URL.revokeObjectURL(this.audioPreviewUrl);
    }

    this.songFile = null;
    this.audioPreviewUrl = null;
    this.songFileError = '';
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

    const { title, artist } = this.songForm.value;
    const formData = new FormData();

    formData.append('title', title.trim());
    formData.append('artist', artist.trim());
    formData.append('songFile', this.songFile!);
    formData.append('imageFile', this.imageFile!);

    this.songService.addsSong(formData).subscribe({
      next: () => {
        this.uploading = false;
        this.notificationService.success('Song uploaded successfully!');
        if (this.imagePreviewUrl) {
          URL.revokeObjectURL(this.imagePreviewUrl);
        }

        if (this.audioPreviewUrl) {
          URL.revokeObjectURL(this.audioPreviewUrl);
        }

        this.songForm.reset();
        this.songFile = null;
        this.imageFile = null;
        this.imagePreviewUrl = null;
        this.audioPreviewUrl = null;
        this.songFileError = '';
        this.imageFileError = '';
        this.router.navigate(['/my-uploads']);
      },
      error: (error) => {
        console.error(error);
        this.uploading = false;
        this.notificationService.error(
          error.error?.message || 'Failed to upload the song. Please try again.',
        );
      },
    });
  }

  cancel() {
    this.router.navigate(['/my-uploads']);
  }

  get isFormValid(): boolean {
    return (
      this.songForm.valid &&
      !!this.songFile &&
      !!this.imageFile &&
      !this.songFileError &&
      !this.imageFileError
    );
  }
}
