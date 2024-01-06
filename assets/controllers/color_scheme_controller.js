import { Application, Controller } from "https://unpkg.com/@hotwired/stimulus/dist/stimulus.js"
window.Stimulus = Application.start()
// Connects to data-controller="color-scheme"
Stimulus.register("color-scheme", class extends Controller {
  connect() {
    // console.log("Color Scheme Connected")
  }
  toggle() {
    const htmlElement = document.documentElement;
    if (htmlElement.getAttribute('data-color-scheme') === 'dark') {
      htmlElement.setAttribute('data-color-scheme', 'light');
    } else {
      htmlElement.setAttribute('data-color-scheme', 'dark');
    }
  }
});