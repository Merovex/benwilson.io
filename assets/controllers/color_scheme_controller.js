import { Application, Controller } from "https://unpkg.com/@hotwired/stimulus/dist/stimulus.js"
window.Stimulus = Application.start()
// Connects to data-controller="color-scheme"
Stimulus.register("color-scheme", class extends Controller {
  connect() {
    const colorScheme = localStorage.getItem('color-scheme');
    if (colorScheme) {
      document.documentElement.setAttribute('data-color-scheme', colorScheme);
    }
    else {
      document.documentElement.setAttribute('data-color-scheme', 'dark');
    }
  }
  toggle() {
    const htmlElement = document.documentElement;
    let newColorScheme;
    console.log('toggle')
    if (htmlElement.getAttribute('data-color-scheme') === 'dark') {
      newColorScheme = 'light';
    } else {
      newColorScheme = 'dark';
    }
    htmlElement.setAttribute('data-color-scheme', newColorScheme);

    localStorage.setItem('color-scheme', newColorScheme);
  }
});