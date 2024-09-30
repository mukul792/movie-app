const searchForm = document.querySelector("form");
const movieContainer = document.querySelector(".movie-container");
const inputBox = document.querySelector(".inputbox");
const suggestionsList = document.getElementById("suggestions-list");
const themeToggle = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");
const myApiKey = "1a0c2167"; // Moved API key to a single variable

// Toggle between light and dark theme
const toggleTheme = () => {
  document.body.classList.toggle("dark-theme");
  document.body.classList.toggle("light-theme");
  themeIcon.textContent = document.body.classList.contains("dark-theme")
    ? "🌜"
    : "🌞";
  localStorage.setItem("theme", document.body.className);
};

// Load saved theme preference
const loadThemePreference = () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    document.body.className = savedTheme;
    themeIcon.textContent = savedTheme.includes("dark") ? "🌜" : "🌞";
  }
};

themeToggle.addEventListener("click", toggleTheme);
loadThemePreference();

// Fetch movie detail
const getMovieInfo = async (movie) => {
  try {
    const response = await fetch(
      `https://www.omdbapi.com/?apikey=${myApiKey}&t=${movie}`
    );
    if (!response.ok) throw new Error("Unable to fetch movie data.");
    const data = await response.json();
    showMovieData(data);
  } catch (error) {
    showErrorMessage("No Movie Found!!!");
  }
};

// Show movie data
const showMovieData = ({
  Title,
  imdbRating,
  Genre,
  Released,
  Runtime,
  Actors,
  Plot,
  Poster,
}) => {
  movieContainer.innerHTML = "";
  movieContainer.classList.remove("no-background");

  const movieElement = document.createElement("div");
  movieElement.classList.add("movie-info");
  movieElement.innerHTML = `<h2>${Title}</h2>
        <p><strong>Rating: &#11088;</strong>${imdbRating}</p>
        <div class="movie-genre">${Genre.split(",")
          .map((g) => `<p>${g.trim()}</p>`)
          .join("")}</div>
        <p><strong>Released Date: </strong>${Released}</p>
        <p><strong>Duration: </strong>${Runtime}</p>
        <p><strong>Cast: </strong>${Actors}</p>
        <p><strong>Plot: </strong>${Plot}</p>`;

  const moviePosterElement = document.createElement("div");
  moviePosterElement.classList.add("movie-poster");
  moviePosterElement.innerHTML = `<img src="${Poster}" alt="${Title} Poster"/>`;

  movieContainer.append(moviePosterElement, movieElement);
};

// Show error message
const showErrorMessage = (message) => {
  movieContainer.innerHTML = `<h2>${message}</h2>`;
  movieContainer.classList.add("no-background");
};

// Event listener for search form
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const movieName = inputBox.value.trim();
  movieName
    ? (showErrorMessage("Fetching Movie Information..."),
      getMovieInfo(movieName))
    : showErrorMessage("Enter movie name to get movie information");
});

// Fetch movie name suggestions
const getSuggestions = async (query) => {
  if (!query) {
    suggestionsList.style.display = "none";
    return;
  }

  const response = await fetch(
    `https://www.omdbapi.com/?apikey=${myApiKey}&s=${query}`
  );
  const data = await response.json();

  suggestionsList.innerHTML = data.Search
    ? data.Search.map(
        (movie) => `
        <li>${movie.Title}</li>
    `
      ).join("")
    : "";
  suggestionsList.style.display = data.Search ? "block" : "none";

  // Add click events to suggestions
  Array.from(suggestionsList.children).forEach((li) => {
    li.addEventListener("click", () => {
      inputBox.value = li.textContent;
      suggestionsList.style.display = "none";
      showErrorMessage("Fetching Movie Information...");
      getMovieInfo(li.textContent);
    });
  });
};

// Event listener for typing in search bar
inputBox.addEventListener("input", () => {
  getSuggestions(inputBox.value.trim());
});
