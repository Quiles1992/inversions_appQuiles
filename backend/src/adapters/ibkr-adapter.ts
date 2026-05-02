import { BrokerAdapter, BrokerResponse } from './broker-adapter.js';
import { Order } from '../models/order.js';

export class IBKRAdapter implements BrokerAdapter {
  readonly name = 'IBKR';

  async submitOrder(order: Order): Promise<BrokerResponse> {
    if (order.quantity <= 0) {
      return { success: false, broker: this.name, reason: 'INVALID_QUANTITY' };
    }

    // Stubbed IBKR behavior for MVP
    return { success: true, broker: this.name };
  }
}
