Frontend website of [StellarExpertId](../README.MD) signer. Provides a user-friendly interface for key management and operation intents.

## Installation and configuration

#### System requirements

- Node.JS v8.6.0+ for assets compilation. 
- Any web server that allows static files hosting.

#### Assets compilation

```
npm i
npm run build
```

#### Configuration

Default configuration is stored in [default-config.json](./default-config.json).

```
{
  "apiEndpoint": "http://localhost:4021",
  "salt":"yUqz1t6ilWUn75lgjtbv",
  "networks": {
    "public": {
      "explorer": "https://stellar.expert/explorer/public/",
      "horizon": "https://horizon.stellar.org"
    },
    "testnet": {
      "explorer": "https://stellar.expert/explorer/testnet/",
      "horizon": "https://horizon-testnet.stellar.org"
    }
  }
}
```

- `apiEndpoint` specifies the address of backend server vault for encrypted accounts.
- `salt` is a cryptographic salt for account sensitive data encryption.
- `networks` section contains known Stellar networks and horizon endpoints.

Configuration parameters may be overridden in `default-config.json` before the compilation or using runtime `window.clientConfig`.  

#### Deployment

Copy `./public` directory contents to the website root. 

