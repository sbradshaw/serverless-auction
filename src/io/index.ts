import { DynamoDB } from "aws-sdk";
import config from "../../config";
import createError from "http-errors";

const dbClient: DynamoDB.DocumentClient = new DynamoDB.DocumentClient({
  region: config.dbRegion,
});

export const dynamo = {
  put: async (data: any) => {
    const params = {
      TableName: "auctions-table",
      Item: data,
    };

    try {
      await dbClient.put(params).promise();
    } catch (error) {
      console.log(error);
      throw new createError.InternalServerError(error);
    }
  },
};

export const handler = {
  input: (x: any) => JSON.parse(x.body),
  returnSuccess: (x: any, status: number) => ({
    statusCode: status,
    body: JSON.stringify(x),
  }),
};

export default {
  handler: handler,
  db: dynamo,
};
