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
});
