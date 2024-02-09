#!/Users/merovex/.rvm/rubies/ruby-3.1.2/bin/ruby

require 'find'

def convert_to_avif(input_path)
  # Remove the extension and add .convert_to_avif
  output_path = input_path.gsub(File.extname(input_path),'.avif')
  return if File.exists?(output_path)
  system("magick convert '#{input_path}' -quality 40 '#{output_path}'")
  return output_path
end

def crawl_directory(directory)
  directory ||= 'assets/images/'
  Find.find(directory) do |path|
    next if File.directory?(path) # Skip directories
    o_size = size(path)

    case File.extname(path).downcase
    when '.jpg', '.jpeg', '.png'
      npath = convert_to_avif(path)
      next if npath.nil?
      n_size = size(npath)
      reduction = ((o_size - n_size) / o_size) * 100
      puts "Converted: #{File.basename(path)} .. #{o_size} => #{size(npath)} = #{reduction.round(3)}%"
    end
  end
end

def size(path)
  (File.size(path).to_f / 2**20).round(3) # Convert bytes to megabytes
end

crawl_directory('/Users/merovex/Code/merovex/benwilson.io/assets/')
