import { Application, Controller } from "https://unpkg.com/@hotwired/stimulus/dist/stimulus.js"
// import CalHeatMap from 'cal-heatmap';
this.heatmap = new CalHeatMap();
// import CalHeatMap from 'https://unpkg.com/cal-heatmap/dist/cal-heatmap.min.js';
window.Stimulus = Application.start()

// Connects to data-controller="contribution-map"
Stimulus.register("calendar-graph", class extends Controller {
  static targets = ["day", "message", "yearButton", "graph", 'terms'];
  // static targets = ["day", "message", "yearButton", "graph", 'terms', 'title', 'key', 'start_date', 'end_date', 'data']
  days = {};

  // getYear(date) {
  //   return date.getFullYear();
  // }
  connect() {
    console.log('Calendar Graph Controller connected');
    this.endDate = new Date(); // Start with today.
    this.startDate = new Date(this.endDate); // Duplicate today's date.
    this.startDate.setFullYear(this.startDate.getFullYear() - 1); // Set the start date to one year ago from the current date
    this.startDate.setDate(this.startDate.getDate() + 1); // Add one day to make it 'tomorrow' of the last year
    this.loadData();
    if (this.days.length > 0) {
      this.setHeatmapData();
    }
  }
  async loadData() {
    try {
      const response = await fetch('/assets/wordcount.json');
      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }
      const data = await response.json();
      this.processEntries(data);
      console.log("Loaded data:", this.days);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  }
  processEntries(entries) {
    this.days = {}; // Initialize days object

    entries.forEach(entry => {
      // let day = this.formatDate(entry.day); // Assuming formatDate is a method in this class
      if (!this.days[entry.date]) {
        this.days[entry.date] = { count: 0, level: entry.level };
      }
      this.days[entry.date].count += (entry.count || 0); // Ensure entry.count is a number
    });
  }
  setHeatmapData() {
    // Dimensions and layout
    this.size = 10;
    this.padding = 3;
    this.offset = [25, 15];
    this.height = ((this.size + this.padding) * 9.5 + this.offset[1]);
    this.width = ((this.size + this.padding) * 54 + this.offset[0]);
    this.setGraph();
  }
  setGraph() {

  }
});