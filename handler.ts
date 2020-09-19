import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import { HttpStatusCode } from "./src/enums/status";
import service from "./src/domain/service";
import io from "./src/io";
import createError from "http-errors";

export const createAuction: APIGatewayProxyHandler = async (
  event,
  _context
) => {
  const input = io.handler.input(event);
  const result = await service(io).createAuction(input);

  return io.handler.returnSuccess(result, HttpStatusCode.CREATED);
};

export const getAuctions: APIGatewayProxyHandler = async (_context) => {
  const result = await service(io).getAuctions();

  return io.handler.returnSuccess(result, HttpStatusCode.OK);
};

export const getAuction: APIGatewayProxyHandler = async (event, _context) => {
  const parameters = io.handler.parameters(event);
  const result = await service(io).getAuction(parameters);

  return io.handler.returnSuccess(result, HttpStatusCode.OK);
};

export const placeBid: APIGatewayProxyHandler = async (event, _context) => {
  const parameters = io.handler.parameters(event);
  const input = io.handler.input(event);
  const result = await service(io).placeBid(parameters, input);

  return io.handler.returnSuccess(result, HttpStatusCode.OK);
};

export const processAuctions: APIGatewayProxyHandler = async (_context) => {
  try {
    const endedAuctions = await service(io).getEndedAuctions();

    await Promise.all(
      endedAuctions.map(
        async (auction: any) => await service(io).closeAuction(auction)
      )
    );

    return io.handler.returnSuccess(
      `ended auctions: ${endedAuctions.length}`,
      HttpStatusCode.OK
    );
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }
};
