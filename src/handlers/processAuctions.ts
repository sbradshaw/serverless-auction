import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import { HttpStatusCode } from "../enums/status";
import service from "../domain/service";
import io from "../io";
import createError from "http-errors";

const processAuctions: APIGatewayProxyHandler = async (_context) => {
  try {
    const endedAuctions = await service(io).getEndedAuctions();

    await Promise.all(
      endedAuctions.map(
        async (auction: any) => await service(io).closeAuction(auction),
      ),
    );

    return io.handler.returnSuccess(
      `ended auctions: ${endedAuctions.length}`,
      HttpStatusCode.OK,
    );
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }
};

export const handler = processAuctions;
