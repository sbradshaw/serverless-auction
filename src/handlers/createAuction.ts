import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import validator from "@middy/validator";
import commonMiddleware from "../lib/commonMiddleware";
import { HttpStatusCode } from "../enums/status";
import service from "../domain/service";
import io from "../io";
import createAuctionSchema from "../schemas/createAuctionSchema";

const createAuction: APIGatewayProxyHandler = async (event) => {
  const result = await service(io).createAuction(event.body);

  return {
    statusCode: HttpStatusCode.CREATED,
    body: JSON.stringify(result)
  };
};

export const handler = commonMiddleware(createAuction).use(
  validator({ inputSchema: createAuctionSchema })
);
