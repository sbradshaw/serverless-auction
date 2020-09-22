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
  update: async (key: any, amount: number) => {
    const params = {
      TableName: config.tableName,
      Key: key,
      UpdateExpression: "set highestBid.amount = :amount",
      ExpressionAttributeValues: {
        ":amount": amount,
      },
      ReturnValues: "ALL_NEW",
    };
    let updateResult: any;
    const auction = await dynamo.get(key);

    if (auction.Item.status !== "open") {
      throw new createError.Forbidden(`You cannot bid on closed auction items`);
    }

    if (amount <= auction.Item.highestBid.amount) {
      throw new createError.Forbidden(
        `The bid must be higher than ${auction.Item.highestBid.amount}`
      );
    }

    try {
      const result = await dbClient.update(params).promise();
      updateResult = result.Attributes;
    } catch (error) {
      console.log(error);
      throw new createError.InternalServerError(error);
    }

    return updateResult;
  },
  getEnded: async () => {
    let result: any;
    const now = new Date();
    const params = {
      TableName: config.tableName,
      IndexName: "statusAndEndDate",
      KeyConditionExpression: "#status = :status AND endingAt <= :now",
      ExpressionAttributeValues: {
        ":status": "open",
        ":now": now.toISOString(),
      },
      ExpressionAttributeNames: {
        "#status": "status",
      },
    };

    try {
      result = await dbClient.query(params).promise();
    } catch (error) {
      console.log(error);
      throw new createError.InternalServerError(error);
    }

    return result;
  },
  getByStatus: async (status: any) => {
    let result: any;
    const params = {
      TableName: config.tableName,
      IndexName: "statusAndEndDate",
      KeyConditionExpression: "#status = :status",
      ExpressionAttributeValues: {
        ":status": status,
      },
      ExpressionAttributeNames: {
        "#status": "status",
      },
    };

    try {
      result = await dbClient.query(params).promise();
    } catch (error) {
      console.log(error);
      throw new createError.InternalServerError(error);
    }

    return result;
  },
  close: async (key: any) => {
    let result: any;
    const params = {
      TableName: config.tableName,
      Key: key,
      UpdateExpression: "set #status = :status",
      ExpressionAttributeValues: {
        ":status": "closed",
      },
      ExpressionAttributeNames: {
        "#status": "status",
      },
    };

    try {
      result = await dbClient.update(params).promise();
    } catch (error) {
      console.log(error);
      throw new createError.InternalServerError(error);
    }

    return result;
  },
};

export const handler = {
  input: (event: any) => JSON.parse(event.body),
  parameters: (event: any) => event.pathParameters,
  queryParameters: (event: any) => event.queryStringParameters,
  returnSuccess: (x: any, status: number) => ({
    statusCode: status,
    body: JSON.stringify(x),
  }),
};

export default {
  handler: handler,
  db: dynamo,
};
