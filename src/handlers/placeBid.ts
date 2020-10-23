import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import validator from "@middy/validator";
import commonMiddleware from "../lib/commonMiddleware";
import { HttpStatusCode } from "../enums/status";
import service from "../domain/service";
import io from "../io";
import placeBidSchema from "../schemas/placeBidSchema";

const placeBid: APIGatewayProxyHandler = async (event) => {
  const result = await service(io).placeBid(event.pathParameters, event.body);

  return {
    statusCode: HttpStatusCode.OK,
    body: JSON.stringify(result)
  };
};

export const handler = commonMiddleware(placeBid).use(
  validator({ inputSchema: placeBidSchema })
);
