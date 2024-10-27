// Toggle theme between dark and light
function toggleTheme(theme) {
  const sunIcon = document.getElementById("sunIcon");
  const moonIcon = document.getElementById("moonIcon");

  if (theme) {
    // toggle dark theme
    document.documentElement.classList.add("dark");
    sunIcon.classList.add("hidden");
    moonIcon.classList.remove("hidden");
  } else {
    document.documentElement.classList.remove("dark");
    sunIcon.classList.remove("hidden");
    moonIcon.classList.add("hidden");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Detect initial color theme
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  toggleTheme(media.matches);

  // Listen for changes in the color theme
  media.addEventListener("change", (event) => {
    toggleTheme(event.matches);
  });

  // Event listener for theme toggle button
  document.getElementById("themeToggleButton").addEventListener("click", () => {
    toggleTheme(!document.documentElement.classList.contains("dark"));
  });
});
