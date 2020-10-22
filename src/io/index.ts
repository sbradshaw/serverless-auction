import { DynamoDB } from "aws-sdk";
import config from "../../config";

const dbClient: DynamoDB.DocumentClient = new DynamoDB.DocumentClient({
  region: config.dbRegion,
});

export const dynamo = {
  call: async (action: string, params: unknown) => {
    return await dbClient[action](params).promise();
  },
};

export const handler = {
  input: (event: { body: any }) => event.body,
  pathParams: (event: { pathParameters: any }) => event.pathParameters,
  queryStringParams: (event: { queryStringParameters: any }) =>
    event.queryStringParameters,
  returnSuccess: (result: any, status: number) => ({
    statusCode: status,
    body: JSON.stringify(result),
  }),
};

export default {
  handler: handler,
  db: dynamo,
};
