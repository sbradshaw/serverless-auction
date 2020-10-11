import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import { HttpStatusCode } from "../enums/status";
import service from "../domain/service";
import io from "../io";

const placeBid: APIGatewayProxyHandler = async (event, _context) => {
  const pathParams = io.handler.pathParams(event);
  const input = io.handler.input(event);
  const result = await service(io).placeBid(pathParams, input);

  return io.handler.returnSuccess(result, HttpStatusCode.OK);
};

export const handler = placeBid;
