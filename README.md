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

We have to inject the following code just like Ethereum:
```
(function() {
  var config = {
    address: "\(address)",
    network: "\(network)"
  };
  const bloctoProvider = new window.BloctoSolana(config);
  window.\(windowProperty) = bloctoProvider;
  window.bloctoProvider = bloctoProvider;
})();
```

The network is "mainnet-beta" or "devnet".

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

1. If no `id`, `sendResponse({ "id": 0, "error": "invalidRequest" })`
2. If no `method`, `sendResponse({ "id": id, "error": "invalidRequest" })`

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
- Request
```
{
  "id": <int>,
  "method": "connect"
}
```
- Response
```
{
  "id": <int>,
  "params": {
    "publicKey": <string>
  }
}
```
- Error
1. If no accounts (not enabled), `sendResponse( "id": id, "error": "noAccounts")` // app presents wallet enable panel
2. If user click close/cancel button, `sendResponse( "id": id, "error": "cancelled")`
3. other unexpected behavior `sendResponse({ "id": id, "error": "internal"})`

#### disconnect
- Request
```
{
  "id": <int>
}
```
- Response
```
{
  "id": <int>
}
```
- Error
no error. please remember send response with id.

#### convertToProgramWalletTransaction
- Request
```
{
  "id": <int>,
  "params": {
    "message": <hex-string>
  }
}
```
- Response
```
{
  "id": <int>,
  "result": <hex-string> // raw-transaction-message
}
```
- Error
1. If no `message`, `sendResponse({ "id": id, "error": "invalidRequest" })`
2. If no network connection, `sendResponse({ "id": id, "error": "noNetworkConnection" })`
3. other unexpected behavior `sendResponse({ "id": id, "error": "internal" })`

#### signAndSendTransaction
- Request
```
{
  "id": <int>,
  "params": {
    "message": <hex-string>,
    "publicKeySignaturePairs": { // In most cases, it should be empty.
      <base-58>: <hex-string> // public key: signature
    },
    "isInvokeWrapped": <bool> // check if calling createTransaction or not.
  }
}
```
- Response
```
{
  "id": <int>,
  "result": <hex-string> // tx hash
}
```
- Error
1. If no `message` or `isInvokeWrapped`, `sendResponse({ "id": id, "error": "invalidRequest" })`
2. If no network connection, `sendResponse({ "id": id, "error": "noNetworkConnection" })`
3. If user click close/cancel button, `sendResponse({ "id": id, "error": "cancelled" })`
4. other unexpected behavior `sendResponse({ "id": id, "error": "internal" })`
