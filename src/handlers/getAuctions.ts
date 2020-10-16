import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import validator from "@middy/validator";
import commonMiddleware from "../lib/commonMiddleware";
import { HttpStatusCode } from "../enums/status";
import service from "../domain/service";
import io from "../io";
import getAuctionsSchema from "../schemas/getAuctionsSchema";

const getAuctions: APIGatewayProxyHandler = async (event, _context) => {
  const queryStringParams = io.handler.queryStringParams(event);
  const result = await service(io).getAuctions(queryStringParams);

  return io.handler.returnSuccess(result, HttpStatusCode.OK);
};

export const handler = commonMiddleware(getAuctions)
  .use(validator({ inputSchema: getAuctionsSchema }));
