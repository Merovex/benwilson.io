import { Application, Controller } from "https://unpkg.com/@hotwired/stimulus/dist/stimulus.js"
window.Stimulus = Application.start()

// Connects to data-controller="orbital-calculator"
Stimulus.register("orbital-calculator", class extends Controller {
  static targets = ["planetSize", "rotationPeriod", "mass", "altitude"]
  connect() {
    console.log('Orbital calculator controller connected.')
    this.calculate();
  }
  calculate() {
    console.log('Calculating...')
    const FOUR_PI_SQ = 39.4784176044
    const G_CONSTANT = 6.67430 * Math.pow(10, -11)

    const diameter = parseInt(this.planetSizeTarget.value);
    const hours = parseInt(this.rotationPeriodTarget.value);

    const time = hours * 3600; // Calculation is in seconds
    const mass = this.massTarget.value * 10.0 ** 24;
    const height = Math.round(Math.cbrt(G_CONSTANT * mass * (time ** 2) / FOUR_PI_SQ) / 1000) - (diameter / 2.0);

    this.altitudeTarget.value = height.toLocaleString('en-us');
  }
});