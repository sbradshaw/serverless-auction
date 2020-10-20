import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import httpJsonBodyParser from "@middy/http-json-body-parser";

export default (handler: any) =>
  middy(handler).use([httpErrorHandler(), httpJsonBodyParser()]);
