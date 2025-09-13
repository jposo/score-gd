import { writable } from "svelte/store";
import { browser } from "$app/environment";

// Available DaisyUI themes
export const themes = ["light", "silk", "dark", "dracula"];

// Get initial theme from localStorage or default to 'light'
function getInitialTheme(): string {
  if (browser) {
    return localStorage.getItem("theme") || "light";
  }
  return "light";
}

// Create the theme store
export const theme = writable<string>(getInitialTheme());

// Subscribe to theme changes and update localStorage and document
if (browser) {
  theme.subscribe((value) => {
    localStorage.setItem("theme", value);
    document.documentElement.setAttribute("data-theme", value);
  });
}

// Function to set theme
export function setTheme(newTheme: string) {
  if (themes.includes(newTheme)) {
    theme.set(newTheme);
  }
}

// Function to toggle between light and dark
export function toggleTheme() {
  theme.update((current) => (current === "light" ? "dark" : "light"));
}
