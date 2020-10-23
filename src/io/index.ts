import { DynamoDB } from "aws-sdk";
import config from "../../config";

const dbClient: DynamoDB.DocumentClient = new DynamoDB.DocumentClient({
  region: config.dbRegion
});

export const dynamo = {
  call: async (action: string, params: unknown): Promise<unknown> => {
    return await dbClient[action](params).promise();
  }
};

export default {
  db: dynamo
};
