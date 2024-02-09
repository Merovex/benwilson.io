require 'feedjira'
require 'reverse_markdown'
require 'time'
require 'httparty'
require 'fileutils'
require 'yaml'
require 'mini_magick'
require 'awesome_print'
require 'securerandom'
require 'find'
# Define a Rake task for creating a new Jekyll post
desc 'Push code to GitHub'
task :release do
  # `./bin/countScrivenerHistory.rb`
  # `./bin/contributionMap.rb`
  `git commit -am "Updating website content"`
  `git push origin master`
end

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

    puts filename
  end

  desc 'Import from Hey World'
  task :fetch do

    atom_url = 'https://world.hey.com/benwilson/feed.atom'
    posts_dir = "_posts"

    def download_and_convert_image(image_url, destination_dir)
      filename = File.basename(URI.parse(image_url).path)
      avif_filename = "#{filename.split('.').first}.avif"

      download_path = File.join(destination_dir, filename)
      avif_path = File.join(destination_dir, avif_filename)

      if File.exist?(avif_path)
        puts " .. Skipping #{avif_filename} as it already exists"
        return avif_filename
      end

      File.open(download_path, 'wb') do |file|
        file.write(HTTParty.get(image_url).body)
      end

      image = MiniMagick::Image.open(download_path)
      image.format 'avif'
      image.write(avif_path)

      FileUtils.rm(download_path)

      avif_filename
    end

    def fetch_and_convert(atom_url, posts_dir)
      inventory = inventory_posts(posts_dir)

      feed = Feedjira.parse(HTTParty.get(atom_url).body)

      feed.entries.each do |entry|
        content_md = ReverseMarkdown.convert(entry.content.gsub(/<h1/, '<h2').gsub(/<\/h1>/, '</h2>'))

        uid = entry.url.split('-').last
        date = entry.published.strftime('%Y-%m-%d')
        title_slug = entry.title.downcase.strip.gsub(' ', '-').gsub(/[^\w-]/, '')
        filename = "#{posts_dir}/#{date}-#{title_slug}-#{uid}.md"

        metadata = {
          'layout' => 'post',
          'title' => entry.title.gsub('"', '\"'),
          'date' => entry.published,
          'uid' => uid,
          'redirect_from' => []
        }

        if inventory.key?(uid)
          old_filename = inventory[uid]
          frontmatter = YAML.load_file(old_filename, permitted_classes: [Time])
          metadata['redirect_from'] = frontmatter['redirect_from'] || []
          metadata['redirect_from'] << old_filename.gsub(posts_dir, '').gsub('.md', '')
          metadata['redirect_from'].flatten!
          metadata['redirect_from'].uniq!
          metadata['redirect_from'].delete(filename.gsub(posts_dir, '').gsub('.md', ''))
          FileUtils.rm(old_filename) unless old_filename == filename
        end

        content_md.scan(/\!\[.*?\]\((.*?)\)/).each do |match|
          image_url = match.first
          next unless image_url

          images_dir = './assets/images/posts'
          FileUtils.mkdir_p(images_dir) unless Dir.exist?(images_dir)

          new_image_filename = download_and_convert_image(image_url, images_dir)
          new_image_path = "/assets/images/posts/#{new_image_filename}"
          content_md.sub!(/\[!\[([^\]]*?)\]\(.*?\)\]\(.*?\s*".+?"\)/) do
            image_alt_text = Regexp.last_match[1]
            "<figure>\n<img src='#{new_image_path}' alt='#{image_alt_text}'>\n<figcaption>#{image_alt_text}</figcaption>\n</figure>"
          end
        end

        File.open(filename, 'w') do |file|
          file.puts metadata.transform_keys(&:to_s).to_yaml
          file.puts "---"
          file.puts content_md
        end

        puts "Generated: #{filename}"
      end
    end

    def inventory_posts(posts_dir)
      inventory = {}
      posts = Dir.glob("#{posts_dir}/*.md")
      posts.each { |post| inventory[File.basename(post, '.md').split('-').last] = post }
      inventory
    end

    fetch_and_convert(atom_url, posts_dir)
  end
end
# lib/tasks/image_conversion.rake

namespace :images do
  desc 'Convert images to AVIF format'
  task :avif, [:directory] do |t, args|
    require 'find'

    def convert_to_avif(input_path)
      output_path = input_path.gsub(File.extname(input_path), '.avif')
      return if File.exist?(output_path)
      system("magick convert '#{input_path}' -quality 40 '#{output_path}'")
      output_path
    end

    def crawl_directory(directory)
      Find.find(directory) do |path|
        next if File.directory?(path) # Skip directories
        o_size = size(path)

        case File.extname(path).downcase
        when '.jpg', '.jpeg', '.png'
          npath = convert_to_avif(path)
          next if npath.nil?
          n_size = size(npath)
          reduction = ((o_size - n_size) / o_size.to_f) * 100
          puts "Converted: #{File.basename(path)} .. #{o_size}MB => #{n_size}MB = #{reduction.round(3)}%"
        end
      end
    end

    def size(path)
      (File.size(path).to_f / 2**20).round(3) # Convert bytes to megabytes
    end

    directory = args[:directory] || 'assets/'
    crawl_directory(directory)
  end
end
