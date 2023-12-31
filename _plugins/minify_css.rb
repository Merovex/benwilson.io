Jekyll::Hooks.register :site, :post_write do |site|
  puts 'Minifying CSS...'
  system("npm run minify")
end
