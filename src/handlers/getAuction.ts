import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import commonMiddleware from "../lib/commonMiddleware";
import { HttpStatusCode } from "../enums/status";
import service from "../domain/service";
import io from "../io";

const getAuction: APIGatewayProxyHandler = async (event) => {
  const result = await service(io).getAuction(event.pathParameters);

  return {
    statusCode: HttpStatusCode.OK,
    body: JSON.stringify(result)
  };
};

export const handler = commonMiddleware(getAuction);
