import { v4 as uuid } from 'uuid';
import { Order, OrderStatus, OrderUpdatePayload } from '../models/order.js';
import { brokerService } from './broker-service.js';
import { observability } from './observability.js';

const orders = new Map<string, Order>();

export class OrderService {
  createOrder(signalId: string, symbol: string, side: 'buy' | 'sell', quantity: number): Order {
    const order: Order = {
      id: uuid(),
      signalId,
      symbol,
      side,
      quantity,
      status: 'pending_approval',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    orders.set(order.id, order);
    observability.logAudit('order_created', { orderId: order.id, signalId, symbol, side, quantity });
    return order;
  }

  getOrder(orderId: string): Order | undefined {
    return orders.get(orderId);
  }

  approveOrder(orderId: string, version: number): Order {
    const order = orders.get(orderId);
    if (!order) {
      throw new Error('ORDER_NOT_FOUND');
    }
    if (order.version !== version) {
      throw new Error('ORDER_VERSION_STALE');
    }
    if (order.status === 'approved') {
      throw new Error('ORDER_ALREADY_APPROVED');
    }
    if (order.status === 'submitted') {
      throw new Error('ORDER_ALREADY_SUBMITTED');
    }
    if (order.status === 'failed') {
      order.status = 'approved';
      order.version += 1;
      order.updatedAt = new Date().toISOString();
      observability.logAudit('order_approved_after_failure', { orderId });
      return order;
    }

    order.status = 'approved';
    order.version += 1;
    order.updatedAt = new Date().toISOString();
    observability.logAudit('order_approved', { orderId });
    return order;
  }

  async submitOrder(orderId: string, version: number): Promise<Order> {
    const order = orders.get(orderId);
    if (!order) {
      throw new Error('ORDER_NOT_FOUND');
    }
    if (order.version !== version) {
      throw new Error('ORDER_VERSION_STALE');
    }
    if (order.status !== 'approved') {
      throw new Error('ORDER_NOT_APPROVABLE');
    }

    const result = await brokerService.submitOrder(order);
    order.version += 1;
    order.updatedAt = new Date().toISOString();

    if (result.success) {
      order.status = 'submitted';
      observability.logAudit('order_submitted', { orderId, broker: result.broker });
    } else {
      order.status = 'failed';
      order.failedReason = result.reason || 'Unknown error';
      observability.logBrokerFailure(orderId, result.reason || 'Unknown error');
    }

    return order;
  }

  updateOrder(orderId: string, payload: OrderUpdatePayload): Order {
    const order = orders.get(orderId);
    if (!order) {
      throw new Error('ORDER_NOT_FOUND');
    }
    if (payload.version !== order.version) {
      throw new Error('ORDER_VERSION_STALE');
    }
    order.status = payload.status;
    if (payload.failedReason) {
      order.failedReason = payload.failedReason;
    }
    order.version += 1;
    order.updatedAt = new Date().toISOString();
    return order;
  }
}

export const orderService = new OrderService();
