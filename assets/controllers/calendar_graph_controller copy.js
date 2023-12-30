import { Application, Controller } from "https://unpkg.com/@hotwired/stimulus/dist/stimulus.js"
window.Stimulus = Application.start()

// Connects to data-controller="contribution-map"
Stimulus.register("calendar-graph", class extends Controller {
  static targets = ["day", "message", "yearButton", "graph", 'terms']
  // static targets = ["day", "message", "yearButton", "graph", 'terms', 'title', 'key', 'start_date', 'end_date', 'data']
  entries = [];

  getYear(date) {
    return date.getFullYear();
  }
  connect() {
    console.log('Calendar Graph Controller connected');
    this.terms = this.termsTarget || 'words';
    this.titleBase = this.titleTarget || 'title';
    this.key = this.keyTarget || 'year';

    // Parsing start and end dates
    // let start_date = this.data.get('start_date');
    // let end_date = this.data.get('end_date');
    // let start_date = '2022-01-01'
    // let end_date = '2022-12-31'
    // this.startDate = (typeof start_date === 'string') ? new Date(start_date) : start_date;
    // this.endDate = (typeof end_date === 'string') ? new Date(end_date) : end_date;

    // // Additional properties
    // this.weekIndex = 0;
    // this.title = `${this.titleBase} ${this.key === 'year' ? `in ${this.getYear(this.endDate)}` : 'in the past 365 days'}`;
    // this.years = eachDayOfInterval({ start: this.startDate, end: this.endDate })
    //   .map(date => getYear(date))
    //   .filter((value, index, self) => self.indexOf(value) === index); // Unique years

    // // Process your data
    // let rawData = this.data.get('data'); // Assuming JSON string
    // this.data = JSON.parse(rawData);
    // this.totalCount = this.data.filter(e => e.day >= this.startDate && e.day <= this.endDate)
    //   .map(d => d.count)
    //   .reduce((a, b) => a + b, 0);

    // // Dimensions and layout
    // this.size = 10;
    // this.padding = 3;
    // this.offset = [25, 15];
    // this.height = ((this.size + this.padding) * 9.5 + this.offset[1]);
    // this.width = ((this.size + this.padding) * 54 + this.offset[0]);
    this.setHeatmapData();
  }
  setHeatmapData() {
    loadData() {
      fetch('/assets/wordcount.json')
        .then(response => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("Network response was not ok.");
          }
        })
        .then(data => {
          // this.handleData(data);
          this.entries = data.forEach(entry => {
            let day = formatDate(entry.day); // Assuming entry.day is a Date object, formatDate() needs to be defined
            let title = entry.title;
            let level = entry.level;

            if (!days[day]) {
              days[day] = { count: 0, target: 1000, title: title, level: level };
            }
            days[day].count += entry.count;
          });
          console.log("Loaded data.");
        })
        .catch(error => console.error("Error fetching data: ", error));
    }
  }

The syntax you've provided has a few issues. Firstly, the loadData() function is defined inside the setHeatmapData() method, which isn't valid syntax in JavaScript. Secondly, the days variable is used but not declared anywhere in the provided code.Lastly, the fetch() call is correct, but the handling of data and logging could be adjusted for clarity.Here's a revised version:

javascript
Copy code
class YourController {
  // Assuming this is part of a larger class

  setHeatmapData() {
    this.loadData();
  }

  loadData() {
    fetch('/assets/wordcount.json')
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Network response was not ok.");
        }
      })
      .then(data => {
        this.processEntries(data);
        console.log("Loaded data:", this.days);
      })
      .catch(error => console.error("Error fetching data: ", error));
  }

  processEntries(entries) {
    this.days = {}; // Initialize days object

    entries.forEach(entry => {
      let day = this.formatDate(entry.day); // Assuming formatDate is a method in this class
      let title = entry.title;
      let level = entry.level;

      if (!this.days[day]) {
        this.days[day] = { count: 0, target: 1000, title: title, level: level };
      }
      this.days[day].count += (entry.count || 0); // Ensure entry.count is a number
    });
  }

