export type OrderStatus = 'pending_approval' | 'approved' | 'submitted' | 'failed' | 'completed';

export interface Order {
  id: string;
  signalId: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  status: OrderStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
  failedReason?: string;
}

export interface OrderUpdatePayload {
  version: number;
  status: OrderStatus;
  failedReason?: string;
}
