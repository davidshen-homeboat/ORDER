
import React, { useState } from 'react';
import { Order, OrderItem } from '../types.ts';
import { Icons } from '../constants.tsx';

interface OrderFormProps {
  onSubmit: (order: Order) => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    storeName: '',
    taxId: '',
    address: '',
    email: '',
  });

  const [items, setItems] = useState<OrderItem[]>([
    { id: '1', name: '', quantity: 1, unit: '件', price: 0, amount: 0, remarks: '' }
  ]);

  const handleAddItem = () => {
    setItems([
      ...items,
      { id: Math.random().toString(36).substr(2, 9), name: '', quantity: 1, unit: '件', price: 0, amount: 0, remarks: '' }
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleItemChange = (id: string, field: keyof OrderItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const newItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'price') {
          newItem.amount = Number(newItem.quantity) * Number(newItem.price);
        }
        return newItem;
      }
      return item;
    }));
  };

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const order: Order = {
      ...formData,
      id: `ORD-${Date.now()}`,
      items,
      totalAmount,
      createdAt: new Date().toISOString(),
    };
    onSubmit(order);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-8 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">銷貨日期</label>
            <input 
              type="date" required 
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">店鋪名稱</label>
            <input 
              type="text" placeholder="輸入店鋪名稱" required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              value={formData.storeName}
              onChange={(e) => setFormData({...formData, storeName: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">統一編號</label>
            <input 
              type="text" placeholder="8位數字" 
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              value={formData.taxId}
              onChange={(e) => setFormData({...formData, taxId: e.target.value})}
            />
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">送貨地址</label>
            <input 
              type="text" placeholder="完整配送地址" required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">通知電子郵件</label>
            <input 
              type="email" placeholder="接收對帳單的 Email" required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[700px]">
          <thead className="bg-gray-50 text-gray-600 text-sm uppercase font-semibold">
            <tr>
              <th className="px-4 py-3 rounded-tl-lg">商品名稱</th>
              <th className="px-4 py-3 w-20 text-center">數量</th>
              <th className="px-4 py-3 w-20 text-center">單位</th>
              <th className="px-4 py-3 w-32 text-center">單價</th>
              <th className="px-4 py-3 w-32 text-center">總金額</th>
              <th className="px-4 py-3">備註</th>
              <th className="px-4 py-3 rounded-tr-lg"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition">
                <td className="px-2 py-3">
                  <input 
                    type="text" placeholder="商品名稱" required
                    className="w-full px-3 py-1.5 bg-transparent border-b focus:border-blue-500 focus:outline-none"
                    value={item.name}
                    onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                  />
                </td>
                <td className="px-2 py-3 text-center">
                  <input 
                    type="number" min="1" required
                    className="w-full px-1 py-1.5 bg-transparent border-b text-center focus:outline-none"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                  />
                </td>
                <td className="px-2 py-3 text-center">
                  <input 
                    type="text" placeholder="個/件" required
                    className="w-full px-1 py-1.5 bg-transparent border-b text-center focus:outline-none"
                    value={item.unit}
                    onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                  />
                </td>
                <td className="px-2 py-3 text-center">
                  <input 
                    type="number" min="0" required
                    className="w-full px-1 py-1.5 bg-transparent border-b text-center focus:outline-none"
                    value={item.price}
                    onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
                  />
                </td>
                <td className="px-4 py-3 text-center font-medium text-gray-900">
                  ${item.amount.toLocaleString()}
                </td>
                <td className="px-2 py-3">
                  <input 
                    type="text" placeholder="備註內容"
                    className="w-full px-1 py-1.5 bg-transparent border-b focus:outline-none"
                    value={item.remarks}
                    onChange={(e) => handleItemChange(item.id, 'remarks', e.target.value)}
                  />
                </td>
                <td className="px-4 py-3">
                  <button type="button" onClick={() => handleRemoveItem(item.id)} className="p-1 hover:bg-red-50 rounded-full transition">
                    <Icons.Trash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center pt-4">
        <button 
          type="button" 
          onClick={handleAddItem}
          className="flex items-center gap-2 px-4 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition"
        >
          <Icons.Plus /> 新增品項
        </button>
        <div className="text-right">
          <p className="text-sm text-gray-500 uppercase font-semibold">總計金額 (TWD)</p>
          <p className="text-3xl font-bold text-gray-900">${totalAmount.toLocaleString()}</p>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-100 flex justify-end">
        <button 
          type="submit"
          className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transform hover:-translate-y-0.5 transition"
        >
          生成二聯單並同步
        </button>
      </div>
    </form>
  );
};

export default OrderForm;
