// DOM element selections
const searchForm = document.querySelector("form");
const movieContainer = document.querySelector(".movie-container");
const searchResult = document.getElementById("search-result");
const inputBox = document.querySelector(".inputbox");
const suggestionsList = document.getElementById("suggestions-list");
const themeToggle = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");
const modal = document.getElementById("movie-details-modal");
const closeBtn = document.querySelector(".close");

// API key for OMDB
const myApiKey = "1a0c2167";

// List of popular movie titles for initial display
const movieTitles = [
  "The Godfather",
  "The Dark Knight",
  "The Matrix",
  "Inception",
  "Deadpool",
  "The Conjuring",
  "John Wick",
  "The Shawshank Redemption",
  "Interstellar",
  "Gladiator",
];

// Theme toggle functionality
const toggleTheme = () => {
  document.body.classList.toggle("dark-theme");
  themeIcon.classList.toggle("fa-sun");
  themeIcon.classList.toggle("fa-moon");
  localStorage.setItem("theme", document.body.className);
};

// Load saved theme preference
const loadThemePreference = () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    document.body.className = savedTheme;
    themeIcon.classList.toggle("fa-moon", savedTheme.includes("dark"));
  }
};

// Fetch movie information from OMDB API
const getMovieInfo = async (movie) => {
  try {
    const response = await fetch(
      `https://www.omdbapi.com/?apikey=${myApiKey}&t=${movie}`
    );
    if (!response.ok) throw new Error("Unable to fetch movie data.");
    const data = await response.json();
    if (data.Response === "False") throw new Error("Movie not found!");
    return data;
  } catch (error) {
    console.error("Error fetching movie data:", error);
    throw error;
  }
};

// Create a movie card element
const createMovieElement = ({ Title, Poster }) => {
  const movieElement = document.createElement("div");
  movieElement.classList.add("movie-card");
  movieElement.innerHTML = `
    <div class="movie-poster">
      <img src="${Poster}" alt="${Title} Poster"/>
    </div>
    <div class="movie-title">${Title}</div>
  `;
  movieElement.addEventListener("click", () => showMovieDetailsModal(Title));
  return movieElement;
};

// Fetch and display initial set of movies
const fetchMoviesOnLoad = async () => {
  movieContainer.innerHTML = "";
  const movieElements = await Promise.all(
    movieTitles.map(async (title) => {
      try {
        const movieData = await getMovieInfo(title);
        return createMovieElement(movieData);
      } catch (error) {
        console.error(`Error fetching data for ${title}:`, error);
        return null;
      }
    })
  );
  movieElements
    .filter(Boolean)
    .forEach((element) => movieContainer.appendChild(element));
};

// Show movie details in a modal
const showMovieDetailsModal = async (title) => {
  try {
    const movieData = await getMovieInfo(title);
    const {
      Title,
      Poster,
      imdbRating,
      Genre,
      Released,
      Runtime,
      Actors,
      Plot,
      Director,
      Country,
      Language,
    } = movieData;

    document.querySelector(
      "#movie-details .movie-poster"
    ).innerHTML = `<img src="${Poster}" alt="${Title} Poster"/>`;
    document.querySelector("#movie-details .movie-info").innerHTML = `
      <h2>${Title}</h2>
      <p><strong>IMDB Rating:</strong> ⭐ ${imdbRating}</p>
      <div class="movie-genre">
        ${Genre.split(",")
          .map((g) => `<span>${g.trim()}</span>`)
          .join("")}
      </div>
      <p><strong>Released:</strong> ${Released}</p>
      <p><strong>Duration:</strong> ${Runtime}</p>
      <p><strong>Director:</strong> ${Director}</p>
      <p><strong>Country:</strong> ${Country}</p>
      <p><strong>Language:</strong> ${Language}</p>
      <p><strong>Cast:</strong> ${Actors}</p>
      <p><strong>Plot:</strong> ${Plot}</p>
    `;
    modal.style.display = "block";
  } catch (error) {
    showErrorMessage(error.message);
  }
};

// Display search result
const showSearchResult = (movieData) => {
  const {
    Title,
    Poster,
    imdbRating,
    Genre,
    Released,
    Runtime,
    Actors,
    Plot,
    Director,
    Country,
    Language,
  } = movieData;

  searchResult.innerHTML = `
    <div class="movie-poster">
      <img src="${Poster}" alt="${Title} Poster"/>
    </div>
    <div class="movie-info">
      <h2>${Title}</h2>
      <p><strong>IMDB Rating:</strong> ⭐ ${imdbRating}</p>
      <div class="movie-genre">
        ${Genre.split(",")
          .map((g) => `<span>${g.trim()}</span>`)
          .join("")}
      </div>
      <p><strong>Released:</strong> ${Released}</p>
      <p><strong>Duration:</strong> ${Runtime}</p>
      <p><strong>Director:</strong> ${Director}</p>
      <p><strong>Country:</strong> ${Country}</p>
      <p><strong>Language:</strong> ${Language}</p>
      <p><strong>Cast:</strong> ${Actors}</p>
      <p><strong>Plot:</strong> ${Plot}</p>
    </div>
  `;
  searchResult.style.display = "flex";
  movieContainer.style.display = "none";
};

// Display error message
const showErrorMessage = (message) => {
  searchResult.innerHTML = `<h2>${message}</h2>`;
  searchResult.style.display = "block";
  movieContainer.style.display = "none";
};

// Handle search form submission
const handleSearch = async (e) => {
  e.preventDefault();
  const movieName = inputBox.value.trim();
  if (movieName) {
    try {
      const movieData = await getMovieInfo(movieName);
      showSearchResult(movieData);
    } catch (error) {
      showErrorMessage(error.message);
    }
  } else {
    showErrorMessage("Enter movie name to get movie information...");
  }
};

// Get and display search suggestions
const getSuggestions = async (query) => {
  if (!query) {
    suggestionsList.style.display = "none";
    return;
  }
  try {
    const response = await fetch(
      `https://www.omdbapi.com/?apikey=${myApiKey}&s=${query}`
    );
    const data = await response.json();
    if (data.Response === "False") throw new Error("No suggestions found");

    suggestionsList.innerHTML = data.Search
      ? data.Search.map(
          (movie) => `<li>${movie.Title} (${movie.Year})</li>`
        ).join("")
      : "";
    suggestionsList.style.display = data.Search ? "block" : "none";

    Array.from(suggestionsList.children).forEach((li) => {
      li.addEventListener("click", () => {
        inputBox.value = li.textContent.split(" (")[0];
        suggestionsList.style.display = "none";
        searchForm.dispatchEvent(new Event("submit"));
      });
    });
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    suggestionsList.style.display = "none";
  }
};

// Event listeners
themeToggle.addEventListener("click", toggleTheme);
searchForm.addEventListener("submit", handleSearch);
inputBox.addEventListener("input", () => getSuggestions(inputBox.value.trim()));
closeBtn.addEventListener("click", () => (modal.style.display = "none"));
window.addEventListener("click", (event) => {
  if (event.target == modal) modal.style.display = "none";
});
document.addEventListener("click", (e) => {
  if (!inputBox.contains(e.target) && !suggestionsList.contains(e.target)) {
    suggestionsList.style.display = "none";
  }
});

// Initialize the app
loadThemePreference();
document.addEventListener("DOMContentLoaded", fetchMoviesOnLoad);
