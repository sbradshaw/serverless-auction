import { v4 as uuid } from "uuid";
import createError from "http-errors";
import config from "../../config";
import { IAuction } from "../interfaces/IAuction";
import { DynamoDB } from "aws-sdk";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default (io: { db: { call: any } }): any => ({
  createAuction: async (data: {
    title: string;
  }): Promise<IAuction | undefined> => {
    const { title } = data;
    const now = new Date();
    const endDate = new Date();
    endDate.setHours(now.getHours() + config.expiryOffset);

    const auction: IAuction = {
      id: uuid(),
      title,
      status: "open",
      createdAt: now.toISOString(),
      endingAt: endDate.toISOString(),
      highestBid: {
        amount: "0"
      }
    };
    const params: DynamoDB.DocumentClient.PutItemInput = {
      TableName: config.tableName,
      Item: auction
    };

    try {
      await io.db.call("put", params);
    } catch (error) {
      throw new createError.InternalServerError(error);
    }

    return auction;
  },
  getAuctions: async (queryStringParams: {
    status: string;
  }): Promise<Array<IAuction> | undefined> => {
    const { status } = queryStringParams;
    const params: DynamoDB.DocumentClient.QueryInput = {
      TableName: config.tableName,
      IndexName: "statusAndEndDate",
      KeyConditionExpression: "#status = :status",
      ExpressionAttributeValues: {
        ":status": status
      },
      ExpressionAttributeNames: {
        "#status": "status"
      }
    };

    let result: { Items: IAuction[] | PromiseLike<IAuction[]> };

    try {
      result = await io.db.call("query", params);
    } catch (error) {
      throw new createError.InternalServerError(error);
    }

    return result.Items;
  },
  getAuction: async (pathParams: {
    id: string;
  }): Promise<IAuction | undefined> => {
    const { id } = pathParams;
    const params: DynamoDB.DocumentClient.GetItemInput = {
      TableName: config.tableName,
      Key: { id }
    };
    let result: { Item: IAuction | PromiseLike<IAuction> };

    try {
      result = await io.db.call("get", params);
    } catch (error) {
      throw new createError.InternalServerError(error);
    }

    if (!result.Item) {
      throw new createError.NotFound(`Auction item with id: ${id} not found`);
    }

    return result.Item;
  },
  placeBid: async (
    pathParams: { id: string },
    data: { amount: string }
  ): Promise<IAuction | undefined> => {
    const { id } = pathParams;
    const { amount } = data;
    const params: DynamoDB.DocumentClient.UpdateItemInput = {
      TableName: config.tableName,
      Key: { id },
      UpdateExpression: "set highestBid.amount = :amount",
      ExpressionAttributeValues: {
        ":amount": amount
      },
      ReturnValues: "ALL_NEW"
    };

    const auction = await io.db.call("get", {
      TableName: config.tableName,
      Key: { id }
    });

    if (!auction.Item) {
      throw new createError.NotFound(`Auction item with id: ${id} not found`);
    }

    if (auction.Item.status === "closed") {
      throw new createError.Forbidden(`You cannot bid on closed auction items`);
    }

    if (parseInt(amount) <= parseInt(auction.Item.highestBid.amount)) {
      throw new createError.Forbidden(
        `The bid must be higher than ${auction.Item.highestBid.amount}`
      );
    }

    const result = await io.db.call("update", params);

    return result;
  },
  getEndedAuctions: async (): Promise<Array<IAuction> | undefined> => {
    const now = new Date();
    const params = {
      TableName: config.tableName,
      IndexName: "statusAndEndDate",
      KeyConditionExpression: "#status = :status AND endingAt <= :now",
      ExpressionAttributeValues: {
        ":status": "open",
        ":now": now.toISOString()
      },
      ExpressionAttributeNames: {
        "#status": "status"
      }
    };
    let result: { Items: IAuction[] | PromiseLike<IAuction[]> };

    try {
      result = await io.db.call("query", params);
    } catch (error) {
      throw new createError.InternalServerError(error);
    }

    return result.Items;
  },
  closeAuction: async (data: { id: string }): Promise<IAuction | undefined> => {
    const { id } = data;
    let result: { Item: IAuction | PromiseLike<IAuction> };

    const params = {
      TableName: config.tableName,
      Key: { id },
      UpdateExpression: "set #status = :status",
      ExpressionAttributeValues: {
        ":status": "closed"
      },
      ExpressionAttributeNames: {
        "#status": "status"
      }
    };

    try {
      result = await io.db.call("update", params);
    } catch (error) {
      throw new createError.InternalServerError(error);
    }

    return result.Item;
  }
});
