
const API_URL = 'https://v3-cinemeta.strem.io/meta/movie/';

export async function getMovie(imdbId) {
  const response = await fetch(`${API_URL}${imdbId}.json`);

  if (!response.ok) {
    throw new Error(`Ошибка загрузки фильма: ${response.status}`);
  }

  const data = await response.json();
  return data.meta;
}

export async function getMovies(movies, onMovieLoaded) {
  await Promise.all(
    movies.map(async movie => {
      if (!movie.imdbId) return;

      try {
        const data = await getMovie(movie.imdbId);

        const updatedMovie = {
          ...movie,
          year: Number(data.year) || movie.year,
          rating: Number(data.imdbRating) || movie.rating,
          runtime: parseInt(data.runtime, 10) || movie.runtime,
          posterUrl: data.poster || null
        };

        onMovieLoaded?.(updatedMovie);
      } catch (error) {
        console.error(`Не удалось загрузить: ${movie.title}`, error);
      }
    })
  );
}
