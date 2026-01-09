
import { GoogleGenAI, Type } from "@google/genai";
import { Order } from "../types.ts";

export const generateEmailDraft = async (order: Order) => {
  // 每次呼叫時才初始化，確保取得最新的 API_KEY 並避免模組載入階段報錯
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    請為以下銷貨單生成一封專業的電子郵件內容：
    店鋪名稱：${order.storeName}
    銷貨日期：${order.date}
    總金額：${order.totalAmount}
    商品清單：
    ${order.items.map(item => `- ${item.name} (${item.quantity} ${item.unit})`).join('\n')}
    
    郵件應包含：
    1. 主旨：關於 ${order.date} 的出貨通知
    2. 正文：感謝訂購，告知附件為銷貨單電子檔，並列出核心品項。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: {
              type: Type.STRING,
              description: 'The email subject line.'
            },
            body: {
              type: Type.STRING,
              description: 'The email body content.'
            }
          },
          required: ["subject", "body"]
        }
      }
    });
    
    if (response.text) {
      return JSON.parse(response.text.trim());
    }
  } catch (error) {
    console.error("Gemini Email Draft Error:", error);
    return {
      subject: `[出貨通知] ${order.storeName} - ${order.date}`,
      body: `您好，這是您的銷貨單明細。金額共計 NT$ ${order.totalAmount}。`
    };
  }
};
