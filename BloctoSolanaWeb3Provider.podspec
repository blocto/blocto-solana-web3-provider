#
# Be sure to run `pod lib lint BloctoSolanaWeb3Provider.podspec' to ensure this is a
# valid spec before submitting.
#
# Any lines starting with a # are optional, but their use is encouraged
# To learn more about a Podspec see http://guides.cocoapods.org/syntax/podspec.html
#

Pod::Spec.new do |s|
  s.name             = 'BloctoSolanaWeb3Provider'
  s.version          = '0.1.0'
  s.summary          = 'Solana Web3 javascript wrapper provider for iOS and Android platforms.'

  s.description      = <<-DESC
  Solana Web3 javascript wrapper provider for iOS and Android platforms.
  The magic behind the dApps browsers
                       DESC

  s.homepage         = 'https://github.com/portto/blocto-solana-web3-provider'
  s.license          = { :type => 'MIT', :file => 'LICENSE' }
  s.author           = { 'Scott' => 'scott@portto.io', 'portto dev' => 'dev@portto.io' }
  s.source           = { :git => 'https://github.com/portto/blocto-solana-web3-provider.git', :tag => s.version.to_s }
  s.social_media_url = 'https://twitter.com/bloctoapp'

  s.ios.deployment_target = '9.0'

  s.resource_bundles = {
    'BloctoSolanaWeb3Provider' => ['dist/blocto-solana-min.js']
  }
end
