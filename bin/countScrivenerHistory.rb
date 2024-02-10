#!/Users/merovex/.rvm/rubies/ruby-3.1.2/bin/ruby
# frozen_string_literal: true

require 'date'
require 'csv'
require 'yaml'
# require 'awesome_print'
require 'json'
require 'securerandom'

class Date
  def beginning_of_week
    date = self - (self.wday - 1)
    date -= 7 if self.wday == 0
    date
  end

  def end_of_week
    date = self.beginning_of_week + 6
  end
end

now = Date.today

TODAY = now.to_s
TEN_DAYS_AGO = (now - 10).to_s
YEAR_AGO = (now - 364).to_s

LAST_WEEK = [
  now.beginning_of_week - 7,
  now.end_of_week - 7,
]
THIS_WEEK = [
  now.beginning_of_week,
  now.end_of_week,
]
# ap [LAST_WEEK, THIS_WEEK]
# puts 'good'
# exit

asset_dir = '/Users/merovex/Code/merovex/benwilson.io/assets/'
dashboard_dir = '/Users/merovex/Code/merovex/benwilson.io/_data/'
scrivener_json = "#{dashboard_dir}/scrivener.json"
dashboard_file = "#{dashboard_dir}/dashboard.json"
heatmap_file = "#{dashboard_dir}/heatmap.json"
annual_svg_file = "#{dashboard_dir}/annual.svg"
text_file = '/Users/merovex/Code/merovex/benwilson.io/today.log'
veriklo_file = '/Users/merovex/Code/verkilo-editor/journal.yaml'

history = {}
dashboard = {
  current_year: 0,
  current_week: 0,
  last_week: 0,
  weekly_annual: {},
  annual: {},
  ten_day_average: 0,
  graph_last: {},
  graph_current: {}
}
years = []
heatmap = {'365d' => {}}
# heatmap = {[]}

def fnord; end

