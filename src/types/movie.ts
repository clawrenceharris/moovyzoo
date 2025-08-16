export interface Genre {
  id: string;

  name: string;
  tmdbId: number;
  description: string;
  iconUrl?: string;
  isActive: boolean;
}
