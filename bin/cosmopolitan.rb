#!/Users/merovex/.rvm/rubies/ruby-3.1.2/bin/ruby

require 'feedjira'
require 'reverse_markdown'
require 'time'
require 'httparty'
require 'fileutils'
require 'yaml'
require 'mini_magick'
require 'awesome_print'

# Replace with your Atom feed URL
atom_url = 'https://world.hey.com/benwilson/feed.atom'
posts_dir = "_posts"

def download_and_convert_image(image_url, destination_dir)
  # Extract the filename and create a new AVIF filename
  filename = File.basename(URI.parse(image_url).path)
  avif_filename = "#{filename.split('.').first}.avif"

  # Define the paths
  download_path = File.join(destination_dir, filename)
  avif_path = File.join(destination_dir, avif_filename)

  if File.exist?(avif_path)
    puts " .. Skipping #{avif_filename} as it already exists"
    return avif_filename
  end

  # Download the image
  File.open(download_path, 'wb') do |file|
    file.write(HTTParty.get(image_url).body)
  end

  # Convert the image to AVIF format
  image = MiniMagick::Image.open(download_path)
  image.format 'avif'
  image.write(avif_path)

  # Clean up the original image file
  FileUtils.rm(download_path)

  # Return the new AVIF filename
  avif_filename
end

def fetch_and_convert(atom_url, posts_dir)
  inventory = inventory_posts(posts_dir)
  cleanup_list = []
  # Fetch the Atom feed
  feed = Feedjira.parse(HTTParty.get(atom_url).body)

  feed.entries.each do |entry|
    # Convert the entry content to Markdown
    content_md = ReverseMarkdown.convert(entry.content.gsub(/<h1/, '<h2').gsub(/<\/h1>/, '</h2>'))

    # Format the date and title for the Jekyll filename
    uid = entry.url.split('-').last
    date = entry.published.strftime('%Y-%m-%d')
    title_slug = entry.title.downcase.strip.gsub(' ', '-').gsub(/[^\w-]/, '')
    filename = "#{posts_dir}/#{date}-#{title_slug}-#{uid}.md"

    metadata = {
      'layout': 'post',
      'title': entry.title.gsub('"', '\"'),
      'date': entry.published,
      'uid': uid,
      'redirect_from': []
    }

    if inventory.key?(uid)
      old_filename = inventory[uid]
      frontmatter = YAML.load_file(old_filename, permitted_classes: [Time])
      metadata['redirect_from'] = frontmatter['redirect_from'] || []
      metadata['redirect_from'] << old_filename.gsub(posts_dir, '').gsub('.md', '')
      metadata['redirect_from'].flatten!
      metadata['redirect_from'].uniq!
      # remove current filename from redirect_from to avoid recursive redirects.
      metadata['redirect_from'].delete(filename.gsub(posts_dir, '').gsub('.md', ''))
      # delete old file now that we have the redirect_from
      FileUtils.rm(old_filename) unless old_filename == filename
    end

    content_md.scan(/\!\[.*?\]\((.*?)\)/).each do |match|
      image_url = match.first
      next unless image_url

      # raise match.inspect

      # Define your images directory path
      images_dir = './assets/images/posts'
      FileUtils.mkdir_p(images_dir) unless Dir.exist?(images_dir)

      # Download and convert the image
      new_image_filename = download_and_convert_image(image_url, images_dir)

      # Replace the image URL in the content with the new path
      new_image_path = "/assets/images/posts/#{new_image_filename}"
      content_md.sub!(/\[!\[([^\]]*?)\]\(.*?\)\]\(.*?\s*".+?"\)/) do
        image_alt_text = Regexp.last_match[1]
        "<figure>\n<img src='#{new_image_path}' alt='#{image_alt_text}'>\n<figcaption>#{image_alt_text}</figcaption>\n</figure>"
      end
    end

    # Write to a Jekyll file
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
