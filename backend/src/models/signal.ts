export type SignalStatus = 'active' | 'expired' | 'archived';

export interface Signal {
  id: string;
  symbol: string;
  action: 'buy' | 'sell' | 'hold';
  confidence: number;
  sourceCores: string[];
  rationale: string;
  createdAt: string;
  expiresAt: string;
  status: SignalStatus;
}
