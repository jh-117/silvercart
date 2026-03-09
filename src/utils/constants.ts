export const APP_CONFIG = {
  name: 'SilverCart',
  version: '1.0.0',
  supportPhone: '1-300-XX-XXXX',
  supportEmail: 'help@silvercart.com',
  supportWhatsApp: '+60 12-XXX-XXXX',
};

export const DELIVERY_FEE = 5.00;
export const FREE_DELIVERY_THRESHOLD = 50.00;
export const MAX_ORDER_AMOUNT = 500.00;
export const ORDER_CANCELLATION_WINDOW_MINUTES = 5;

export const CATEGORIES = {
  PHARMACY: 'pharmacy',
  GROCERY: 'grocery',
} as const;

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export const PAYMENT_METHODS = {
  COD: 'cod',
  ONLINE_BANKING: 'online_banking',
  E_WALLET: 'e_wallet',
} as const;
