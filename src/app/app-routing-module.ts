import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Home } from './features/home/home';
import { authGuard } from './core/guards/auth-guard';
import { Layout } from './shared/layout/layout';
import { adminGuard } from './core/guards/admin-guard';
import { UploadSong } from './features/upload-song/upload-song';
import { MyUploads } from './features/my-uploads/my-uploads';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      { path: 'home', component: Home },
      { path: 'upload-song', component: UploadSong, canActivate: [adminGuard] },
      { path: 'my-uploads', component: MyUploads, canActivate: [authGuard] },
    ],
  },
  { path: '**', redirectTo: '/login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
