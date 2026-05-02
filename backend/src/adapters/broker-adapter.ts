import { Order } from '../models/order.js';

export interface BrokerResponse {
  success: boolean;
  broker: string;
  reason?: string;
}

export interface BrokerAdapter {
  name: string;
  submitOrder(order: Order): Promise<BrokerResponse>;
}
