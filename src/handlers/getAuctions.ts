import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import { HttpStatusCode } from "../enums/status";
import service from "../domain/service";
import io from "../io";

const getAuctions: APIGatewayProxyHandler = async (event, _context) => {
  const queryStringParams = io.handler.queryStringParams(event);
  const result = await service(io).getAuctions(queryStringParams);

  return io.handler.returnSuccess(result, HttpStatusCode.OK);
};

export const handler = getAuctions;
