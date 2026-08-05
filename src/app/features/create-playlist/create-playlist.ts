import { Component } from '@angular/core';
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
export class CreatePlaylist {
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
}
