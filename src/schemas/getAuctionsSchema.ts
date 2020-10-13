const schema = {
  properties: {
    queryStringParameters: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["open", "closed"],
          default: "open",
        },
      },
    },
  },
  required: [
    "queryStringParameters",
  ],
};

export default schema;
