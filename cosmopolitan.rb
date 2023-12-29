#!/Users/merovex/.rvm/rubies/ruby-3.1.2/bin/ruby

require 'feedjira'
require 'reverse_markdown'
require 'time'
require 'httparty'
require 'fileutils'
require 'yaml'

# Replace with your Atom feed URL
atom_url = 'https://world.hey.com/benwilson/feed.atom'
posts_dir = "_posts"

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
