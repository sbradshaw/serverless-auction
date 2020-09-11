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
    };

    await io.db.put(auction);
    return auction;
  },
  getAuctions: async () => {
    let auctions: any;

    auctions = await io.db.scan();
    return auctions.Items;
  },
  getAuction: async (data: any) => {
    const { id } = data;
    let auction: any;

    auction = await io.db.get({ id });
    return auction.Item;
  },
});
