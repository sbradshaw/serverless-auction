import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import { HttpStatusCode } from "../enums/status";
import service from "../domain/service";
import io from "../io";
import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import validator from "@middy/validator";
import getAuctionsSchema from "../schemas/getAuctionsSchema";

const getAuctions: APIGatewayProxyHandler = async (event, _context) => {
  const queryStringParams = io.handler.queryStringParams(event);
  const result = await service(io).getAuctions(queryStringParams);

  return io.handler.returnSuccess(result, HttpStatusCode.OK);
};

export const handler = middy(getAuctions)
  .use(validator({ inputSchema: getAuctionsSchema }))
  .use(httpErrorHandler());
