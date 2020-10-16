import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import validator from "@middy/validator";
import commonMiddleware from "../lib/commonMiddleware";
import { HttpStatusCode } from "../enums/status";
import service from "../domain/service";
import io from "../io";
import createAuctionSchema from "../schemas/createAuctionSchema";

const createAuction: APIGatewayProxyHandler = async (
  event,
  _context,
) => {
  const input = io.handler.input(event);
  const result = await service(io).createAuction(input);

  return io.handler.returnSuccess(result, HttpStatusCode.CREATED);
};

export const handler = commonMiddleware(createAuction)
  .use(validator({ inputSchema: createAuctionSchema }));
