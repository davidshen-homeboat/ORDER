
import React, { useState, useEffect } from 'react';
import OrderForm from './components/OrderForm.tsx';
import InvoiceTemplate from './components/InvoiceTemplate.tsx';
import { Order, ViewMode } from './types.ts';
import { Icons } from './constants.tsx';
import { generateEmailDraft } from './services/geminiService.ts';

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>(ViewMode.FORM);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [history, setHistory] = useState<Order[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [sheetUrl, setSheetUrl] = useState<string>(localStorage.getItem('google-sheet-url') || '');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('order-history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const saveToHistory = (order: Order) => {
    const newHistory = [order, ...history];
    setHistory(newHistory);
    localStorage.setItem('order-history', JSON.stringify(newHistory));
  };

  const handleOrderSubmit = async (order: Order) => {
    setCurrentOrder(order);
    setView(ViewMode.PREVIEW);
    saveToHistory(order);
    
    if (sheetUrl) {
      await syncToGoogleSheet(order);
    }
  };

  const syncToGoogleSheet = async (order: Order) => {
    setIsSyncing(true);
    try {
      const payload = {
        id: order.id,
        date: order.date,
        storeName: order.storeName,
        taxId: order.taxId,
        address: order.address,
        totalAmount: order.totalAmount,
        items: order.items.map(i => `${i.name}x${i.quantity}${i.unit}`).join(', ')
      };

      await fetch(sheetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      console.log("資料已送出至 Google Sheets");
    } catch (error) {
      console.error("同步失敗:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const saveSettings = (url: string) => {
    setSheetUrl(url);
    localStorage.setItem('google-sheet-url', url);
    setShowSettings(false);
    alert('設定已儲存！');
  };

  const handleSendEmail = async () => {
    if (!currentOrder) return;
    const draft = await generateEmailDraft(currentOrder);
    const mailto = `mailto:${currentOrder.email}?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body + "\n\n(附件請參考頁面列印功能保存之 PDF)")}`;
    window.location.href = mailto;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 safe-area-inset-bottom">
      <header className="bg-white border-b sticky top-0 z-50 no-print safe-area-inset-top">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer active:opacity-70 transition" onClick={() => setView(ViewMode.FORM)}>
            <div className="bg-blue-600 text-white p-2 rounded-lg shadow-md shadow-blue-100">
              <Icons.History />
            </div>
            <h1 className="text-lg font-bold text-gray-900">OrderFlow</h1>
          </div>
          
          <nav className="flex items-center gap-1 sm:gap-2">
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
            <button 
              onClick={() => setShowSettings(true)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.592c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43 1.1l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.127c-.332.183-.582.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-1.1l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </button>
          </nav>
        </div>
      </header>

      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-xl font-bold text-gray-900">Google Sheet 連結設定</h3>
            <p className="text-sm text-gray-500">請輸入您的 Google Apps Script 部署網址 (Web App URL)。</p>
            <input 
              type="url" 
              placeholder="https://script.google.com/macros/s/.../exec"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
            />
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowSettings(false)} className="flex-1 px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition">取消</button>
              <button onClick={() => saveSettings(sheetUrl)} className="flex-1 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition">儲存</button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 py-6">
        {view === ViewMode.FORM && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-2xl font-extrabold text-gray-900">建立銷貨單</h2>
            <OrderForm onSubmit={handleOrderSubmit} />
          </div>
        )}

        {view === ViewMode.PREVIEW && currentOrder && (
          <div className="space-y-6 flex flex-col items-center animate-in zoom-in-95 duration-300">
            <div className="w-full flex justify-between items-center no-print max-w-[21cm]">
              <button onClick={() => setView(ViewMode.FORM)} className="text-gray-500 hover:text-gray-900 flex items-center gap-1 text-sm font-medium active:translate-x-[-2px] transition">← 返回修改</button>
              <div className="flex gap-2">
                <button onClick={handleSendEmail} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg shadow-sm active:scale-95 transition font-medium">發送 Email</button>
                <button onClick={() => window.print()} className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg shadow-sm active:scale-95 transition font-medium"><Icons.Print /> 列印</button>
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
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-4 font-semibold text-gray-700">日期/店鋪</th>
                      <th className="px-4 py-4 font-semibold text-gray-700 text-right">金額</th>
                      <th className="px-4 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {history.length === 0 ? (
                      <tr><td colSpan={3} className="px-4 py-10 text-center text-gray-400 italic">無紀錄</td></tr>
                    ) : (
                      history.map((order) => (
                        <tr key={order.id} className="active:bg-gray-50 transition" onClick={() => { setCurrentOrder(order); setView(ViewMode.PREVIEW); }}>
                          <td className="px-4 py-4">
                            <div className="font-medium text-gray-900">{order.storeName}</div>
                            <div className="text-xs text-gray-500 font-mono">{order.date}</div>
                          </td>
                          <td className="px-4 py-4 text-right font-bold text-blue-600">${order.totalAmount.toLocaleString()}</td>
                          <td className="px-4 py-4 text-center"><span className="text-gray-300">›</span></td>
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

      {view !== ViewMode.FORM && (
        <div className="fixed bottom-6 right-6 no-print">
          <button onClick={() => setView(ViewMode.FORM)} className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition transform">
            <Icons.Plus />
          </button>
        </div>
      )}

      {isSyncing && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-gray-900/95 backdrop-blur text-white px-6 py-3 rounded-full text-xs shadow-2xl flex items-center gap-3 z-[200] border border-white/20">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          同步中...
        </div>
      )}
    </div>
  );
};

export default App;