def parse_xml(file)
  # <Day dwc="1877" dcc="10370" dtwc="6498" owc="0" occ="0" dtcc="35983" s="1250" st="w">2022-12-17</Day>
  File.readlines(file).map do |line|
    next unless line.include?('<Day')

    {date: line.match(/>([\w-]+)<\//)[1]}.merge(line.scan(/(\w+)="([\w-]+)"/).map { |k, v| [k.to_sym, v.to_i] }.to_h)
  end.compact
end

def populate_hash(day); end

def get_level(dwc, goal)
  goal = 1250 if goal.zero? || goal.nil?
  return 5 if dwc > goal

  (dwc.to_f / goal * 4).ceil
end

# Get all the 'writing.history' files in the Documents directory
files = Dir.glob('/Users/merovex/Documents/**/writing.history').map do |f|
  f unless f.include?('NOCOUNT')
end.compact

mersk = {}
verkilo = []

def slug(date)
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  timestamp = Date.parse(date).strftime('%s').to_i.to_s(16)
  random_chars = ''
  5.times do
    random_chars += characters[rand(characters.length)]
  end
  slug = timestamp + random_chars
  return slug
end

# puts 'Parsing Files'
files.each do |file|
  project = File.basename(file.gsub('Files/writing.history', '')).gsub('.scriv', '')
  mersk[project] = [] unless mersk.key?(project)
  # puts "Parsing #{project}"

  parse_xml(file).each do |day|
    mersk[project] << day
    date = day[:date]
    years << date[0..3]
    adwc = (day.key?(:dcc) ? (day[:dcc] / 5) : 0)
    verki = {
      'date' => DateTime.parse(date).new_offset(0).strftime('%Y-%m-%dT%H:%M:%S.%LZ'),
      'count' => 0,
      'comment' => project,
      'slug' => slug(date),
    }

    unless history.key?(date)
      history[date] = {
        totals: { dwc: 0, dcc: 0, adwc: 0, owc: 0, occ: 0, dtwc: 0, dtcc: 0, s: 0, st: 'w' }, level: 0
      }
    end
    next if history[date].key?(project)

    history[date][project] = {
      project: project,
      file: file,
      st: day[:st].to_s || 'w',
      adwc: adwc.to_i
    }
    %i[dwc dcc owc occ dtwc dtcc s].each do |key|
      history[date][project][key] = day.key?(key) ? day[key] : 0
      verki['count'] += day[key] if key == :dwc
    end
    # puts verki.inspect
    verkilo << verki unless verki['count'].zero?
  end
end

# Total the writing history.
history.each_key do |date|
  last_project = nil
  history[date].each_key do |project|
    next if project.to_s == 'totals' || project.to_s == 'level'
    next if history[date].key?(last_project) && history[date][last_project][:dwc] == history[date][project][:dwc]

    %i[dwc dcc adwc owc occ dtwc dtcc].each do |key|
      history[date][:totals][key] += history[date][project][key] unless history[date][project][key].nil?
    end

    history[date][:totals][:s] = history[date][project][:s] || 1250
    history[date][:level] =
      get_level(history[date][:totals][:dwc], history[date][:totals][:s])

    last_project = project
  end
end

wc_json = [

]
history.each do |date, wordcount|
  wc_json << {
    # _id: SecureRandom.uuid,
    date: date,
    count: wordcount[:totals][:dwc],
    target: (wordcount[:totals][:s].zero?) ? 1250 : wordcount[:totals][:s],
    level: wordcount[:level],
    comment: ''
  }
  if date >= LAST_WEEK[0].to_s && date <= LAST_WEEK[1].to_s
    dashboard[:last_week] += wordcount[:totals][:dwc]
  end
  if date >= THIS_WEEK[0].to_s && date <= THIS_WEEK[1].to_s
    dashboard[:current_week] += wordcount[:totals][:dwc]
  end
  if date >= YEAR_AGO && date <= TODAY
    dashboard[:current_year] += wordcount[:totals][:dwc]
    heatmap['365d'][date] = {level: wordcount[:level], count: wordcount[:totals][:dwc]}
  end
end
# Year at a glance linegraph.
(Date.parse(YEAR_AGO)..Date.parse(TODAY)).each do |date|
  # Create key which is first day of the week.
  key = Date.commercial(date.year, date.cweek, 1).to_s
  dashboard[:weekly_annual][key] = 0 unless dashboard[:weekly_annual].key?(key)
  dashboard[:weekly_annual][key] += (history[date.to_s].nil?) ? 0 : history[date.to_s][:totals][:dwc]

  # Build annual linegraph
  dashboard[:annual][date.to_s] = (history[date.to_s].nil?) ? 0 : history[date.to_s][:totals][:dwc]
end
(LAST_WEEK[0]..LAST_WEEK[1]).each do |date|
  dashboard[:graph_last][date.to_s] = (history[date.to_s].nil?) ? 0 : history[date.to_s][:totals][:dwc]
end
(THIS_WEEK[0]..THIS_WEEK[1]).each do |date|
  dashboard[:graph_current][date.to_s] = (history[date.to_s].nil?) ? 0 : history[date.to_s][:totals][:dwc]
end
td_average = []
(Date.parse(TEN_DAYS_AGO)..Date.parse(TODAY)).each do |date|
  c = (history[date.to_s].nil?) ? nil : history[date.to_s][:totals][:dwc]
  # next if c < 100
  td_average << c
  # ten_day_average
end
td_average.compact!
# td_average.pop unless td_average.nil? || td_average.last > 100
dashboard[:ten_day_average] = td_average.sum / td_average.size unless td_average.nil? || td_average.empty?
# raise td_average.compact.inspect

years.uniq.each do |year|
  dashboard[year.to_sym] = 0
  history.each do |date, wordcount|
    heatmap[date[0..3]] = {} unless heatmap.key?(date[0..3])
    heatmap[date[0..3]][date] = wordcount[:level]

    if date[0..3] == year
      dashboard[year.to_sym] += wordcount[:totals][:dwc]
    end
  end
end
# ap heatmap
# ap dashboard

# Save the writing history to a file
# # pretty_generate
# File.open(dashboard_file, 'w').write(JSON.generate(dashboard))
# File.open(heatmap_file, 'w').write(JSON.generate(heatmap))
# File.open(scrivener_json, 'w').write(JSON.pretty_generate(history.sort.to_h))
# File.open("#{dashboard_dir}/mersk.json", 'w').write(JSON.pretty_generate(mersk))
# File.open("#{dashboard_dir}/mersk.min.json", 'w').write(JSON.generate(mersk))
# File.open("#{dashboard_dir}/mersk.yaml", 'w').write(mersk.to_yaml)
#puts "writing #{veriklo_file}"
File.open(veriklo_file, 'w').write(verkilo.to_yaml)
File.open("#{asset_dir}/wordcount.json",'w').write(JSON.generate(wc_json))
# File.open("./assets/wordcount.csv",'w').write(JSON.generate(wc_json))
CSV.open("#{asset_dir}/wordcount.csv", "w") do |csv|
  # Write the header row
  csv << wc_json.first.keys

  # Write the data rows
  wc_json.each do |row|
    csv << row.values
  end
end


# File.open(text_file, 'w').write(history[TODAY][:totals][:dwc].to_i)
puts (history.key?(TODAY)) ? history[TODAY][:totals][:dwc].to_i : 'Get to work, slug. Zero'

def make_graph(points)
  start = calculateXY(points[0])
  result = "M #{start[:x]},#{start[:y]}\n"
  catmullRom2bezier(points).each do |point|
    result += "C #{point[0][:x]},#{point[0][:y]} #{point[1][:x]},#{point[1][:y]} #{point[2][:x]},#{point[2][:y]}\n"
  end
  result
end

def calculateXY(point, index = 0)
  point = [0,0] if point.nil?
  ans = { x: (index * @svg_x) + @pad[:x], y: @height - (point[1] * @svg_y) - @pad[:y] }
  ans
end

def catmullRom2bezier(punkte = [])
  points = [] # Convert punkte to x,y points
  puntos = [] # Create bezier points, points in Spanish
  punkte.each_with_index { |h, i| points << calculateXY(h, i) }

  j = punkte.length - 1

  points.each_with_index do |_point, i|
    p = [
      { x: points[[i - 1, 0].max][:x], y: points[[i - 1, 0].max][:y] },
      { x: points[i][:x], y: points[i][:y] },
      { x: points[[i + 1, j].min][:x], y: points[[i + 1, j].min][:y] },
      { x: points[[i + 1, j].min][:x], y: points[[i + 1, j].min][:y] }
    ]
    # Catmull-Rom to Cubic Bezier conversion matrix
    #    0       1       0       0
    #  -1/6      1      1/6      0
    #    0      1/6      1     -1/6
    #    0       0       1       0
    puntos << [
      { x: ((-p[0][:x] + 6 * p[1][:x] + p[2][:x]) / 6), y: ((-p[0][:y] + 6 * p[1][:y] + p[2][:y]) / 6) },
      { x: ((p[1][:x] + 6 * p[2][:x] - p[3][:x]) / 6), y: ((p[1][:y] + 6 * p[2][:y] - p[3][:y]) / 6) },
      { x: p[2][:x], y: p[2][:y] }
    ]
  end

  puntos
end

def buildGraphSvg(dictionary, color)
  @width = 200
  @height = 20
  @svg_x = (@width.to_f) / (dictionary.length * 1.1)
  @svg_y = (@height.to_f) / (dictionary.values.max * 1.1)
  @pad = { x: @svg_x, y: @svg_y }
  graph = <<-GRAPH
  <svg id="graph" xmlns="http://www.w3.org/2000/svg" class='w-full' width='200' height='30' viewbox="0 0 #{ @width * 1.5 } #{ @height }">
  <path fill="none" class='stroke-2 stroke-#{color}-900 dark:stroke-#{color}-300' d="#{ make_graph(dictionary) }" ></path>
  </svg>
  GRAPH
end

def initialize_heatmap(data, start_date, end_date, terms = 'words', title = 'title', key = 'year')
  @terms = terms
  # @title = title

  @start_date = (start_date.is_a? String) ? Date.parse(start_date) : start_date
  @end_date = (end_date.is_a? String) ? Date.parse(end_date) : end_date
  @week_index = 0
  @title = "#{title} #{key == 'year' ? "in #{@end_date.year}" : 'in the past 365 days'}"

  @years = (@start_date..@end_date).to_a.map { |date| date.strftime('%Y') }.uniq

  @total_count = 0  # should be the total annual count...

  @size = 10
  @padding = 2
  @offset = [25, 15]
  @height = ((@size + @padding) * 10 + (@offset[1])).to_i
  @width = ((@size + @padding) * 54 + (@offset[0])).to_i
  @data = set_heatmap_data(data)
end

def draw_day_cells
  (@start_date..@end_date).to_a.enum_for(:each_with_index).map do |date, idx|
    key = date.strftime('%Y-%m-%d')
    # Rails.logger.debug "day cell: #{@data[key]}" if @data[key]
    # puts @data[key].inspect
    data = { date: key, count: 0 }
    data[:count] = @data[key][:count] if @data[key]
    data[:level] = @data[key][:level] if @data[key]
    data[:tooltip] = "#{data[:count]} #{data[:terms]} on #{date.strftime('%d %B %Y')}" if (data[:count]).positive?
    day_rectangle(date, data, idx)
  end.join("\n")
end

  def draw_axes
    # months = %w[Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec]
    months = (@start_date..@end_date).to_a.map { |date| date.strftime('%b') }.uniq
    days = %w[Tue Thu Sat]
    month_axis = "<g class='calgraph-text calgraph-month-axis'>"

    month_axis += months.map do |m|
       "<text x='#{(@width / 13) * (months.index(m) + 1)}' y='20' text-anchor='middle' font-size='#{@size}'>#{m}</text>"
      end.join("\n")
    month_axis += "</g>"

    position = [4, 6, 8]
    week_axis = "<g class='calgraph-text calgraph-week-axis'>"
    week_axis += days.map do |d|
      "<text x='10' y='#{position[days.index(d)] * (@size + @padding)}' text-anchor='middle' font-size='#{@size}'>#{d}</text>"
      # tag.text(d, x: 10, y: position[days.index(d)] * (@size + @padding), "text-anchor": 'middle', "font-size": @size)
    end.join("\n")
    week_axis += "</g>"

    heatmap_key = <<-KEY
    <g class='calgraph-text calgraph-key'>
      <text x='#{@width - (@size + @padding) * 9}' y='#{@height - (5 + @padding)}' text-anchor='middle' font-size='#{@size}'>Less</text>
      <rect x='#{@width - (@size + @padding) * 8}' y='#{@height - (15 + @padding)}' rx='1' ry='1' width='#{@size}' height='#{@size}' stroke-width='1' class='calgraph-1'></rect>
      <rect x='#{@width - (@size + @padding) * 7}' y='#{@height - (15 + @padding)}' rx='1' ry='1' width='#{@size}' height='#{@size}' stroke-width='1' class='calgraph-2'></rect>
      <rect x='#{@width - (@size + @padding) * 6}' y='#{@height - (15 + @padding)}' rx='1' ry='1' width='#{@size}' height='#{@size}' stroke-width='1' class='calgraph-3'></rect>
      <rect x='#{@width - (@size + @padding) * 5}' y='#{@height - (15 + @padding)}' rx='1' ry='1' width='#{@size}' height='#{@size}' stroke-width='1' class='calgraph-4'></rect>
      <rect x='#{@width - (@size + @padding) * 4}' y='#{@height - (15 + @padding)}' rx='1' ry='1' width='#{@size}' height='#{@size}' stroke-width='1' class='calgraph-5'></rect>
      <text x='#{@width - (@size + @padding) * 2}' y='#{@height - (5 + @padding)}' text-anchor='middle' font-size='#{@size}'>More</text>
    </g>
KEY

    [month_axis, week_axis, heatmap_key].join("\n")
  end

  def day_rectangle(date, data, _idx = nil)
    css_class = case data[:level]
                when 5 then 'calgraph-5'
                when 4 then 'calgraph-4'
                when 3 then 'calgraph-3'
                when 2 then 'calgraph-2'
                else 'calgraph-1'
                end

    # woy = date.strftime('%W').to_i

    dow = date.strftime('%u').to_i
    @week_index += 1 if dow == 1
    woy = @week_index
    # Rails.logger.debug "-- data: #{data}" if (data[:count]).positive?
    # tag.rect(
    rectangle = <<~HEREDOC
      <rect rx="#{2}" ry="#{2}" width="#{@size}" height="#{@size}"
      stroke-width="#{1}" class="#{"#{css_class} calgraph-day"}"
      x="#{woy * (@size + @padding) + @offset[0]}" y="#{dow * (@size + @padding) + @offset[1]}"
      data-date="#{date.strftime('%Y-%m-%d')}"
      data-level="#{data[:level]}"
      data-count="#{data[:count]}"
      data-terms="#{@terms}"
      data-title="#{@title}"
      data-tooltip="#{data[:tooltip]}"
       />
    HEREDOC
    rectangle.gsub("\n", ' ')
  end

  def set_heatmap_data(entries = [])
    days = {}
    entries.each do |day,data|
      title = 'title'
      days[day] = data if days[day].nil?
    end
    days
  end
  def drawHeatmap(data,start_date,end_date)
    # ap data
    initialize_heatmap(data, start_date, end_date)
    graph = <<-GRAPH
      <svg id='' xmlns="http://www.w3.org/2000/svg" style='object-fit: contain' class='w-full heatmap' overflow="hidden" viewbox="0 0 #{@width} #{@height}">
        #{draw_day_cells}
        #{draw_axes}
      </svg>
    GRAPH
  end
  # ap

# File.open("#{asset_dir}/last_week.svg",'w').write(buildGraphSvg(dashboard[:graph_last], 'purple'))
# File.open("#{asset_dir}/current_week.svg",'w').write(buildGraphSvg(dashboard[:graph_current], 'blue'))
# File.open("#{asset_dir}/annual.svg",'w').write(buildGraphSvg(dashboard[:annual], 'amber'))
# File.open("#{asset_dir}/weekly_annual.svg",'w').write(buildGraphSvg(dashboard[:weekly_annual], 'amber'))
# File.open("#{asset_dir}/heatmap.svg",'w').write(drawHeatmap(heatmap['365d'],YEAR_AGO,TODAY ).gsub("\n", ' '))
