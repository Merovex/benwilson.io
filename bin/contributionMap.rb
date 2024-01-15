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

def weeks_by_month(start_date, end_date)

  # Initialize a hash to store the month and the number of weeks
  month_weeks_count = Hash.new(0)

  # Iterate through each week
  while start_date <= end_date
    # Get the Sunday of the current week
    sunday = start_date - start_date.wday

    # Get the month of the current Sunday
    month = sunday.strftime('%b')

    # Increment the count for the month
    month_weeks_count[month] += 1

    # Move to the next week
    start_date += 7
  end

  # Convert the hash to an array of hashes as specified
  month_weeks_count.map { |month, count| [month, count] }
end

def add_contribution(day, index)
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
      # ix: week.first[:date].strftime("%U").to_i + 1,
      date: day[:date].strftime("%Y-%m-%d"),
      level: level
    },
    class: "ContributionCalendar-day level-#{level} relative",
    tabindex: 0,
    style: "width: 10px",
  ) do
    content_tag(:div, entry, role: "tooltip", class: 'tooltip' )
  end
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

  output += "<thead>\n"
  output += "  <tr>\n"
  weeks_by_month(contributions.last.first[:date], contributions.last.last[:date]).each do |month|
    output += content_tag(:th, month.first, class: 'text-xs font-medium text-gray-600 dark:text-gray-300', colspan: month.last)
  end
  output += "\n  </tr>\n"
  output += "</thead>\n"

  output += "<tbody>\n"
  contributions.each do |week|
    output += "  <tr style='height:10px'>\n"
    index = 0

    output += week.map do |day|
      index +=1
      if day[:date].nil?
         "    <td style='width: 10px'></td>\n"
      else
        add_contribution(day, index)
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
  offset = Date.new(year, 1, 1).wday
  offset.times do |day|
    contributions[day] << { date: nil, entry: nil }
  end
  # raise [year, offset, contributions].inspect
  365.times do |day|
    date = Date.new(year, 1, 1) + day
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
