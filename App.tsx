
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
    // Simulate Google Sheet Sync
    syncToGoogleSheet(order);
  };

  const syncToGoogleSheet = async (order: Order) => {
    setIsSyncing(true);
    // Logic for Google Sheet Integration:
    // In a production app, you would POST to a Google Apps Script Web App URL
    console.log("Syncing to Google Sheets...", order);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSyncing(false);
  };

  const handleSendEmail = async () => {
    if (!currentOrder) return;
    
    // Use Gemini to generate content
    const draft = await generateEmailDraft(currentOrder);
    
    // Using mailto link as a direct functional fallback for the request
    const mailto = `mailto:${currentOrder.email}?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body + "\n\n(附件請參考頁面列印功能保存之 PDF)")}`;
    window.location.href = mailto;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Navigation Header */}
      <header className="bg-white border-b sticky top-0 z-50 no-print">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView(ViewMode.FORM)}>
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <Icons.History />
            </div>
            <h1 className="text-xl font-bold text-gray-900 hidden sm:block">OrderFlow Pro</h1>
          </div>
          
          <nav className="flex items-center gap-1 sm:gap-4">
            <button 
              onClick={() => setView(ViewMode.FORM)}
              className={`px-4 py-2 rounded-lg font-medium transition ${view === ViewMode.FORM ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              新建訂單
            </button>
            <button 
              onClick={() => setView(ViewMode.HISTORY)}
              className={`px-4 py-2 rounded-lg font-medium transition ${view === ViewMode.HISTORY ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              歷史記錄
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {view === ViewMode.FORM && (
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900">建立新銷貨單</h2>
                <p className="text-gray-500 mt-1">請填寫完整資訊以生成標準二聯式單據。</p>
              </div>
            </div>
            <OrderForm onSubmit={handleOrderSubmit} />
          </div>
        )}

        {view === ViewMode.PREVIEW && currentOrder && (
          <div className="space-y-8 flex flex-col items-center">
            <div className="w-full flex justify-between items-center no-print max-w-[21cm]">
              <button 
                onClick={() => setView(ViewMode.FORM)}
                className="text-gray-500 hover:text-gray-900 flex items-center gap-2"
              >
                ← 返回修改
              </button>
              <div className="flex gap-4">
                <button 
                  onClick={handleSendEmail}
                  className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                >
                  發送通知信
                </button>
                <button 
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  <Icons.Print /> 列印 / 下載 PDF
                </button>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-12 shadow-xl rounded-2xl border print:p-0 print:border-none print:shadow-none w-full flex flex-col items-center gap-8">
               <InvoiceTemplate order={currentOrder} type="FACTORY" />
               <div className="w-full border-t-2 border-dashed border-gray-300 my-4 no-print relative">
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-gray-400 text-xs font-mono uppercase">裁切線 Cutting Line</span>
               </div>
               <InvoiceTemplate order={currentOrder} type="STORE" />
            </div>

            {isSyncing && (
              <div className="fixed bottom-10 right-10 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-bounce">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                同步 Google Sheets 中...
              </div>
            )}
          </div>
        )}

        {view === ViewMode.HISTORY && (
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900">銷貨歷史記錄</h2>
                <p className="text-gray-500 mt-1">過去所有產生的銷貨單據，點擊可重新查看。</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-gray-700">編號</th>
                    <th className="px-6 py-4 font-semibold text-gray-700">日期</th>
                    <th className="px-6 py-4 font-semibold text-gray-700">店鋪名稱</th>
                    <th className="px-6 py-4 font-semibold text-gray-700 text-right">金額</th>
                    <th className="px-6 py-4 font-semibold text-gray-700 text-center">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center text-gray-400">
                        目前尚無訂單紀錄
                      </td>
                    </tr>
                  ) : (
                    history.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-mono text-sm text-blue-600">{order.id}</td>
                        <td className="px-6 py-4 text-gray-600">{order.date}</td>
                        <td className="px-6 py-4 font-medium text-gray-900">{order.storeName}</td>
                        <td className="px-6 py-4 text-right font-bold text-gray-900">${order.totalAmount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => {
                              setCurrentOrder(order);
                              setView(ViewMode.PREVIEW);
                            }}
                            className="text-blue-600 hover:underline font-medium"
                          >
                            查看單據
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Persistent Call-to-Action for Mobile */}
      {view !== ViewMode.FORM && (
        <div className="fixed bottom-6 right-6 no-print">
          <button 
            onClick={() => setView(ViewMode.FORM)}
            className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition active:scale-95"
          >
            <Icons.Plus />
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
