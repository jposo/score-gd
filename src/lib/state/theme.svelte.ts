import { browser } from "$app/environment";

class ThemeManager {
  readonly themes = ["light", "silk", "dark", "dracula", "sunset"];
  currentTheme = $state(this.initialTheme);

  get initialTheme() {
    if (browser) {
      const theme = localStorage.getItem("theme");
      return theme || "light";
    }
    return "light";
  }

  setTheme(theme: (typeof this.themes)[number]) {
    let newTheme = theme;
    if (!this.themes.includes(theme)) {
      newTheme = this.themes[0];
    }
    if (browser) {
      localStorage.setItem("theme", newTheme);
      document.documentElement.setAttribute("data-theme", newTheme);
    }
    this.currentTheme = newTheme;
  }
}

export const themeManager = new ThemeManager();
