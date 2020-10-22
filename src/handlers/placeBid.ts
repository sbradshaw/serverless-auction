import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import validator from "@middy/validator";
import commonMiddleware from "../lib/commonMiddleware";
import { HttpStatusCode } from "../enums/status";
import service from "../domain/service";
import io from "../io";
import placeBidSchema from "../schemas/placeBidSchema";

const placeBid: APIGatewayProxyHandler = async (event) => {
  const pathParams = io.handler.pathParams(event);
  const input = io.handler.input(event);
  const result = await service(io).placeBid(pathParams, input);

  return io.handler.returnSuccess(result, HttpStatusCode.OK);
};

export const handler = commonMiddleware(placeBid).use(
  validator({ inputSchema: placeBidSchema })
);
