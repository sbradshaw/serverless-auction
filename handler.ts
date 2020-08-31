import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import { v4 as uuid } from "uuid";
import { DynamoDB } from "aws-sdk";
import config from "./config";

const dbClient: DynamoDB.DocumentClient = new DynamoDB.DocumentClient({
  region: config.dbRegion,
});

export const createAuction: APIGatewayProxyHandler = async (
  event,
  _context
) => {
  const { title } = JSON.parse(event.body);
  const now = new Date();
  const auction = {
    id: uuid(),
    title,
    status: "open",
    createdAt: now.toISOString(),
  };

  await dbClient
    .put({
      TableName: "auctions-table",
      Item: auction,
    })
    .promise();

  return {
    statusCode: 201,
    body: JSON.stringify(auction),
  };
};
