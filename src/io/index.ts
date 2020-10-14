import { DynamoDB } from "aws-sdk";
import config from "../../config";

const dbClient: DynamoDB.DocumentClient = new DynamoDB.DocumentClient({
  region: config.dbRegion,
});

export const dynamo = {
  call: async (action: string, params: any) => {
    return await dbClient[action](params).promise();
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
