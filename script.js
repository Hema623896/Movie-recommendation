const API_KEY = '3fd2be6f0c70a2a598f084ddfb75487c';
const API_URL = `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=3fd2be6f0c70a2a598f084ddfb75487c&page=1`;
const IMG_PATH = 'https://image.tmdb.org/t/p/w1280';
const SEARCH_API = `https://api.themoviedb.org/3/search/movie?api_key=3fd2be6f0c70a2a598f084ddfb75487c&query=`;
const GENRE_API = `https://api.themoviedb.org/3/genre/movie/list?api_key=3fd2be6f0c70a2a598f084ddfb75487c&language=en-US`;

const main = document.getElementById('main');
const form = document.getElementById('form');
const search = document.getElementById('search');
const loading = document.getElementById('loading');
const genreSelect = document.getElementById('genreFilter');
const languageSelect = document.getElementById('languageFilter');
const applyBtn = document.getElementById('applyFilters');

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'fr', name: 'French' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'es', name: 'Spanish' },
  { code: 'ta', name: 'Tamil' }
];

// Load initial data
getMovies(API_URL);
loadGenres();
loadLanguages();

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const searchTerm = search.value.trim();
  if (searchTerm) {
    getMovies(SEARCH_API + encodeURIComponent(searchTerm));
    search.value = '';
  } else {
    window.location.reload();
  }
});

applyBtn.addEventListener('click', () => {
  const selectedGenre = genreSelect.value;
  const selectedLanguage = languageSelect.value;
  let filteredUrl = `https://api.themoviedb.org/3/discover/movie?api_key=3fd2be6f0c70a2a598f084ddfb75487c&sort_by=popularity.desc&page=1`;

  if (selectedGenre) {
    filteredUrl += `&with_genres=${selectedGenre}`;
  }
  if (selectedLanguage) {
    filteredUrl += `&with_original_language=${selectedLanguage}`;
  }

  getMovies(filteredUrl);
});

async function getMovies(url) {
  try {
    showLoading();
    const res = await fetch(url);
    const data = await res.json();
    hideLoading();

    if (!data.results || data.results.length === 0) {
      main.innerHTML = `<p style="text-align:center; font-size: 24px;">No results found 😢</p>`;
      return;
    }

    showMovies(data.results);
  } catch (error) {
    hideLoading();
    main.innerHTML = `<p style="text-align:center; font-size: 24px;">Error fetching data. Please try again later.</p>`;
    console.error('Fetch Error:', error);
  }
}

async function showMovies(movies) {
    main.innerHTML = '';
  
    for (const movie of movies) {
      const { id, title, poster_path, vote_average, overview } = movie;
      const movieEl = document.createElement('div');
      movieEl.classList.add('movie');
  
      // Fetch Watch Provider for the movie (IN region)
      const watchProviderUrl = `https://api.themoviedb.org/3/movie/${id}/watch/providers?api_key=${API_KEY}`;
      let ottLink = null;
  
      try {
        const res = await fetch(watchProviderUrl);
        const data = await res.json();
        if (data.results && data.results.IN && data.results.IN.link) {
          ottLink = data.results.IN.link;
        }
      } catch (err) {
        console.error(`Watch Provider Error for ${title}:`, err);
      }
  
      movieEl.innerHTML = `
        <img src="${poster_path ? IMG_PATH + poster_path : 'https://via.placeholder.com/400x600?text=No+Image'}" alt="${title}">
        <div class="movie-info">
          <h3>${title}</h3>
          <span class="${getClassByRate(vote_average)}">${vote_average}</span>
        </div>
        <div class="overview">
          <h3>Overview</h3>
          ${overview || 'No overview available.'}
          <br/>
          ${ottLink ? `<a href="${ottLink}" target="_blank" class="view-btn">🎥 View on OTT</a>` : `<span class="no-ott">Not available on OTT</span>`}
        </div>
      `;
  
      main.appendChild(movieEl);
    }
  }
  

async function getWatchProviders(movieId) {
  try {
    const res = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/watch/providers?api_key=3fd2be6f0c70a2a598f084ddfb75487c`);
    const data = await res.json();

    const platforms = data.results?.IN?.flatrate;

    if (platforms && platforms.length > 0) {
      return platforms.map(p => p.provider_name).join(', ');
    } else {
      return null;
    }
  } catch (error) {
    console.error('Watch Provider Fetch Error:', error);
    return null;
  }
}

function getClassByRate(vote) {
  if (vote >= 8) return 'green';
  else if (vote >= 5) return 'orange';
  else return 'red';
}

function showLoading() {
  loading.classList.remove('hidden');
}

function hideLoading() {
  loading.classList.add('hidden');
}

async function loadGenres() {
  try {
    const res = await fetch(GENRE_API);
    const data = await res.json();

    data.genres.forEach((genre) => {
      const option = document.createElement('option');
      option.value = genre.id;
      option.textContent = genre.name;
      genreSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Genre load error:', error);
  }
}

function loadLanguages() {
  LANGUAGES.forEach((lang) => {
    const option = document.createElement('option');
    option.value = lang.code;
    option.textContent = lang.name;
    languageSelect.appendChild(option);
  });
}