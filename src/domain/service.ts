import { v4 as uuid } from "uuid";
import createError from "http-errors";
import config from "../../config";
import { IAuction } from "../interfaces/IAuction";
import { DynamoDB } from "aws-sdk";

export default (io: { db: { call: any } }) => ({
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
        amount: "0",
      },
    };
    const params: DynamoDB.DocumentClient.PutItemInput = {
      TableName: config.tableName,
      Item: auction,
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
        ":status": status,
      },
      ExpressionAttributeNames: {
        "#status": "status",
      },
    };

    let auctions: { Items: IAuction[] | PromiseLike<IAuction[]> };

    try {
      auctions = await io.db.call("query", params);
    } catch (error) {
      throw new createError.InternalServerError(error);
    }

    return auctions.Items;
  },
  getAuction: async (pathParams: {
    id: string;
  }): Promise<IAuction | undefined> => {
    const { id } = pathParams;
    const params: DynamoDB.DocumentClient.GetItemInput = {
      TableName: config.tableName,
      Key: { id },
    };
    let auction: { Item: IAuction | PromiseLike<IAuction> };

    try {
      auction = await io.db.call("get", params);
    } catch (error) {
      throw new createError.InternalServerError(error);
    }

    if (!auction.Item) {
      throw new createError.NotFound(`Auction item with id: ${id} not found`);
    }

    return auction.Item;
  },
  placeBid: async (
    pathParams: { id: string },
    data: { amount: string }
  ): Promise<any | undefined> => {
    const { id } = pathParams;
    const { amount } = data;
    const params = {
      TableName: config.tableName,
      Key: { id },
      UpdateExpression: "set highestBid.amount = :amount",
      ExpressionAttributeValues: {
        ":amount": amount,
      },
      ReturnValues: "ALL_NEW",
    };
    let auctionUpdate: any;

    const auction = await io.db.call("get", {
      TableName: config.tableName,
      Key: { id },
    });

    if (auction.Item.status !== "open") {
      throw new createError.Forbidden(`You cannot bid on closed auction items`);
    }

    if (amount <= auction.Item.highestBid.amount) {
      throw new createError.Forbidden(
        `The bid must be higher than ${auction.Item.highestBid.amount}`
      );
    }

    try {
      auctionUpdate = await io.db.call("update", params);
    } catch (error) {
      console.log(error);
      throw new createError.InternalServerError(error);
    }

    return auctionUpdate.Attributes;
  },
  getEndedAuctions: async (): Promise<Array<IAuction> | undefined> => {
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
    let auctions: { Items: IAuction[] | PromiseLike<IAuction[]> };

    try {
      auctions = await io.db.call("query", params);
    } catch (error) {
      throw new createError.InternalServerError(error);
    }

    return auctions.Items;
  },
  closeAuction: async (data: { id: string }) => {
    const { id } = data;
    let closedAuctionItems: any;

    const params = {
      TableName: config.tableName,
      Key: { id },
      UpdateExpression: "set #status = :status",
      ExpressionAttributeValues: {
        ":status": "closed",
      },
      ExpressionAttributeNames: {
        "#status": "status",
      },
    };

    try {
      closedAuctionItems = await io.db.call("update", params);
    } catch (error) {
      console.log(error);
      throw new createError.InternalServerError(error);
    }

    return closedAuctionItems.Attributes;
  },
});
