import { v4 as uuid } from "uuid";
import config from "../../config";
import createError from "http-errors";

export default (io: any) => ({
  createAuction: async (data: { title: any }) => {
    const { title } = data;
    const now = new Date();
    const endDate = new Date();
    endDate.setHours(now.getHours() + config.expiryOffset);

    const auction = {
      id: uuid(),
      title,
      status: "open",
      createdAt: now.toISOString(),
      endingAt: endDate.toISOString(),
      highestBid: {
        amount: 0,
      },
    };
    const params = {
      TableName: config.tableName,
      Item: auction,
    };

    try {
      await io.db.put(params);
    } catch (error) {
      console.log(error);
      throw new createError.InternalServerError(error);
    }

    return auction;
  },
  getAuctions: async (queryStringParams: { status: any }) => {
    const { status } = queryStringParams;
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
    let auctions: { Items: any };

    try {
      auctions = await io.db.query(params);
    } catch (error) {
      console.log(error);
      throw new createError.InternalServerError(error);
    }

    return auctions.Items;
  },
  getAuction: async (pathParams: { id: any }) => {
    const { id } = pathParams;
    const params = {
      TableName: config.tableName,
      Key: { id },
    };
    let auction: { Item: any };

    try {
      auction = await io.db.get(params);
    } catch (error) {
      console.log(error);
      throw new createError.InternalServerError(error);
    }

    if (!auction) {
      throw new createError.NotFound(`Auction item with id: ${id} not found`);
    }

    return auction.Item;
  },
  placeBid: async (pathParams: { id: any }, data: { amount: any }) => {
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

    const auction = await io.db.get({
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
      auctionUpdate = await io.db.update(params);
    } catch (error) {
      console.log(error);
      throw new createError.InternalServerError(error);
    }

    return auctionUpdate;
  },
  getEndedAuctions: async () => {
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
    let auctions: { Items: any };

    try {
      auctions = await io.db.query(params);
    } catch (error) {
      console.log(error);
      throw new createError.InternalServerError(error);
    }

    return auctions.Items;
  },
  closeAuction: async (data: { id: any }) => {
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
      closedAuctionItems = await io.db.update(params);
    } catch (error) {
      console.log(error);
      throw new createError.InternalServerError(error);
    }

    return closedAuctionItems;
  },
});
