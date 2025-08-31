import { MovieDb } from "moviedb-promise";

export const moviedb = new MovieDb(process.env.NEXT_PUBLIC_TMBD_API_KEY!);
