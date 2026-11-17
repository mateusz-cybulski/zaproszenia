import { DARK_QUERY, THEME_STORAGE_KEY } from "./config";

// Runs before the first paint, so a dark page never flashes light. Mirrors applyTheme().
export const themeScript = `(() => {
  try {
    const preference = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    const dark = preference === "dark" ||
      (preference !== "light" && matchMedia(${JSON.stringify(DARK_QUERY)}).matches);
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  } catch {}
})();`;
