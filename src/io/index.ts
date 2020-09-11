import { DynamoDB } from "aws-sdk";
import config from "../../config";
import createError from "http-errors";

const dbClient: DynamoDB.DocumentClient = new DynamoDB.DocumentClient({
  region: config.dbRegion,
});

export const dynamo = {
  put: async (data: any) => {
    const params = {
      TableName: config.tableName,
      Item: data,
    };

    try {
      await dbClient.put(params).promise();
    } catch (error) {
      console.log(error);
      throw new createError.InternalServerError(error);
    }
  },
  scan: async () => {
    let result: any;
    const params = {
      TableName: config.tableName,
    };

    try {
      result = await dbClient.scan(params).promise();
    } catch (error) {
      console.log(error);
      throw new createError.InternalServerError(error);
    }

    return result;
  },
  get: async (key: any) => {
    let result: any;
    const params = {
      TableName: config.tableName,
      Key: key,
    };

    try {
      result = await dbClient.get(params).promise();
    } catch (error) {
      console.log(error);
      throw new createError.InternalServerError(error);
    }

    if (!result) {
      throw new createError.NotFound(
        `Auction item with id: ${key.id} not found`
      );
    }

    return result;
  },
};

export const handler = {
  input: (x: any) => JSON.parse(x.body),
  parameters: (x: any) => x.pathParameters,
  returnSuccess: (x: any, status: number) => ({
    statusCode: status,
    body: JSON.stringify(x),
  }),
};

export default {
  handler: handler,
  db: dynamo,
};
