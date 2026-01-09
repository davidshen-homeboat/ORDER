
import React, { useState, useEffect } from 'react';
import OrderForm from './components/OrderForm';
import InvoiceTemplate from './components/InvoiceTemplate';
import { Order, ViewMode } from './types';
import { Icons } from './constants';
import { generateEmailDraft } from './services/geminiService';

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>(ViewMode.FORM);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [history, setHistory] = useState<Order[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('order-history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const saveToHistory = (order: Order) => {
    const newHistory = [order, ...history];
    setHistory(newHistory);
    localStorage.setItem('order-history', JSON.stringify(newHistory));
  };

  const handleOrderSubmit = (order: Order) => {
    setCurrentOrder(order);
    setView(ViewMode.PREVIEW);
    saveToHistory(order);
    syncToGoogleSheet(order);
  };

  const syncToGoogleSheet = async (order: Order) => {
    setIsSyncing(true);
    // 模擬同步邏輯
    console.log("Syncing to Google Sheets...", order);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSyncing(false);
  };

  const handleSendEmail = async () => {
    if (!currentOrder) return;
    const draft = await generateEmailDraft(currentOrder);
    const mailto = `mailto:${currentOrder.email}?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body + "\n\n(附件請參考頁面列印功能保存之 PDF)")}`;
    window.location.href = mailto;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 safe-area-inset-bottom">
      {/* Navigation Header - 行動端優化 */}
      <header className="bg-white border-b sticky top-0 z-50 no-print safe-area-inset-top">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer active:opacity-70 transition" onClick={() => setView(ViewMode.FORM)}>
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <Icons.History />
            </div>
            <h1 className="text-lg font-bold text-gray-900">OrderFlow</h1>
          </div>
          
          <nav className="flex items-center gap-1 sm:gap-4">
            <button 
              onClick={() => setView(ViewMode.FORM)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition active:scale-95 ${view === ViewMode.FORM ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              新建
            </button>
            <button 
              onClick={() => setView(ViewMode.HISTORY)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition active:scale-95 ${view === ViewMode.HISTORY ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              歷史
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {view === ViewMode.FORM && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900">建立銷貨單</h2>
              <p className="text-sm text-gray-500 mt-1">請填寫資訊以生成二聯式單據。</p>
            </div>
            <OrderForm onSubmit={handleOrderSubmit} />
          </div>
        )}

        {view === ViewMode.PREVIEW && currentOrder && (
          <div className="space-y-6 flex flex-col items-center animate-in zoom-in-95 duration-300">
            <div className="w-full flex justify-between items-center no-print max-w-[21cm]">
              <button 
                onClick={() => setView(ViewMode.FORM)}
                className="text-gray-500 hover:text-gray-900 flex items-center gap-1 text-sm font-medium active:translate-x-[-2px] transition"
              >
                ← 返回
              </button>
              <div className="flex gap-2">
                <button 
                  onClick={handleSendEmail}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg shadow-sm active:scale-95 transition font-medium"
                >
                  發送 Email
                </button>
                <button 
                  onClick={() => window.print()}
                  className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg shadow-sm active:scale-95 transition font-medium"
                >
                  <Icons.Print /> 列印
                </button>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-12 shadow-xl rounded-2xl border print:p-0 print:border-none print:shadow-none w-full flex flex-col items-center gap-8">
               <InvoiceTemplate order={currentOrder} type="FACTORY" />
               <div className="w-full border-t-2 border-dashed border-gray-300 my-4 no-print relative">
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-gray-400 text-[10px] font-mono uppercase">裁切線</span>
               </div>
               <InvoiceTemplate order={currentOrder} type="STORE" />
            </div>
          </div>
        )}

        {view === ViewMode.HISTORY && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-2xl font-extrabold text-gray-900">歷史記錄</h2>
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b text-sm">
                    <tr>
                      <th className="px-4 py-4 font-semibold text-gray-700">日期/店鋪</th>
                      <th className="px-4 py-4 font-semibold text-gray-700 text-right">金額</th>
                      <th className="px-4 py-4 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-sm">
                    {history.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-10 text-center text-gray-400 italic">無紀錄</td>
                      </tr>
                    ) : (
                      history.map((order) => (
                        <tr key={order.id} className="active:bg-gray-50 transition" onClick={() => {
                          setCurrentOrder(order);
                          setView(ViewMode.PREVIEW);
                        }}>
                          <td className="px-4 py-4">
                            <div className="font-medium text-gray-900">{order.storeName}</div>
                            <div className="text-xs text-gray-500 font-mono">{order.date}</div>
                          </td>
                          <td className="px-4 py-4 text-right font-bold text-blue-600">${order.totalAmount.toLocaleString()}</td>
                          <td className="px-4 py-4 text-center">
                            <span className="text-gray-300">›</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 手機端底部懸浮按鈕 */}
      {view !== ViewMode.FORM && (
        <div className="fixed bottom-6 right-6 no-print">
          <button 
            onClick={() => setView(ViewMode.FORM)}
            className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition transform"
          >
            <Icons.Plus />
          </button>
        </div>
      )}

      {isSyncing && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900/90 backdrop-blur text-white px-4 py-2 rounded-full text-xs shadow-xl flex items-center gap-2 z-50">
          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          資料同步中...
        </div>
      )}
    </div>
  );
};

export default App;
