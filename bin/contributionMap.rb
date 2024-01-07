#!/Users/merovex/.rvm/rubies/ruby-3.1.2/bin/ruby

require 'securerandom'
require 'json'
require 'date'
require 'awesome_print'
require 'action_view'
require 'bigdecimal'
# require 'number_to_human'
include ActionView::Helpers::TagHelper
include ActionView::Helpers::NumberHelper
include ActionView::Context

file_path = './assets/wordcount.json'

# Read the JSON file
file = File.read(file_path)

# Parse the JSON file into a Ruby array of objects
data = JSON.parse(file).group_by { |entry| Date.parse(entry["date"]).year }

def contribution_map(contributions, **args)
  sessions = contributions.flatten.count { |day| day[:entry] }
  wordcount = contributions.flatten.sum { |day| day[:entry] ? day[:entry]["count"] : 0 }
  average = (wordcount / sessions).to_i unless sessions.zero?
  #Jdata-target="toggle-calendar.calendar" data-calendar-name="365d"
  # raise args.inspect
  output = "<h2>#{number_with_delimiter wordcount} words across #{sessions} days in #{args[:id] == '365d' ? 'the last year' : args[:id]} <span class='text-sm'>(~#{average} per session)</span></h2>"
  output += "<table class='ContributionCalendar-grid' style='border-spacing: 3px; overflow: hidden; position: relative'>"
  output += content_tag(:caption, 'Contribution Graph', class: 'sr-only')
  # output += content_tag(:thead)
  output += "<tbody>\n"
  contributions.each do |week|
    idx = week.first[:date].strftime("%U").to_i + 1
    output += "  <tr style='height:10px'>\n"
    # <td tabindex="0" data-ix="32" aria-selected="false" aria-describedby="contribution-graph-legend-level-0" style="width: 10px" data-date="2023-08-15" id="contribution-day-component-2-32" data-level="0" role="gridcell" data-view-component="true" class="ContributionCalendar-day" aria-labelledby="tooltip-05d687bc-d40d-417c-8b89-466ffcee8989"></td>
    index = 0
    output += week.map do |day|
      index +=1
      level = day[:entry] ? day[:entry]["level"] : 0
      level = 4 if level > 4
      level = 0 if level < 0

      entry = if day[:entry]
        "#{day[:entry]['count']} words on #{day[:date].strftime("%B %-d")}.}"
      else
        "No words on #{day[:date].strftime("%B %-d")}."
      end
      tooltip_tag = "contribution-day-component-#{day[:date].wday}-#{index}"
      [content_tag(:tooltip, entry,
          id: "tooltip-#{SecureRandom.uuid}",
          for: tooltip_tag,
          popover: "manual",
          class: 'sr-only position-absolute',
          data: {
            direction: "n",
            type: "label",
            action: 'mouseover->calendar-graph#show_tooltip mouseout->calendar-graph#hide_tooltip'
          }
      ),
      content_tag(:td, '',
        tabindex: 0, aria: { selected: false, describedby: "contribution-graph-legend-level-#{level}" },
        data: {
          ix: idx,
          date: day[:date].strftime("%Y-%m-%d"),
          level: level,
          # view_component: true
        },
        id: tooltip_tag,
        class: "ContributionCalendar-day level-#{level}",
        style: "width: 10px",
      )].join("\n    ")
      # <td tabindex="0" data-ix="51" aria-selected="false" aria-describedby="contribution-graph-legend-level-1" style="width: 10px" data-date="2023-12-30" id="contribution-day-component-6-51" data-level="1" role="gridcell" data-view-component="true" class="ContributionCalendar-day"></td>
      # <tool-tip id="tooltip-78e3ca70-9ef4-43ea-87f3-a18c498151b3" for="contribution-day-component-6-51" popover="manual" data-direction="n" data-type="label" data-view-component="true" class="sr-only position-absolute">5 contributions on December 30th.</tool-tip>
    end.join("\n    ")
    output += "\n  </tr>\n"
  end
  output += "</tbody></table>"
  # output
  "<div class='contribution-map #{args[:show] ? '' : 'hidden'}' data-calendar-graph-target='calendar' data-calendar-graph-name='#{args[:id]}'>#{output}</div>"
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
