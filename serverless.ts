import { Serverless } from "serverless/aws";

const serverlessConfiguration: Serverless = {
  service: {
    name: "serverless-auction"
  },
  frameworkVersion: ">=1.72.0",
  custom: {
    webpack: {
      webpackConfig: "./webpack.config.js",
      includeModules: true
    }
  },
  plugins: ["serverless-webpack", "serverless-pseudo-parameters"],
  provider: {
    name: "aws",
    runtime: "nodejs12.x",
    memorySize: 256,
    region: "eu-west-1",
    stage: "${opt: stage, 'dev'}",
    iamRoleStatements: [
      {
        Effect: "Allow",
        Resource: [
          "arn:aws:dynamodb:#{AWS::Region}:#{AWS::AccountId}:table/auctions-table",
          "arn:aws:dynamodb:#{AWS::Region}:#{AWS::AccountId}:table/auctions-table/index/statusAndEndDate"
        ],
        Action: [
          "dynamoDb:Query",
          "dynamoDb:Scan",
          "dynamoDb:GetItem",
          "dynamoDb:PutItem",
          "dynamoDb:UpdateItem",
          "dynamoDb:DeleteItem"
        ]
      }
    ],
    apiGateway: {
      minimumCompressionSize: 1024
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1"
    }
  },
  resources: {
    Resources: {
      AuctionsTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: "auctions-table",
          BillingMode: "PAY_PER_REQUEST",
          AttributeDefinitions: [
            {
              AttributeName: "id",
              AttributeType: "S"
            },
            {
              AttributeName: "status",
              AttributeType: "S"
            },
            {
              AttributeName: "endingAt",
              AttributeType: "S"
            }
          ],
          KeySchema: [
            {
              AttributeName: "id",
              KeyType: "HASH"
            }
          ],
          GlobalSecondaryIndexes: [
            {
              IndexName: "statusAndEndDate",
              KeySchema: [
                {
                  AttributeName: "status",
                  KeyType: "HASH"
                },
                {
                  AttributeName: "endingAt",
                  KeyType: "RANGE"
                }
              ],
              Projection: {
                ProjectionType: "ALL"
              }
            }
          ]
        }
      }
    }
  },
  functions: {
    createAuction: {
      handler: "src/handlers/createAuction.handler",
      events: [
        {
          http: {
            method: "post",
            path: "/auction"
          }
        }
      ]
    },
    getAuctions: {
      handler: "src/handlers/getAuctions.handler",
      events: [
        {
          http: {
            method: "get",
            path: "/auctions"
          }
        }
      ]
    },
    getAuction: {
      handler: "src/handlers/getAuction.handler",
      events: [
        {
          http: {
            method: "get",
            path: "/auction/{id}"
          }
        }
      ]
    },
    placeBid: {
      handler: "src/handlers/placeBid.handler",
      events: [
        {
          http: {
            method: "patch",
            path: "/auction/{id}/bid"
          }
        }
      ]
    },
    processAuctions: {
      handler: "src/handlers/processAuctions.handler"
      // events: [
      //   {
      //     schedule: "rate(1 minute)",
      //   },
      // ],
    }
  }
};

module.exports = serverlessConfiguration;
