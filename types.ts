
export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  amount: number;
  remarks: string;
}

export interface Order {
  id: string;
  date: string;
  storeName: string;
  taxId: string;
  address: string;
  email: string;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
}

export enum ViewMode {
  FORM = 'FORM',
  PREVIEW = 'PREVIEW',
  HISTORY = 'HISTORY'
}
