import { v4 as uuid } from "uuid";

export default (io: any) => ({
  createAuction: async (data: any) => {
    const { title } = data;
    const now = new Date();
    const auction = {
      id: uuid(),
      title,
      status: "open",
      createdAt: now.toISOString(),
      highestBid: {
        amount: 0,
      },
    };

    await io.db.put(auction);
    return auction;
  },
  getAuctions: async () => {
    let auctions: any;

    auctions = await io.db.scan();
    return auctions.Items;
  },
  getAuction: async (parameters: any) => {
    const { id } = parameters;
    let auction: any;

    auction = await io.db.get({ id });
    return auction.Item;
  },
  placeBid: async (parameters: any, data: any) => {
    const { id } = parameters;
    const { amount } = data;
    let auctionUpdate: any;

    auctionUpdate = await io.db.update({ id }, amount);
    return auctionUpdate;
  },
});
