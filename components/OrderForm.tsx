
import React, { useState } from 'react';
import { Order, OrderItem, Product } from '../types.ts';
import { Icons } from '../constants.tsx';

interface OrderFormProps {
  onSubmit: (order: Omit<Order, 'id'>) => void;
  products: Product[];
}

const OrderForm: React.FC<OrderFormProps> = ({ onSubmit, products }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    storeName: '',
    taxId: '',
    address: '',
    email: '',
    remarks: '',
  });

  const [items, setItems] = useState<OrderItem[]>([
    { id: '1', name: '', quantity: 1, unit: '件', price: 0, amount: 0, remarks: '' }
  ]);

  const [errors, setErrors] = useState<string[]>([]);

  // 判斷該品項是否為異動或非標品項
  const checkIfModified = (item: OrderItem) => {
    if (!item.name) return false;
    const original = products.find(p => p.name === item.name);
    // 如果找不到原商品 (名稱不對) 或者 價格不同，則視為異動
    return !original || original.price !== item.price;
  };

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
        let newItem = { ...item, [field]: value };
        
        if (field === 'name') {
          const foundProduct = products.find(p => p.name === value);
          if (foundProduct) {
            newItem.unit = foundProduct.unit;
            newItem.price = foundProduct.price;
          }
        }
        
        if (field === 'quantity' || field === 'price' || field === 'name') {
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
    
    // 執行必填校驗：名稱、價格異動者必填備註
    const validationErrors: string[] = [];
    items.forEach((item, index) => {
      if (checkIfModified(item) && !item.remarks.trim()) {
        validationErrors.push(`第 ${index + 1} 項 [${item.name || '未命名'}] 資料與原清單不符，請於商品備註說明更動原因。`);
      }
    });

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      // 滾動到錯誤訊息位置
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setErrors([]);
    const orderData: Omit<Order, 'id'> = {
      ...formData,
      items,
      totalAmount,
      createdAt: new Date().toISOString(),
    };
    onSubmit(orderData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-8 max-w-4xl mx-auto">
      {/* 錯誤訊息顯示區 */}
      {errors.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mb-6">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <h3 className="text-red-800 font-bold">請修正以下錯誤再提交</h3>
          </div>
          <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
            {errors.map((err, i) => <li key={i}>{err}</li>)}
          </ul>
        </div>
      )}

      <datalist id="product-suggestions">
        {products.map((p, i) => (
          <option key={i} value={p.name}>{`$${p.price} / ${p.unit}`}</option>
        ))}
      </datalist>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">銷貨日期</label>
            <input 
              type="date" required 
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">店鋪名稱</label>
            <input 
              type="text" placeholder="輸入店鋪名稱" required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={formData.storeName}
              onChange={(e) => setFormData({...formData, storeName: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">統一編號</label>
            <input 
              type="text" placeholder="8位數字" 
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
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
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">通知電子郵件</label>
            <input 
              type="email" placeholder="接收對帳單的 Email" required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
        </div>
      </div>

      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-1">訂單整體備註</label>
        <textarea 
          placeholder="填寫特別交代事項 (例如：管理室代收、早上10點前送達...)" 
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition h-20"
          value={formData.remarks}
          onChange={(e) => setFormData({...formData, remarks: e.target.value})}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[700px]">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold">
            <tr>
              <th className="px-4 py-3">商品名稱</th>
              <th className="px-4 py-3 w-20 text-center">數量</th>
              <th className="px-4 py-3 w-20 text-center">單位</th>
              <th className="px-4 py-3 w-32 text-center">單價</th>
              <th className="px-4 py-3 w-32 text-center">小計</th>
              <th className="px-4 py-3">商品備註</th>
              <th className="px-4 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item, index) => {
              const isModified = checkIfModified(item);
              const needsRemark = isModified && !item.remarks.trim();
              
              return (
                <tr key={item.id} className="group">
                  <td className="px-2 py-3">
                    <input 
                      list="product-suggestions"
                      type="text" placeholder="輸入名稱" required
                      className="w-full px-2 py-1.5 border-b border-transparent focus:border-blue-400 outline-none bg-transparent"
                      value={item.name}
                      onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                    />
                  </td>
                  <td className="px-2 py-3">
                    <input 
                      type="number" min="1" required
                      className="w-full px-1 py-1.5 border-b border-transparent text-center focus:border-blue-400 outline-none bg-transparent"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                    />
                  </td>
                  <td className="px-2 py-3">
                    <input 
                      type="text" placeholder="單位" required
                      className="w-full px-1 py-1.5 border-b border-transparent text-center focus:border-blue-400 outline-none bg-transparent"
                      value={item.unit}
                      onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                    />
                  </td>
                  <td className="px-2 py-3">
                    <input 
                      type="number" min="0" required
                      className={`w-full px-1 py-1.5 border-b border-transparent text-center focus:border-blue-400 outline-none bg-transparent ${isModified ? 'text-orange-600 font-bold' : ''}`}
                      value={item.price}
                      onChange={(e) => handleItemChange(item.id, 'price', Number(e.target.value))}
                    />
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-gray-900">
                    ${item.amount.toLocaleString()}
                  </td>
                  <td className="px-2 py-3">
                    <input 
                      type="text" 
                      placeholder={isModified ? "*請註明更動原因" : "品項備註"}
                      className={`w-full px-1 py-1.5 border-b outline-none bg-transparent transition-colors ${
                        needsRemark 
                          ? 'border-red-400 placeholder-red-400' 
                          : isModified 
                            ? 'border-orange-300 focus:border-blue-400' 
                            : 'border-transparent focus:border-blue-400'
                      }`}
                      value={item.remarks}
                      onChange={(e) => handleItemChange(item.id, 'remarks', e.target.value)}
                    />
                  </td>
                  <td className="px-2 py-3">
                    <button type="button" onClick={() => handleRemoveItem(item.id)} className="p-1 opacity-0 group-hover:opacity-100 transition">
                      <Icons.Trash />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center pt-4">
        <button type="button" onClick={handleAddItem} className="flex items-center gap-2 px-4 py-2 text-blue-600 font-bold hover:bg-blue-50 rounded-lg transition">
          <Icons.Plus /> 新增品項
        </button>
        <div className="text-right">
          <p className="text-xs text-gray-500 uppercase font-bold">總計金額 (TWD)</p>
          <p className="text-4xl font-black text-gray-900">${totalAmount.toLocaleString()}</p>
        </div>
      </div>

      <div className="pt-6 border-t flex justify-end">
        <button 
          type="submit" 
          className="px-10 py-4 bg-blue-600 text-white font-black rounded-xl shadow-xl shadow-blue-200 hover:scale-105 active:scale-95 transition transform"
        >
          確認生成單據
        </button>
      </div>
    </form>
  );
};

export default OrderForm;
