import { describe, expect } from "@jest/globals";
import service from "../domain/service";
import { IAuction } from "../interfaces/IAuction";
import fixtures from "./__fixtures__/auction.json";

describe("Domain Service getEndedAuctions", () => {
  let mockedFunction: jest.Mock;
  let io: { db: { call: jest.Mock } };
  let items: Array<IAuction>;
  let errorResult: string;

  beforeEach(async () => {
    mockedFunction = jest.fn(() => {
      return {
        Items: fixtures.multipleAuctions
      };
    });

    io = {
      db: {
        call: mockedFunction
      }
    };

    await service(io).getEndedAuctions();
    items = mockedFunction.mock.results[0].value.Items;
  });

  it("should have the expected auction mocked call length", async () => {
    expect(mockedFunction.mock.calls).toHaveLength(1);
  });

  it("should have the expected number of closed auction array items", async () => {
    expect(items).toHaveLength(4);
  });

  it("should throw InternalServerError on closed auction items query failure", async () => {
    const mockedFunctionError = jest.fn(() => {
      throw Error("DynamoDB Error: Query Auction Items (Closed)");
    });

    io = {
      db: {
        call: mockedFunctionError
      }
    };

    try {
      await service(io).getEndedAuctions();
    } catch (error) {
      errorResult = error.toString();
    }

    expect(errorResult).toContain("InternalServerError");
  });
});
