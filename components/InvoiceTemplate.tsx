
import React from 'react';
import { Order } from '../types.ts';

interface InvoiceTemplateProps {
  order: Order;
  type: 'FACTORY' | 'STORE';
}

const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ order, type }) => {
  const isFactory = type === 'FACTORY';
  
  return (
    <div className={`w-full max-w-[21cm] p-8 border-2 ${isFactory ? 'border-blue-200 bg-blue-50/10' : 'border-green-200 bg-green-50/10'} mb-8 shadow-sm print:shadow-none print:m-0 print:border-gray-300`}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-widest text-gray-800">銷 貨 單</h1>
          <p className={`text-xs font-bold mt-1 px-2 py-0.5 rounded inline-block ${isFactory ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'}`}>
            {isFactory ? '第一聯：工廠出貨單' : '第二聯：店舖簽收單'}
          </p>
        </div>
        <div className="text-right text-sm">
          <p>編號：<span className="font-mono">{order.id}</span></p>
          <p>日期：{order.date}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div className="space-y-1">
          <p><span className="text-gray-500">店鋪名稱：</span><span className="font-bold">{order.storeName}</span></p>
          <p><span className="text-gray-500">統一編號：</span>{order.taxId || 'N/A'}</p>
        </div>
        <div className="space-y-1">
          <p><span className="text-gray-500">送貨地址：</span>{order.address}</p>
          <p><span className="text-gray-500">聯絡信箱：</span>{order.email}</p>
        </div>
      </div>

      <table className="w-full border-collapse border border-gray-300 text-xs text-left">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 px-2 py-2">商品名稱</th>
            <th className="border border-gray-300 px-2 py-2 w-16 text-center">數量</th>
            <th className="border border-gray-300 px-2 py-2 w-16 text-center">單位</th>
            <th className="border border-gray-300 px-2 py-2 w-24 text-right">單價</th>
            <th className="border border-gray-300 px-2 py-2 w-24 text-right">小計</th>
            <th className="border border-gray-300 px-2 py-2">備註</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, idx) => (
            <tr key={idx}>
              <td className="border border-gray-300 px-2 py-2">{item.name}</td>
              <td className="border border-gray-300 px-2 py-2 text-center">{item.quantity}</td>
              <td className="border border-gray-300 px-2 py-2 text-center">{item.unit}</td>
              <td className="border border-gray-300 px-2 py-2 text-right">${item.price.toLocaleString()}</td>
              <td className="border border-gray-300 px-2 py-2 text-right">${item.amount.toLocaleString()}</td>
              <td className="border border-gray-300 px-2 py-2 text-gray-500 italic">{item.remarks}</td>
            </tr>
          ))}
          {Array.from({ length: Math.max(0, 8 - order.items.length) }).map((_, i) => (
            <tr key={`empty-${i}`}>
              <td className="border border-gray-300 px-2 py-4"></td>
              <td className="border border-gray-300 px-2 py-4"></td>
              <td className="border border-gray-300 px-2 py-4"></td>
              <td className="border border-gray-300 px-2 py-4"></td>
              <td className="border border-gray-300 px-2 py-4"></td>
              <td className="border border-gray-300 px-2 py-4"></td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-gray-50 font-bold">
            <td colSpan={4} className="border border-gray-300 px-2 py-2 text-right">合計金額：</td>
            <td className="border border-gray-300 px-2 py-2 text-right text-red-600">NT$ {order.totalAmount.toLocaleString()}</td>
            <td className="border border-gray-300 px-2 py-2"></td>
          </tr>
        </tfoot>
      </table>

      <div className="grid grid-cols-3 gap-8 mt-12 text-center text-sm">
        <div className="border-t border-gray-400 pt-2">核准人</div>
        <div className="border-t border-gray-400 pt-2">經手人</div>
        <div className="border-t border-gray-400 pt-2">簽收人 (蓋章)</div>
      </div>
    </div>
  );
};

export default InvoiceTemplate;
