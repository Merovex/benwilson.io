import { Application, Controller } from "https://unpkg.com/@hotwired/stimulus/dist/stimulus.js"
window.Stimulus = Application.start()

// Connects to data-controller="contribution-map"
Stimulus.register("calendar-graph", class extends Controller {
  static targets = ["calendar", 'button']

  connect() {
    // This will run when the controller is connected to your DOM
    console.log("ToggleCalendar controller connected");
  }

  show(event) {
    event.preventDefault();

    // Get the calendar name from the button's data attribute
    const calendarName = event.currentTarget.dataset.calendarName;

    // Hide all calendars
    this.calendarTargets.forEach((calendar) => {
      calendar.classList.remove("hidden");
      calendar.classList.add("hidden");
    });
    this.buttonTargets.forEach((button) => {
      button.classList.remove("bg-indigo-500", 'text-white', 'hover:bg-indigo-700');
    });
    const selectedButton = this.buttonTargets.find((button) => {
      console.log(button.dataset.calendarName, calendarName, button.classList);
      return button.dataset.calendarName === calendarName;
    });
    if (selectedButton) {
      console.log("selectedButton", selectedButton);
      selectedButton.classList.add("bg-indigo-500", 'text-white', 'hover:bg-indigo-700');
    }

    const selectedCalendar = this.calendarTargets.find((calendar) => {
      return calendar.dataset.calendarGraphName === calendarName;
    });
    if (selectedCalendar) {
      selectedCalendar.classList.remove("hidden");
    }
  }
});