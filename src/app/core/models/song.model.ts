export interface Song {
  id: number;
  title: string;
  artist: string;
  songUrl: string;
  imageUrl: string;
  createAt: string;
  appUserId: number;
  appUsername: string;
}

export interface SongRequest {
  title: string;
  artist: string;
}

export interface AiSongData {
  analysis: string;
  moods: string[];
  genre: string;
  tempo: number;
  key: string;
  energy: number;
  similarArtists: string[];
  recommededFor: string;
}