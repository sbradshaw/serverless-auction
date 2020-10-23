import { describe, expect } from "@jest/globals";
import service from "../domain/service";
import { IAuction } from "../interfaces/IAuction";
import fixtures from "./__fixtures__/auction.json";

describe("Domain Service getAuction", () => {
  let mockedFunction: jest.Mock;
  let io: { db: { call: jest.Mock } };
  let input: { id: string };
  let item: IAuction;
  let errorResult: string;

  beforeEach(async () => {
    mockedFunction = jest.fn().mockImplementation(() => {
      return {
        Item: <IAuction>fixtures.closedAuction
      };
    });

    io = {
      db: {
        call: mockedFunction
      }
    };

    input = {
      id: "46fbacd1-e0c3-4514-8dbc-69e0e3c21dfa"
    };

    await service(io).getAuction(input);
    item = mockedFunction.mock.results[0].value.Item;
  });

  it("should have the expected auction mocked call length", async () => {
    expect(mockedFunction.mock.calls).toHaveLength(1);
  });

  it("should have the expected auction id", async () => {
    const id = "67890";

    expect(item.id).toEqual(id);
  });

  it("should have the expected auction title", async () => {
    const title = "Auction Item";

    expect(item.title).toEqual(title);
  });

  it("should have the expected auction created and ending date", async () => {
    const created = "2020-10-20T00:40:59.865Z";
    const ending = "2020-10-20T01:40:59.865Z";

    expect(item.createdAt).toEqual(created);
    expect(item.endingAt).toEqual(ending);
  });

  it("should have the expected auction status set to closed", async () => {
    expect(item.status).toEqual("closed");
    expect(item.status).not.toEqual("open");
  });

  it("should have a highest bid amount", async () => {
    expect(item.highestBid.amount).toEqual("42");
  });

  it("should throw InternalServerError on get auction item failure", async () => {
    const mockedFunctionError = jest.fn(() => {
      throw Error("DynamoDB Error: Get Auction Item");
    });

    io = {
      db: {
        call: mockedFunctionError
      }
    };

    try {
      await service(io).getAuction(input);
    } catch (error) {
      errorResult = error.toString();
    }

    expect(errorResult).toContain("InternalServerError");
  });

  it("should throw a NotFoundError when an auction item is not found", async () => {
    const mockedFunctionError = jest.fn(() => {
      return {};
    });

    io = {
      db: {
        call: mockedFunctionError
      }
    };

    try {
      await service(io).getAuction(input);
    } catch (error) {
      errorResult = error.toString();
    }

    expect(errorResult).toBe(
      `NotFoundError: Auction item with id: ${input.id} not found`
    );
  });
});
