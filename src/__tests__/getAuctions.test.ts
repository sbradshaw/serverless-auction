import { describe, expect } from "@jest/globals";
import service from "../domain/service";
import { IAuction } from "../interfaces/IAuction";
import fixtures from "./__fixtures__/auction.json";

describe("Domain Service getAuctions", () => {
  let mockedFunction: jest.Mock;
  let io: { db: { call: jest.Mock } };
  let input: { status: string };
  let items: Array<IAuction>;
  let errorResult: string;

  beforeEach(async () => {
    mockedFunction = jest.fn().mockImplementation(() => {
      return {
        Items: fixtures.multipleAuctions
      };
    });

    io = {
      db: {
        call: mockedFunction
      }
    };

    input = {
      status: "closed"
    };

    await service(io).getAuctions(input);
    items = mockedFunction.mock.results[0].value.Items;
  });

  it("should have the expected auction mocked call length", async () => {
    expect(mockedFunction.mock.calls).toHaveLength(1);
  });

  it("should have the expected number of auction array items", async () => {
    expect(items).toHaveLength(4);
  });

  it("should have the expected auction id for the first array item", async () => {
    const id = "11111";

    expect(items[0].id).toEqual(id);
  });

  it("should throw InternalServerError on auction items query failure", async () => {
    const mockedFuntionError = jest.fn(() => {
      throw Error("DynamoDB Error: Query Auction Items");
    });

    io = {
      db: {
        call: mockedFuntionError
      }
    };

    try {
      await service(io).getAuctions(input);
    } catch (error) {
      errorResult = error.toString();
    }

    expect(errorResult).toContain("InternalServerError");
  });

  describe("First Auction Item", () => {
    it("should have the expected first auction item title", async () => {
      const title = "Closed Auction Item 1";

      expect(items[0].title).toEqual(title);
    });

    it("should have the expected first auction item created and ending date", async () => {
      const created = "2020-10-15T16:20:07.445Z";
      const ending = "2020-10-15T17:20:07.445Z";

      expect(items[0].createdAt).toEqual(created);
      expect(items[0].endingAt).toEqual(ending);
    });

    it("should have the expected first auction item status set to closed", async () => {
      expect(items[0].status).toEqual("closed");
      expect(items[0].status).not.toEqual("open");
    });

    it("should have a highest bid amount matching the first auction item", async () => {
      expect(items[0].highestBid.amount).toEqual("0");
    });
  });

  describe("Last Auction Item", () => {
    it("should have the expected last auction item title", async () => {
      const title = "Closed Auction Item 4";

      expect(items[3].title).toEqual(title);
    });

    it("should have the expected last auction item created and ending date", async () => {
      const created = "2020-10-16T18:33:31.920Z";
      const ending = "2020-10-16T19:33:31.920Z";

      expect(items[3].createdAt).toEqual(created);
      expect(items[3].endingAt).toEqual(ending);
    });

    it("should have the expected last auction item status set to closed", async () => {
      expect(items[3].status).toEqual("closed");
      expect(items[3].status).not.toEqual("open");
    });

    it("should have a highest bid amount matching the last auction item", async () => {
      expect(items[3].highestBid.amount).toEqual("49");
    });
  });
});
