import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import validator from "@middy/validator";
import commonMiddleware from "../lib/commonMiddleware";
import { HttpStatusCode } from "../enums/status";
import service from "../domain/service";
import io from "../io";
import getAuctionsSchema from "../schemas/getAuctionsSchema";

const getAuctions: APIGatewayProxyHandler = async (event) => {
  const result = await service(io).getAuctions(event.queryStringParameters);

  return {
    statusCode: HttpStatusCode.OK,
    body: JSON.stringify(result)
  };
};

export const handler = commonMiddleware(getAuctions).use(
  validator({ inputSchema: getAuctionsSchema })
);