// Helper function to format a date object as 'YYYY-MM-DD'
 formatDate(date) {
    let month = ('0' + (date.getMonth() + 1)).slice(-2); // months are 0-based in JS
    let day = ('0' + date.getDate()).slice(-2);
    return `${date.getFullYear()}-${month}-${day}`;
  }
  listen() {
  this.dayTargets.forEach(day => {
    if (day.dataset.count > 0) {
      day.addEventListener('mouseover', this.cgCreateTip.bind(this));
      day.addEventListener('mouseout', this.cgCancelTip.bind(this));
    }
  });
}
  render() {
  // Assuming you have a method similar to Rails' `graph_tag` method
  let svg = createSVG({
    width: this.width,
    height: this.height,
    viewBox: `0 0 ${this.width} ${this.height}`,
    xmlns: 'http://www.w3.org/2000/svg',
    class: 'heatmap-toggle hidden',
    id: `heatmap-${this.key === 'year' ? getYear(this.endDate) : 'year'}`
  });

  // Create the title
  svg.appendChild(createText({
    x: 0,
    y: 10,
    class: 'calgraph-title',
    text: this.title
  }));

  // Create the key
  svg.appendChild(createKey({
    x: 0,
    y: 25,
    class: 'calgraph-key',
    terms: this.terms
  }));

  // Create the days
  svg.appendChild(createDays({
    data: this.data,
    size: this.size,
    padding: this.padding,
    offset: this.offset,
    terms: this.terms,
    title: this.title
  }));

  // Append the SVG to the content target
  this.graphTarget.appendChild(svg);
}

  dayRectangle(date, data, idx = null) {
  let cssClass;
  switch(data.level) {
      case 5:
  cssClass = 'calgraph-5';
  break;
      case 4:
  cssClass = 'calgraph-4';
  break;
      case 3:
  cssClass = 'calgraph-3';
  break;
      case 2:
  cssClass = 'calgraph-2';
  break;
      default:
  cssClass = 'calgraph-1';
}

// Assuming 'this' context has weekIndex, size, padding, offset, terms, and title properties similar to the Ruby instance variables
let dow = date.getDay() + 1; // In JS, getDay() returns 0 (Sunday) to 6 (Saturday)
if (dow === 1) this.weekIndex += 1;
let woy = this.weekIndex;

// Create the rectangle element (assuming you're using a method similar to Rails' `tag` method)
return createRect({
  x: woy * (this.size + this.padding) + this.offset[0],
  y: dow * (this.size + this.padding) + this.offset[1],
  rx: 2,
  ry: 2,
  width: this.size,
  height: this.size,
  strokeWidth: 1,
  class: `${cssClass} calgraph-day`,
  data: {
    contributionMapTarget: 'day',
    date: formatDate(date), // You'll need a function to format the date as 'YYYY-MM-DD'
    level: data.level,
    count: data.count,
    terms: this.terms,
    title: this.title,
    tooltip: data.tooltip
  }
});
  }

// Helper function to create the rect element (this will depend on how you're rendering the SVG)
createRect(attributes) {
  let rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  for (let attr in attributes) {
    if (attr === 'data') {
      for (let dataKey in attributes[attr]) {
        rect.setAttribute(`data-${dataKey}`, attributes[attr][dataKey]);
      }
    } else {
      rect.setAttribute(attr, attributes[attr]);
    }
  }
  return rect;
}

// Helper function to format a date object as 'YYYY-MM-DD'
formatDate(date) {
  let month = ('0' + (date.getMonth() + 1)).slice(-2); // months are 0-based in JS
  let day = ('0' + date.getDate()).slice(-2);
  return `${date.getFullYear()}-${month}-${day}`;
}

cgCreateTip(event) {
  let container = this.graphTarget;
  let rect = container.getBoundingClientRect();


  const day = event.currentTarget;
  let dayRect = day.getBoundingClientRect();

  const tooltip = this.messageTarget;
  const date = new Date(day.dataset.date).toLocaleString('en-US', { month: 'short', day: 'numeric' });
  tooltip.innerHTML = `<p class='tooltip'><span>${parseInt(day.dataset.count).toLocaleString('en')} ${day.dataset.terms}</span> on <span>${date}</span></p><div class='arrow'></div>`;

  const tooltipX = dayRect.left - rect.left - (tooltip.offsetWidth / 2) + (dayRect.width / 2); // Adjust as needed
  const tooltipY = dayRect.top - rect.bottom - (tooltip.offsetHeight * 1) - dayRect.height; // Adjust as needed
  tooltip.style.top = `${tooltipY}px`;
  tooltip.style.left = `${tooltipX}px`;
  tooltip.style.display = 'block';
  console.log(dayRect, tooltipX);
}

cgCancelTip(event) {
  this.messageTarget.innerHTML = '';
}

toggleHeatmap(event) {
  const year = event.currentTarget.dataset.year;
  this.yearButtonTargets.forEach(button => button.classList.remove('active'));
  event.currentTarget.classList.add('active');

  const heatmapToggleElements = document.querySelectorAll('.heatmap-toggle');
  heatmapToggleElements.forEach(element => element.classList.add('hidden'));

  const heatmapToggleElement = document.getElementById(`heatmap-${year}`);
  heatmapToggleElement.classList.remove('hidden');
}
});