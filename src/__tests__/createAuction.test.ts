import { describe, expect } from "@jest/globals";
import service from "../domain/service";
import { IAuction } from "../interfaces/IAuction";
import fixtures from "./__fixtures__/auction.json";

describe("Domain Service createAuction", () => {
  let mockedFunction: jest.Mock;
  let io: { db: { call: jest.Mock } };
  let input: { title: string };
  let value: IAuction;
  let errorResult: string;

  beforeEach(async () => {
    mockedFunction = jest.fn().mockImplementation(() => {
      return [<IAuction>fixtures.openAuction];
    });

    io = {
      db: {
        call: mockedFunction
      }
    };

    input = {
      title: "Auction Item"
    };

    await service(io).createAuction(input);
    value = mockedFunction.mock.results[0].value[0];
  });

  it("should have the expected auction mocked call length", async () => {
    expect(mockedFunction.mock.calls).toHaveLength(1);
  });

  it("should have the expected auction id", async () => {
    const id = "3d165f82-45d6-4fdc-be27-3c3e427aabf7";

    expect(value.id).toEqual(id);
  });

  it("should have the expected auction title", async () => {
    const title = "Auction Item";

    expect(value.title).toEqual(title);
  });

  it("should have the expected auction created and ending date", async () => {
    const created = "2020-10-19T18:57:39.770Z";
    const ending = "2020-10-19T19:57:39.770Z";

    expect(value.createdAt).toEqual(created);
    expect(value.endingAt).toEqual(ending);
  });

  it("should have the expected auction status initially set to open", async () => {
    expect(value.status).toEqual("open");
    expect(value.status).not.toEqual("closed");
  });

  it("should have a highest bid amount set to zero when created", async () => {
    expect(value.highestBid.amount).toEqual("0");
  });

  it("should throw InternalServerError on create a new auction item failure", async () => {
    const mockedFunctionError = jest.fn(() => {
      throw Error("DynamoDB Error: Put Auction Item");
    });

    io = {
      db: {
        call: mockedFunctionError
      }
    };

    try {
      await service(io).createAuction(input);
    } catch (error) {
      errorResult = error.toString();
    }

    expect(errorResult).toContain("InternalServerError");
  });
});
