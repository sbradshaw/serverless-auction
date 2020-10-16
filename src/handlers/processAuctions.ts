import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import { HttpStatusCode } from "../enums/status";
import service from "../domain/service";
import io from "../io";

const processAuctions: APIGatewayProxyHandler = async (_context) => {
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
};

export const handler = processAuctions;
