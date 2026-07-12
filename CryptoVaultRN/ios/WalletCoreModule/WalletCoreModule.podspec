Pod::Spec.new do |s|
  s.name         = "WalletCoreModule"
  s.version      = "1.0.0"
  s.summary      = "WalletCore native bridge module"
  s.homepage     = "https://github.com"
  s.license      = "MIT"
  s.author       = { "Author" => "author@domain.com" }
  s.platforms    = { :ios => "13.4" }
  s.source       = { :path => "." }
  s.source_files = "*.{h,m,swift}"
  s.dependency "React-Core"
  s.dependency "TrustWalletCore", "4.1.5"
end
