#!/Users/merovex/.rvm/rubies/ruby-3.1.2/bin/ruby

require 'json'
require 'date'
require 'awesome_print'
require 'action_view'
require 'bigdecimal'
include ActionView::Helpers::TagHelper
include ActionView::Context

file_path = './assets/wordcount.json'

# Read the JSON file
file = File.read(file_path)

# Parse the JSON file into a Ruby array of objects
data = JSON.parse(file).group_by { |entry| Date.parse(entry["date"]).year }

def contribution_map(contributions, **args)
  #Jdata-target="toggle-calendar.calendar" data-calendar-name="365d"
  # raise args.inspect
  output = "<table data-calendar-graph-target='calendar' data-calendar-graph-name='#{args[:id]}' class='contribution-map #{args[:show] ? '' : 'hidden'} ContributionCalendar-grid' style='border-spacing: 3px; overflow: hidden; position: relative'>"
  output += content_tag(:caption, 'Contribution Graph', class: 'sr-only')
  # output += content_tag(:thead)
  output += "<tbody>\n"
  contributions.each do |week|
    idx = week.first[:date].strftime("%U").to_i + 1
    output += "  <tr style='height:10px'>\n"
    # <td tabindex="0" data-ix="32" aria-selected="false" aria-describedby="contribution-graph-legend-level-0" style="width: 10px" data-date="2023-08-15" id="contribution-day-component-2-32" data-level="0" role="gridcell" data-view-component="true" class="ContributionCalendar-day" aria-labelledby="tooltip-05d687bc-d40d-417c-8b89-466ffcee8989"></td>
    output += week.map do |day|
      level = day[:entry] ? day[:entry]["level"] : 0
      level = 4 if level > 4
      level = 0 if level < 0
      content_tag(:td, '',
        tabindex: 0, aria: { selected: false, describedby: "contribution-graph-legend-level-#{level}" },
        data: {
          ix: idx,
          date: day[:date].strftime("%Y-%M-%d"),
          level: level,
          # view_component: true
        },
        id: "contribution-day-component-#{idx}",
        class: "ContributionCalendar-day level-#{level}",
        style: "width: 10px",
      )
    end.join("\n    ")
    output += "\n  </tr>\n"
  end
  output += "</tbody></table>"
  output
end

# grouped_by_year = data.group_by { |entry| Date.parse(entry["date"]).year }
data.keys.each do |year|
  contributions = Array.new(7) { [] }
  (1..365).each do |day|
    date = Date.new(year, 1, 1) + day - 1
    dow = date.wday
    contributions[dow] << { date: date, entry: data[year].find { |entry| entry["date"] == date.to_s } }
  end
  map = contribution_map(contributions, id: year)
  File.open("./_includes/contribution-map-#{year}.html", 'w') { |file| file.write(map) }
end
end_date = Date.today
start_date = end_date.prev_year.next_day

## Iterate each day from last year to today
contributions = Array.new(7) { [] }
(start_date..end_date).each do |date|
  dow = date.wday
  year = date.year
  contributions[dow] << { date: date, entry: data[year].find { |entry| entry["date"] == date.to_s } }
end
map = contribution_map(contributions, id: '365d', show: true)
File.open("./_includes/contribution-map-365d.html", 'w') { |file| file.write(map) }
