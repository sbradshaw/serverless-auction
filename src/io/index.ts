import { AWSError, DynamoDB } from "aws-sdk";
import config from "../../config";
import { PromiseResult } from "aws-sdk/lib/request";

const dbClient: DynamoDB.DocumentClient = new DynamoDB.DocumentClient({
  region: config.dbRegion,
});

export const dynamo = {
  put: async (params: DynamoDB.DocumentClient.PutItemInput) => {
    await dbClient.put(params).promise();
  },
  query: async (params: DynamoDB.DocumentClient.QueryInput) => {
    let result: PromiseResult<DynamoDB.DocumentClient.QueryOutput, AWSError>;

    result = await dbClient.query(params).promise();
    return result;
  },
  get: async (params: DynamoDB.DocumentClient.GetItemInput) => {
    let result: PromiseResult<DynamoDB.DocumentClient.GetItemOutput, AWSError>;

    result = await dbClient.get(params).promise();
    return result;
  },
  update: async (params: DynamoDB.DocumentClient.UpdateItemInput) => {
    let result: PromiseResult<
      DynamoDB.DocumentClient.UpdateItemOutput,
      AWSError
    >;

    result = await dbClient.update(params).promise();
    return result.Attributes;
  },
};

export const handler = {
  input: (event: { body: string }) => JSON.parse(event.body),
  pathParams: (event: { pathParameters: any }) => event.pathParameters,
  queryStringParams: (event: { queryStringParameters: any }) =>
    event.queryStringParameters,
  returnSuccess: (x: any, status: number) => ({
    statusCode: status,
    body: JSON.stringify(x),
  }),
};

export default {
  handler: handler,
  db: dynamo,
};
