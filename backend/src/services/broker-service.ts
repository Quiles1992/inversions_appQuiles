import { BrokerAdapter } from '../adapters/broker-adapter.js';
import { AlpacaAdapter } from '../adapters/alpaca-adapter.js';
import { IBKRAdapter } from '../adapters/ibkr-adapter.js';
import { Order } from '../models/order.js';

const adapters: BrokerAdapter[] = [new IBKRAdapter(), new AlpacaAdapter()];

export class BrokerService {
  async submitOrder(order: Order): Promise<{ success: boolean; broker: string; reason?: string }> {
    const adapter = adapters.find((adapter) => adapter.name === 'IBKR') ?? adapters[0];
    try {
      return await adapter.submitOrder(order);
    } catch (error) {
      return { success: false, broker: adapter.name, reason: error instanceof Error ? error.message : 'BROKER_ERROR' };
    }
  }
}

export const brokerService = new BrokerService();
