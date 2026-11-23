
const API_URL = 'https://v3-cinemeta.strem.io/meta/movie/';
const CACHE_KEY = 'movienight:movie-cache';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeCache(cache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.warn('Не удалось сохранить кеш', error);
  }
}

const cache = readCache();

export async function getMovie(imdbId) {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 8000);

  try {
    const response = await fetch(
      `${API_URL}${imdbId}.json`,
      { signal: controller.signal }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!data.meta) {
      throw new Error('Информация о фильме отсутствует');
    }

    return data.meta;
  } finally {
    clearTimeout(timeout);
  }
}

export async function getMovies(movies, onMovieLoaded) {
  let index = 0;

  async function worker() {
    while (index < movies.length) {
      const movie = movies[index++];

      if (!movie.imdbId) continue;

      const cached = cache[movie.imdbId];

      // Сначала показываем кешированные данные.
      if (cached?.data) {
        onMovieLoaded?.({
          ...movie,
          ...cached.data
        });
      }

      // Если кеш свежий, повторный запрос не нужен.
      if (
        cached?.data &&
        Date.now() - cached.time < CACHE_TTL
      ) {
        continue;
      }

      try {
        const data = await getMovie(movie.imdbId);

        const updatedData = {
          year: Number(data.year) || movie.year,
          rating: Number(data.imdbRating) || movie.rating,
          runtime:
            parseInt(data.runtime, 10) || movie.runtime,
          posterUrl: data.poster || null
        };

        cache[movie.imdbId] = {
          data: updatedData,
          time: Date.now()
        };

        writeCache(cache);

        onMovieLoaded?.({
          ...movie,
          ...updatedData
        });

      } catch (error) {
        console.warn(
          `Не удалось загрузить: ${movie.title}`,
          error
        );
      }
    }
  }

  // Максимум 5 одновременных запросов.
  const workers = Array.from(
    { length: Math.min(5, movies.length) },
    () => worker()
  );

  await Promise.all(workers);
}
