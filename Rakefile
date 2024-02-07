require 'securerandom'
# Define a Rake task for creating a new Jekyll post
namespace :blog do
  desc 'Create a new Jekyll post'
  task :new, [:title] do |_, args|
    title = args[:title]
    date = Time.now.strftime('%Y-%m-%d')
    uuid = SecureRandom.uuid.split('-').first
    filename = "_posts/#{date}-#{title.downcase.gsub(/\s+/, '-')}-#{uuid}.md"

    abort("#{filename} already exists!") if File.exist?(filename)

    # Create a new post file with default front matter
    File.open(filename, 'w') do |file|
      file.puts '---'
      file.puts 'layout: post'
      file.puts "title: #{title}"
      file.puts "date: #{date}T00:00:00Z"
      file.puts "uid: #{uuid}"
      file.puts 'redirect_from: []'
      file.puts 'categories: []'
      file.puts 'tags: []'
      file.puts '---'
    end

    puts "New post created: #{filename}"
  end
end
