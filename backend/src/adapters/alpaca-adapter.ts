import { BrokerAdapter, BrokerResponse } from './broker-adapter.js';
import { Order } from '../models/order.js';

export class AlpacaAdapter implements BrokerAdapter {
  readonly name = 'Alpaca';

  async submitOrder(order: Order): Promise<BrokerResponse> {
    if (order.quantity <= 0) {
      return { success: false, broker: this.name, reason: 'INVALID_QUANTITY' };
    }

    // Stubbed Alpaca behavior for MVP
    return { success: true, broker: this.name };
  }
}
