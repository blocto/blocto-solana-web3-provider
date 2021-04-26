# BloctoSolanaWeb3Provider

## How to Identify Blocto Provider

If blocto provider injected properly `isBlocto` will be `true`

```javascript
window.solana.isBlocto
```

## Installation

### iOS

#### CocoaPods
```
source 'https://github.com/CocoaPods/Specs.git'
platform :ios, '10.0'
use_frameworks!

target 'MyApp' do
  pod 'BloctoSolanaWeb3Provider', '0.1.0', :git => 'https://github.com/portto/blocto-solana-web3-provider'
end
```

## App Implementataion

### Request Format
```
{
  "id": <int>,
  "method": <string>,
  ...
}
```

### Response Format

Please call `sendResponse` func with json string.

#### Successful Response
```
{
  "id": <int>,
  ...
}
```

#### Error Response
```
{
  "id": <int>,
  "error": <string>
}
```

### Methods

#### connect 
Req:
```
{
  "id": <int>,
  "method": "connect"
}
```
Resp:
```
{
  "id": <int>,
  "params": {
    "publicKey": <string>
  }
}
```

#### disconnect
Req:
```
{
  "id": <int>
}
```
Resp:
```
{
  "id": <int>
}
```

#### convertToProgramWalletTransation
Req:
```
{
  "id": <int>,
  "params": {
    "message": <hex-string>
  }
}
```
Resp:
```
{
  "id": <int>,
  "result": <hex-string> // raw-transaction-message
}
```

#### signAndSendTransaction
Req:
```
{
  "id": <int>,
  "params": {
    "message": <hex-string>,
    "signatures": [<hex-string>] // In most cases, it should be empty array.
  }
}
```
Resp:
```
{
  "id": <int>,
  "result": <hex-string> // tx hash
}
```
