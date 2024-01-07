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

def contribution_tooltip()

end

def contribution_map(contributions, **args)
  sessions = contributions.flatten.count { |day| day[:entry] }
  wordcount = contributions.flatten.sum { |day| day[:entry] ? day[:entry]["count"] : 0 }
  average = (wordcount / sessions).to_i unless sessions.zero?
  #Jdata-target="toggle-calendar.calendar" data-calendar-name="365d"
  # raise args.inspect
  output = "<h2>#{number_with_delimiter wordcount} words across #{sessions} days in #{args[:id] == '365d' ? 'the last year' : args[:id]} <span class='text-sm'>(~#{average} per session)</span></h2>"
  output += "<div class='max-w-2xl overflow-x-scroll'><table class='ContributionCalendar-grid max-w-2xl' style='border-spacing: 3px; overflow: hidden; position: relative'>"
  output += content_tag(:caption, 'Contribution Graph', class: 'sr-only')
  # output += content_tag(:thead)
  output += "<tbody>\n"
  contributions.each do |week|
    idx = week.first[:date].strftime("%U").to_i + 1
    output += "  <tr style='height:10px'>\n"
    index = 0
    output += week.map do |day|
      index +=1
      level = day[:entry] ? day[:entry]["level"] : 0
      level = 4 if level > 4
      level = 0 if level < 0

      entry = if day[:entry]
        "#{day[:entry]['count']} words on #{day[:date].strftime("%B %-d")}."
      else
        "No words on #{day[:date].strftime("%B %-d")}."
      end
      tooltip_tag = "contribution-day-component-#{day[:date].wday}-#{index}"
      content_tag(:td,
        aria: { selected: false, describedby: "contribution-graph-legend-level-#{level}" },
        data: {
          ix: idx,
          date: day[:date].strftime("%Y-%m-%d"),
          level: level
        },
        class: "ContributionCalendar-day level-#{level} relative",
        tabindex: 0,
        style: "width: 10px",
      ) do
        content_tag(:div, entry, role: "tooltip", class: 'tooltip' )
      end
    end.join("\n    ")
    output += "\n  </tr>\n"
  end
  output += "</tbody></table></div>"
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
