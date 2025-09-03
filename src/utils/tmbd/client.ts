import { MovieDb } from "moviedb-promise";

export const moviedb = new MovieDb(process.env.TMBD_API_KEY!);
