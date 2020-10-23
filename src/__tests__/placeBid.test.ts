import { describe, expect } from "@jest/globals";
import service from "../domain/service";
import { IAuction } from "../interfaces/IAuction";
import fixtures from "./__fixtures__/auction.json";

describe("Domain Service placeBid", () => {
  let mockedFunction: jest.Mock;
  let io: { db: { call: jest.Mock } };
  let pathInput: { id: string };
  let dataInput: { amount: string };
  let item: IAuction;
  let errorResult: string;

  beforeEach(async () => {
    mockedFunction = jest.fn().mockImplementation(() => {
      return {
        Item: <IAuction>fixtures.openAuction
      };
    });

    io = {
      db: {
        call: mockedFunction
      }
    };

    pathInput = {
      id: "12345"
    };

    dataInput = {
      amount: "42"
    };

    await service(io).placeBid(pathInput, dataInput);
    item = mockedFunction.mock.results[0].value.Item;
  });

  it("should have the expected update auction mocked call length", async () => {
    expect(mockedFunction.mock.calls).toHaveLength(2);
  });

  it("should have the expected updated auction id", async () => {
    const id = "12345";

    expect(item.id).toEqual(id);
  });

  it("should throw DynamoDB Error on get auction item failure", async () => {
    const mockedFunctionError = jest.fn(() => {
      throw Error("DynamoDB Error: Update Auction Item");
    });

    io = {
      db: {
        call: mockedFunctionError
      }
    };

    try {
      await service(io).placeBid(pathInput, dataInput);
    } catch (error) {
      errorResult = error.toString();
    }

    expect(errorResult).toContain("Error: DynamoDB Error");
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
      await service(io).placeBid(pathInput, dataInput);
    } catch (error) {
      errorResult = error.toString();
    }

    expect(errorResult).toBe(
      `NotFoundError: Auction item with id: ${pathInput.id} not found`
    );
  });

  it("should return a Forbidden error when bidding on a closed auction item", async () => {
    const mockedFunctionError = jest.fn(() => {
      return {
        Item: <IAuction>fixtures.closedAuction
      };
    });

    io = {
      db: {
        call: mockedFunctionError
      }
    };

    try {
      await service(io).placeBid(pathInput, dataInput);
    } catch (error) {
      errorResult = error.toString();
    }

    expect(errorResult).toBe(
      `ForbiddenError: You cannot bid on closed auction items`
    );
  });

  it("should return a Forbidden error when the bid is less/equal to highest bid ", async () => {
    const highestBid = dataInput.amount;
    const mockedFunctionError = jest.fn(() => {
      return {
        Item: <IAuction>fixtures.openAuctionWithBid
      };
    });

    io = {
      db: {
        call: mockedFunctionError
      }
    };

    pathInput = {
      id: "77777"
    };

    dataInput = {
      amount: "41"
    };

    try {
      await service(io).placeBid(pathInput, dataInput);
    } catch (error) {
      errorResult = error.toString();
    }

    expect(errorResult).toBe(
      `ForbiddenError: The bid must be higher than ${highestBid}`
    );
  });
});
