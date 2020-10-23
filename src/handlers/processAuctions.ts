import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import { HttpStatusCode } from "../enums/status";
import service from "../domain/service";
import io from "../io";

const processAuctions: APIGatewayProxyHandler = async () => {
  const endedAuctions = await service(io).getEndedAuctions();

  await Promise.all(
    endedAuctions.map(
      async (auction: { id: string }) => await service(io).closeAuction(auction)
    )
  );

  return {
    statusCode: HttpStatusCode.OK,
    body: `ended auctions: ${endedAuctions.length}`
  };
};

export const handler = processAuctions;
