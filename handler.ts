import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import { HttpStatusCode } from "./src/enums/status";
import service from "./src/domain/service";
import io from "./src/io";

export const createAuction: APIGatewayProxyHandler = async (
  event,
  _context
) => {
  const input = io.handler.input(event);
  const result = await service(io).createAuction(input);

  return io.handler.returnSuccess(result, HttpStatusCode.CREATED);
};
