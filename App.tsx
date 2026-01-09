
import React, { useState, useEffect, useRef } from 'react';
import OrderForm from './components/OrderForm.tsx';
import InvoiceTemplate from './components/InvoiceTemplate.tsx';
import { Order, ViewMode, Product } from './types.ts';
import { Icons } from './constants.tsx';
import { generateEmailDraft } from './services/geminiService.ts';

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>(ViewMode.FORM);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [history, setHistory] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [emailDraft, setEmailDraft] = useState<{ subject: string, body: string } | null>(null);
  const [sheetUrl, setSheetUrl] = useState<string>(localStorage.getItem('google-sheet-url') || '');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('order-history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (sheetUrl) {
      fetchProducts();
    }
  }, [sheetUrl]);

  useEffect(() => {
    if (currentOrder && view === ViewMode.PREVIEW) {
      prepareEmail(currentOrder);
    }
  }, [currentOrder, view]);

  const fetchProducts = async () => {
    if (!sheetUrl || !sheetUrl.startsWith('http')) return;
    try {
      const response = await fetch(sheetUrl);
      const text = await response.text();
      const cleanText = text.trim();
      if (!cleanText.startsWith('[') && !cleanText.startsWith('{')) return;
      const data = JSON.parse(cleanText);
      if (Array.isArray(data)) setProducts(data);
    } catch (e) {
      console.error("抓取產品失敗");
    }
  };

  const prepareEmail = async (order: Order) => {
    setEmailDraft(null);
    try {
      const draft = await generateEmailDraft(order);
      if (draft) setEmailDraft(draft);
    } catch (err) {
      setEmailDraft({
        subject: `[出貨通知] ${order.storeName} - ${order.date}`,
        body: `您好，附件為您的銷貨單明細。金額共計 NT$ ${order.totalAmount.toLocaleString()}。`
      });
    }
  };

  const generateOrderId = (dateStr: string) => {
    const cleanDate = dateStr.replace(/-/g, '');
    const todayOrders = history.filter(o => o.date === dateStr);
    const nextNum = (todayOrders.length + 1).toString().padStart(3, '0');
    return `ORD-${cleanDate}${nextNum}`;
  };

  const handleOrderSubmit = async (orderData: Omit<Order, 'id'>) => {
    const newId = generateOrderId(orderData.date);
    const order: Order = { ...orderData, id: newId };
    
    setCurrentOrder(order);
    setView(ViewMode.PREVIEW);
    const newHistory = [order, ...history];
    setHistory(newHistory);
    localStorage.setItem('order-history', JSON.stringify(newHistory));
    
    if (sheetUrl) {
      syncToGoogleSheet(order);
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
        remarks: order.remarks,
        items: order.items.map(i => `${i.name}x${i.quantity}${i.unit}`).join(', ')
      };

      await fetch(sheetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSendEmail = () => {
    if (!currentOrder || !emailDraft) return;
    
    const mailtoBase = `mailto:${currentOrder.email}?subject=${encodeURIComponent(emailDraft.subject)}&body=`;
    const bodySuffix = "\n\n(提示：請手動將剛才儲存的 PDF 單據夾帶至此郵件中)";
    
    let finalBody = emailDraft.body + bodySuffix;
    if (mailtoBase.length + encodeURIComponent(finalBody).length > 1800) {
      finalBody = `您好，附件為訂單 ${currentOrder.id} 的銷貨單。` + bodySuffix;
    }

    window.location.href = `${mailtoBase}${encodeURIComponent(finalBody)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 safe-area-inset-bottom">
      <header className="bg-white border-b sticky top-0 z-50 no-print safe-area-inset-top shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView(ViewMode.FORM)}>
            <div className="bg-blue-600 text-white p-2 rounded-lg shadow-lg">
              <Icons.History />
            </div>
            <h1 className="text-lg font-bold text-gray-900">OrderFlow <span className="text-blue-600">Pro</span></h1>
          </div>
          
          <nav className="flex items-center gap-1">
            <button onClick={() => setView(ViewMode.FORM)} className={`px-4 py-2 rounded-lg text-sm font-bold ${view === ViewMode.FORM ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}>新建</button>
            <button onClick={() => setView(ViewMode.HISTORY)} className={`px-4 py-2 rounded-lg text-sm font-bold ${view === ViewMode.HISTORY ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}>歷史</button>
            <button onClick={() => setShowSettings(true)} className="p-2 text-gray-400 hover:text-blue-600 ml-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.592c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43 1.1l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.127c-.332.183-.582.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-1.1l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.213-1.281Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {view === ViewMode.FORM && (
          <OrderForm onSubmit={handleOrderSubmit} products={products} />
        )}

        {view === ViewMode.PREVIEW && currentOrder && (
          <div className="space-y-6 flex flex-col items-center">
            <div className="flex flex-col items-center gap-4 no-print mb-6 w-full max-w-2xl bg-white p-6 rounded-2xl shadow-sm border border-blue-100">
              <h3 className="text-blue-800 font-bold flex items-center gap-2">
                <span className="bg-blue-100 w-6 h-6 flex items-center justify-center rounded-full text-sm">!</span> 
                傳送單據兩步驟：
              </h3>
              <div className="flex flex-wrap justify-center gap-3">
                <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-700 transition">
                  <Icons.Print /> 第一步：列印另存為 PDF
                </button>
                <button 
                  disabled={!emailDraft}
                  onClick={handleSendEmail} 
                  className={`flex items-center gap-2 px-6 py-3 ${!emailDraft ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-500'} text-white rounded-xl font-bold transition`}
                >
                  {!emailDraft ? '正在準備郵件...' : '第二步：發送通知 (提醒附件)'}
                </button>
              </div>
              <button onClick={() => setView(ViewMode.FORM)} className="text-sm text-gray-400 font-medium hover:text-gray-600 transition underline">返回修改內容</button>
            </div>
            
            <div className="print-container w-full flex flex-col items-center">
              <InvoiceTemplate order={currentOrder} type="FACTORY" />
              <div className="w-full my-4 border-t-2 border-dashed border-gray-300 no-print" />
              <InvoiceTemplate order={currentOrder} type="STORE" />
            </div>
          </div>
        )}

        {view === ViewMode.HISTORY && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 mb-6">歷史訂單記錄</h2>
            <div className="grid gap-4">
              {history.map((order) => (
                <div key={order.id} onClick={() => { setCurrentOrder(order); setView(ViewMode.PREVIEW); }} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-blue-300 cursor-pointer transition flex justify-between items-center">
                  <div>
                    <p className="font-mono text-xs text-gray-400">{order.id}</p>
                    <p className="font-bold text-gray-800">{order.storeName}</p>
                    <p className="text-xs text-gray-500">{order.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-lg">${order.totalAmount.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">{order.items.length} 品項</p>
                  </div>
                </div>
              ))}
              {history.length === 0 && <div className="text-center py-20 text-gray-400 font-medium">尚無歷史紀錄</div>}
            </div>
          </div>
        )}
      </main>

      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl scale-in">
            <h2 className="text-xl font-bold mb-4">設定 Google Sheet 連結</h2>
            <input type="text" placeholder="https://script.google.com/macros/s/..." className="w-full px-4 py-3 border rounded-xl mb-6 focus:ring-2 focus:ring-blue-500 outline-none" defaultValue={sheetUrl} onChange={(e) => setSheetUrl(e.target.value.trim())} />
            <div className="flex gap-3">
              <button onClick={() => setShowSettings(false)} className="flex-1 px-4 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold">取消</button>
              <button onClick={() => { localStorage.setItem('google-sheet-url', sheetUrl); setShowSettings(false); fetchProducts(); }} className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold">儲存並同步</button>
            </div>
          </div>
        </div>
      )}

      {isSyncing && (
        <div className="fixed bottom-6 right-6 bg-white px-4 py-2 rounded-full shadow-lg border border-blue-100 flex items-center gap-2 text-sm font-bold text-blue-600 animate-bounce z-50">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" /> 同步中...
        </div>
      )}
    </div>
  );
};

export default App;
