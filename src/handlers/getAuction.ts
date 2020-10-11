import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import { HttpStatusCode } from "../enums/status";
import service from "../domain/service";
import io from "../io";

const getAuction: APIGatewayProxyHandler = async (event, _context) => {
  const pathParams = io.handler.pathParams(event);
  const result = await service(io).getAuction(pathParams);

  return io.handler.returnSuccess(result, HttpStatusCode.OK);
};

export const handler = getAuction;
