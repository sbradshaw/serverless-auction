import { DynamoDB } from "aws-sdk";
import config from "../../config";

const dbClient: DynamoDB.DocumentClient = new DynamoDB.DocumentClient({
  region: config.dbRegion,
});

export const dynamo = {
  put: async (data: any) => {
    const params = {
      TableName: "auctions-table",
      Item: data,
    };

    const res = await dbClient.put(params).promise();
    return res;
  },
};

export const handler = {
  input: (x: any) => JSON.parse(x.body),
  returnSuccess: (x: any) => ({
    statusCode: 201,
    body: JSON.stringify(x),
  }),
};

export default {
  handler: handler,
  db: dynamo,
};
