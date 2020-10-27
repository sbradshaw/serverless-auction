# Serverless Auction

Impelementation of an online auction application using AWS and Serverless Framework with TypeScript.

## Code style

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

## Tech/framework used

<b>Built with</b>

- [Serverless Framework](https://www.serverless.com)
- [Amazon Web Services](https://aws.amazon.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Jest](https://jestjs.io/)

## Features

API endpoing implemented as Lambda services to add, update, and retrieve auction items.

## Installation

Ensure you have AWS credentials installed on the local development machine.

```
# Under ~/.aws a credentials file similar to this (serverless-admin is an account created in IAM for this example). Replace the keys with your own examples.

[default]
aws_access_key_id=<YOUR-ACCESS-KEY>
aws_secret_access_key=<YOUR-SECRET-ACCESS-KEY>

[serverless-admin]
aws_access_key_id=YOUR-ACCESS-KEY>
aws_secret_access_key=<YOUR-SECRET-ACCESS-KEY>
```

Install Serverless Framwork globally

```
npm install -g serverless
```

Deploy the services to AWS using Serverless Framework

```
npm run deploy
```

## Development endpoints

Sucessfull deployment should display the available endpoints.

| Service          | Function      | Local endpoint                                                                      |
| ---------------- | ------------- | ----------------------------------------------------------------------------------- |
| Create Auction   | createAuction | POST - https://l3dy4zqr25.execute-api.eu-west-1.amazonaws.com/dev/auction           |
| Get Auction      | getAuctions   | GET - https://l3dy4zqr25.execute-api.eu-west-1.amazonaws.com/dev/auctions           |
| Get All Auctions | getAuction    | GET - https://l3dy4zqr25.execute-api.eu-west-1.amazonaws.com/dev/auction/{id}       |
| Place Bid        | placeBid      | PATCH - https://l3dy4zqr25.execute-api.eu-west-1.amazonaws.com/dev/auction/{id}/bid |

## Tests

Running unit tests

```
npm run test
```

Running unit tests with code coverage

```
npm run test:ci
```

Run linting on the project files

```
npm run lint
```

## How to use?

Deploy the full application stack to AWS

```
npm run deploy
```

Deploy a single lambda function to AWS

```
# Deploy the createAuctions function/handler to AWS

FUNCTION=getAuctions npm run deploy-fn
```

Run a function/handler remotely on AWS invoking local mock events

```
# Invoke the createAuctions function/handler remotely with local mock events

FUNCTION=getAuctions npm run mock-fn
```

Run a function/handler locally invoking local mock events

```
# Invoke the createAuctions function/handler locally with local mock events

FUNCTION=getAuctions npm run mock-fn-local
```

Tail the logs of a remote AWS function/handler

```
# Tail the remote AWS CloudWatch logs for the createAuctions function/handler

FUNCTION=getAuctions npm run tail-fn
```

## Blueprint

Overview diagram of Serverless Auction AWS cloud architecture

<p align="center">
  <img src="./img/serverless-auction-3d.png" alt="Blueprint of Serverless Auction" width="900">
</p>

## License

A short snippet describing the license (MIT, Apache etc)

MIT © [S Bradshaw]()
