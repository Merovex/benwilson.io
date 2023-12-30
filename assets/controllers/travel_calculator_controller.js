import { Application, Controller } from "https://unpkg.com/@hotwired/stimulus/dist/stimulus.js"
window.Stimulus = Application.start()
// Connects to data-controller="travel-calculator"
Stimulus.register("travel-calculator", class extends Controller {
  // export default class extends Controller {
  static targets = [
    "acceleration",
    "distance",
    "distanceAU",
    "distanceGm",
    "distanceLs",
    "fuelConsumed",
    "fuelConversionRate",
    "maxVelocity",
    "mls",
    "mwConsumed",
    "noDeceleration",
    "observerTime",
    "planetSize",
    "spaceshipMass",
    "starSize",
    "timeTravel",
    "travelTimeDmhs",
  ]
  SPEED_OF_LIGHT_SQUARED = 89875517873681760;
  SPEED_OF_LIGHT = 299792458;
  ACCELERATION_IN_G = 0.0098
  KM_PER_AU = 149597870.700
  SUN_DIAMETER = 1390000
  // Fuel Conversion Rate is HALF whatever is said in TNE: Fire, Fusion & Steel.
  // FUEL_CONVERSION_RATE = 0.00125; // HEPlaR 
  FUEL_CONVERSION_RATE = 0.0025; // M-Drive

  // =================================================================================================
  // Connect: Called when the controller is connected to the DOM.
  connect() {
    console.log("Travel Calculator Connected")
    this.calculate();
  }
  // =================================================================================================
  // Helper Functions
  acceleration() { return parseFloat(this.accelerationTarget.value) * this.ACCELERATION_IN_G }
  acosh(arg) { return Math.log(arg + Math.sqrt(arg * arg - 1)); }
  format(n) { return n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }
  fuel_conversion_rate() { return this.fuelConversionRateTarget.value }
  secondsToCycles(imperialSeconds) {
    var metricSeconds = Math.ceil(parseInt(imperialSeconds) / 0.864);
    var days = Math.floor(metricSeconds / 100000)
    var cycles = Math.floor((metricSeconds % 100000) / 10000);
    var beats = Math.floor(metricSeconds % (10000) / 100);
    return " <span class='block text-sm opacity-60 hover:opacity-100'>(" + days + "." + cycles + "." + beats + " days.cycles.beats)</span>";
    // return result;
  }
  secondsToDhms(seconds) {
    var seconds = parseInt(seconds);
    var d = Math.floor(seconds / (3600 * 24));
    var h = Math.floor(seconds % (3600 * 24) / 3600);
    var m = Math.floor(seconds % 3600 / 60);
    var s = Math.floor(seconds % 60);

    var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
    var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    var result = dDisplay + hDisplay + mDisplay + sDisplay;
    return result.replace(/, $/, "")
  }

  // =================================================================================================
  // Setters: Calculate values from other fields.
  setAU(km) {
    var au = km / this.KM_PER_AU
    switch (true) {
      case (au < 0.1): au = au.toFixed(3); break;
      case (au < 1): au = au.toFixed(2); break;
      case (au < 10): au = au.toFixed(1); break;
      default: au = au.toFixed(0); break;
    }
    this.distanceAUTarget.value = au;
  }
  setDistanceFromAU() {
    var au = this.distanceAUTarget.value;
    var km = au * 149597900
    this.setKM(km);
    this.setGM(km)
    this.setLightSeconds(km);
    this.calculate();
  }
  setDistanceFromKM() {
    var km = this.distanceTarget.value;
    this.setAU(km);
    this.setGM(km)
    this.setLightSeconds(km);
    this.calculate();
  }
  setDistanceFromPlanetSize() {
    var km = this.planetSizeTarget.value * 100;
    this.setAU(km);
    this.setGM(km);
    this.setKM(km);
    this.setLightSeconds(km);
    this.calculate()
  }
  setDistanceFromStarSize() {
    var stellar_size = this.starSizeTarget.value;
    var km = stellar_size * this.SUN_DIAMETER * 100
    this.setAU(km);
    this.setGM(km);
    this.setKM(km);
    this.setLightSeconds(km);
    calculate()
  }
  setKM(km) { this.distanceTarget.value = km }
  setGM(km) { this.distanceGmTarget.innerHTML = (km / 1000000).toFixed(2); }
  setLightSeconds(km) {
    var seconds = Math.round(km / 299792.558)
    this.distanceLsTarget.innerHTML = seconds;
    this.mlsTarget.innerHTML = Math.round(seconds / 0.864);
  }

  // =================================================================================================
  // Calculations
  calculate() {
    var ttSeconds = parseInt(this.calcObserverTime())
    var mwh = this.calcMWHConsumed(ttSeconds)
    this.travelTimeDmhsTarget.innerHTML = this.secondsToDhms(ttSeconds) + this.secondsToCycles(ttSeconds);
    this.fuelConsumedTarget.innerHTML = this.format(this.calcFuelMass(ttSeconds))
    this.mwConsumedTarget.innerHTML = (mwh > 10) ? mwh.toFixed(0) : mwh.toFixed(2)
  }

  calcMWHConsumed(ttSeconds) {
    var fc = 16000 * this.fuel_conversion_rate()
    var mass = this.spaceshipMassTarget.value / 200;

    var result = this.acceleration() * (mass / fc) * (ttSeconds / 3600);
    return result;
  }

  calcFuelMass(ttSeconds) {
    // Liquid Hydrogen weighs 71kg
    // HEPlaR is 0.25 cubic meter of liquid hydrogen per Megawatt Hour

    // This is Traveller's computation
    // var mwHour = calcMWHConsumed(ttSeconds);
    // var efficiency = 0.25 // HEPlaR
    // var result = mwHour * 71.0 * efficiency;

    // This is a more scientific calculation.
    var mass = parseInt(this.spaceshipMassTarget.value) * 1000; // Mass in Metric tons to KGs
    var max_velocity = this.calcMaxVelocity(ttSeconds)
    var vel_to_c = max_velocity / this.SPEED_OF_LIGHT;
    var per_kg_100percent = 2 * vel_to_c / (1 - vel_to_c);
    return per_kg_100percent * mass / this.fuel_conversion_rate();
  }

  calcObserverTime() {
    var distance = parseFloat(this.distanceTarget.value);
    var k = this.SPEED_OF_LIGHT_SQUARED / this.acceleration();
    var k_over_a = k / this.acceleration();
    var sqrt_term_operand = Math.pow(distance / (2 * k) + 1, 2);
    var sqrt_term = k_over_a * (sqrt_term_operand - 1);
    var result = 2 * Math.sqrt(sqrt_term);
    this.observerTimeTarget.innerHTML = this.secondsToDhms(result);
    return result;
  }

  calcDistanceFromAcceleration() {
    var time = this.timeTravelTarget.value * 60
    var speed = this.acceleration()
    var km = 0.5 * speed * Math.pow(time, 2)
    this.setKM(km);
    this.setGM(km);
    this.setLightSeconds(km);
    this.calcMaxVelocity(time * 2)
  }

  calcDist(observerTime, velocity) {
    // Formula from:
    // http://www.mrelativity.net/MBriefs/Most%20Direct%20Derivation%20of%20Relativistic%20Constant%20Acceleration%20Distance%20Formula.htm
    // Which is:
    // distance = c * max_vel * T_obs / c + sqrt(c^2 - max_vel^2)

    var numerator = this.SPEED_OF_LIGHT * velocity * observerTime;
    var lorentz = Math.sqrt(this.SPEED_OF_LIGHT_SQUARED - Math.pow(velocity, 2));
    var result = numerator / (this.SPEED_OF_LIGHT + lorentz);
    return result;
  }

  calcMaxVelocity(time_elapsed) {
    var result = this.acceleration() * (time_elapsed / 2); // * 1000;
    this.maxVelocityTarget.innerHTML = result.toFixed(0);
    return result;
  }
});