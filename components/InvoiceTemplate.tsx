
import React from 'react';
import { Order } from '../types.ts';

interface InvoiceTemplateProps {
  order: Order;
  type: 'FACTORY' | 'STORE';
}

const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ order, type }) => {
  const isFactory = type === 'FACTORY';
  
  // 動態計算空白列，如果品項多則減少空白列，確保一頁能塞兩張單
  const minRows = order.items.length > 10 ? 1 : 5;
  const emptyRowsCount = Math.max(0, minRows - order.items.length);
  
  return (
    <div className={`invoice-box w-full p-6 border-2 ${isFactory ? 'border-blue-200 bg-blue-50/5' : 'border-green-200 bg-green-50/5'} mb-6 shadow-sm print:m-0`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-xl font-bold tracking-widest text-gray-800">銷 貨 單</h1>
          <p className={`text-[10px] font-bold mt-0.5 px-2 py-0.5 rounded inline-block ${isFactory ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'}`}>
            {isFactory ? '第一聯：工廠出貨單' : '第二聯：店舖簽收單'}
          </p>
        </div>
        <div className="text-right text-xs">
          <p>單號：<span className="font-mono">{order.id}</span></p>
          <p>日期：{order.date}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
        <div className="space-y-0.5">
          <p><span className="text-gray-500">店鋪名稱：</span><span className="font-bold">{order.storeName}</span></p>
          <p><span className="text-gray-500">統一編號：</span>{order.taxId || 'N/A'}</p>
        </div>
        <div className="space-y-0.5">
          <p><span className="text-gray-500">送貨地址：</span>{order.address}</p>
          <p><span className="text-gray-500">聯絡信箱：</span>{order.email}</p>
        </div>
      </div>

      <table className="invoice-table w-full border-collapse border border-gray-300 text-[11px] text-left">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 px-2 py-1.5">商品名稱</th>
            <th className="border border-gray-300 px-2 py-1.5 w-14 text-center">數量</th>
            <th className="border border-gray-300 px-2 py-1.5 w-12 text-center">單位</th>
            <th className="border border-gray-300 px-2 py-1.5 w-20 text-right">單價</th>
            <th className="border border-gray-300 px-2 py-1.5 w-20 text-right">小計</th>
            <th className="border border-gray-300 px-2 py-1.5">備註</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, idx) => (
            <tr key={idx}>
              <td className="border border-gray-300 px-2 py-1.5">{item.name}</td>
              <td className="border border-gray-300 px-2 py-1.5 text-center">{item.quantity}</td>
              <td className="border border-gray-300 px-2 py-1.5 text-center">{item.unit}</td>
              <td className="border border-gray-300 px-2 py-1.5 text-right">${item.price.toLocaleString()}</td>
              <td className="border border-gray-300 px-2 py-1.5 text-right">${item.amount.toLocaleString()}</td>
              <td className="border border-gray-300 px-2 py-1.5 text-gray-500 italic truncate max-w-[100px]">{item.remarks}</td>
            </tr>
          ))}
          {Array.from({ length: emptyRowsCount }).map((_, i) => (
            <tr key={`empty-${i}`}>
              <td className="border border-gray-300 px-2 py-3"></td>
              <td className="border border-gray-300 px-2 py-3"></td>
              <td className="border border-gray-300 px-2 py-3"></td>
              <td className="border border-gray-300 px-2 py-3"></td>
              <td className="border border-gray-300 px-2 py-3"></td>
              <td className="border border-gray-300 px-2 py-3"></td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-gray-50 font-bold">
            <td colSpan={4} className="border border-gray-300 px-2 py-1.5 text-right">合計金額：</td>
            <td className="border border-gray-300 px-2 py-1.5 text-right text-red-600">NT$ {order.totalAmount.toLocaleString()}</td>
            <td className="border border-gray-300 px-2 py-1.5"></td>
          </tr>
        </tfoot>
      </table>

      <div className="grid grid-cols-3 gap-8 mt-6 text-center text-[11px]">
        <div className="border-t border-gray-400 pt-1">核准人</div>
        <div className="border-t border-gray-400 pt-1">經手人</div>
        <div className="border-t border-gray-400 pt-1">簽收人 (蓋章)</div>
      </div>
    </div>
  );
};

export default InvoiceTemplate;
