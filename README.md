# Codius Host MVP
> Minimal implementation of a Codius host

Running Codius Host MVP allows you to experiment with [Codius](https://codius.org/) on
your machine. It's updated to use Interledger payments with
[HTTP-ILP](https://github.com/interledger/rfcs/blob/master/0014-http-ilp/0014-http-ilp.md#http-ilp).

For a complete explanation of Codius, go to [codius.org](https://codius.org/).

## Usage

Use [ILP Curl](https://github.com/interledgerjs/ilp-curl) to pay a Codius host to run
your code. The following code assumes that you're running Codius host on port 8002.
It uses the `example_manifest.json` file in the root of this repository.

```sh
npm install -g ilp-curl
ilp-curl -X POST local.codius.org:8002/start --json --data @example_manifest.json
```

You'll get the following response:

```json
{
  "expiry": "2017-11-11T01:27:59.876Z",
  "expiryHuman": "in an hour",
  "manifestHash": "ced14b8b019f2f548bbe2c309d5dd9edc45346a6f4e3f260e2a3ef38f14c9ee2",
  "url": "http://z3iuxcybt4xvjc56fqyj2xoz5xcfgrvg6tr7eyhcupxtr4kmt3ra.local.codius.org:8002/"
}
```

Now go to the URL that was given. `example_manifest.json` uploads an empty nginx server,
so you'll see the nginx welcome page.

```sh
open "http://z3iuxcybt4xvjc56fqyj2xoz5xcfgrvg6tr7eyhcupxtr4kmt3ra.local.codius.org:8002/"
```

You've just deployed your first codius smart contract!

## Setup

Get some credentials from the [XRP
testnet](https://ripple.com/build/xrp-test-net/) (Other ledgers are available).

```sh
export CODIUS_ILP_PLUGIN=ilp-plugin-xrp-escrow
export CODIUS_ILP_CREDENTIALS='{"server":"wss://s.altnet.rippletest.net:51233","secret":"s...."}'
export CODIUS_PORT=8002
export DEBUG=ilp*,koa*
node index.js
```

## Manifest

The manifest file format specifies how to deploy a contract to codius.

```json
{
  "manifest": {
    "environment": {
      "HELLO": "world"
    },
    "port": 8080,
    "image": "ubuntu",
    "command": [ "bash", "-c", "echo $HELLO" ]
  }
}
```

- `manifest` - contains all the relevant details to deploy this contract. The
  fields are hashed together with canonical JSON so anyone can verify what code is running.

- `environment` - a map of environment variables to be passed into this contract

- `port` - a subdomain derived from the manifest hash is proxied to this port.

- `image` - docker image to run as the codius contract

- `command` - (optional) command to be run in place of the docker image's usual command.

## Example Contracts

Feel free to submit pull requests to this section, showing off any Codius
contracts you've written!

- [Crontract](https://github.com/sharafian/crontract), A Codius service that auto-deploys your task to Codius, on a repeat.
- [Twittius](https://github.com/sharafian/twittius), A service accepts payment to tweet a message of your choosing.
- [Twilius](https://github.com/sharafian/twilius), A service that accepts payment to send an SMS with Twilio
