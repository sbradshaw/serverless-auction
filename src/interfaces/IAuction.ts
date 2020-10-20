export interface IAuction {
  id: string;
  title: string;
  createdAt: string;
  endingAt: string;
  status: string;
  highestBid: {
    amount: string;
  };
}
