Pod::Spec.new do |s|
  s.name         = "BitcoinModule"
  s.version      = "1.0.0"
  s.summary      = "Bitcoin native bridge module"
  s.homepage     = "https://github.com"
  s.license      = "MIT"
  s.author       = { "Author" => "author@domain.com" }
  s.platforms    = { :ios => "13.4" }
  s.source       = { :path => "." }
  s.source_files = "*.{h,m,swift}"
  s.dependency "React-Core"
  s.dependency "WalletCoreModule"
end

