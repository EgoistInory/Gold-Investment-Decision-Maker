import React, { useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';
import { 
  Bell, Settings, TrendingUp, Download, Server, CheckCircle2, AlertCircle, Play, Copy
} from 'lucide-react';
import { cn } from './lib/utils';

// Mock data for gold prices (simulating recent days)
const mockGoldData = Array.from({ length: 30 }).map((_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    date: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
    price: 480 + Math.random() * 20 + (i * 0.5), // Upward trend
  };
});

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Strategy State
  const [lowThreshold, setLowThreshold] = useState(490);
  const [highThreshold, setHighThreshold] = useState(510);
  const [dcaAmount, setDcaAmount] = useState(1000);
  const [dcaFrequency, setDcaFrequency] = useState('weekly');
  
  // Notification State
  const [discordWebhook, setDiscordWebhook] = useState('');
  const [telegramToken, setTelegramToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [feishuWebhook, setFeishuWebhook] = useState('');
  
  const currentPrice = mockGoldData[mockGoldData.length - 1].price;

  const generatePythonScript = () => {
    return `# gold_tracker.py
import os
import json
import urllib.request
from datetime import datetime

# ==========================================
# 黄金投资定投理财决策器 (Gold Investment Decision Maker)
# ==========================================

# 配置参数 (Configuration)
CONFIG = {
    "low_threshold": ${lowThreshold},
    "high_threshold": ${highThreshold},
    "dca_amount": ${dcaAmount},
    "dca_frequency": "${dcaFrequency}",
    "webhooks": {
        "discord": os.environ.get("DISCORD_WEBHOOK"),
        "telegram_token": os.environ.get("TELEGRAM_TOKEN"),
        "telegram_chat_id": os.environ.get("TELEGRAM_CHAT_ID"),
        "feishu": os.environ.get("FEISHU_WEBHOOK")
    }
}

def fetch_gold_price():
    """
    获取实时黄金价格
    这里以新浪财经的上海黄金交易所 Au99.99 为例。
    如需招商银行特定纸黄金/积存金价格，需替换为招行公开API或爬虫接口。
    """
    try:
        url = "http://hq.sinajs.cn/list=gds_autd"
        req = urllib.request.Request(url, headers={"Referer": "http://finance.sina.com.cn"})
        with urllib.request.urlopen(req, timeout=10) as response:
            html = response.read().decode('gbk')
            
            # 解析新浪财经返回的字符串
            # 格式类似: var hq_str_gds_autd="Au(T+D),...,498.50,...";
            data = html.split(',')
            if len(data) > 3:
                current_price = float(data[3]) # 最新价通常在索引3
                return current_price
    except Exception as e:
        print(f"获取金价失败: {e}")
    
    # 如果API失败，返回一个模拟价格用于测试
    return ${currentPrice.toFixed(2)}

def send_discord_alert(message):
    webhook = CONFIG["webhooks"]["discord"]
    if not webhook: return
    data = json.dumps({"content": message}).encode('utf-8')
    req = urllib.request.Request(webhook, data=data, headers={'Content-Type': 'application/json'})
    try: urllib.request.urlopen(req)
    except Exception as e: print(f"Discord alert failed: {e}")

def send_telegram_alert(message):
    token = CONFIG["webhooks"]["telegram_token"]
    chat_id = CONFIG["webhooks"]["telegram_chat_id"]
    if not token or not chat_id: return
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    data = json.dumps({"chat_id": chat_id, "text": message}).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    try: urllib.request.urlopen(req)
    except Exception as e: print(f"Telegram alert failed: {e}")

def send_feishu_alert(message):
    webhook = CONFIG["webhooks"]["feishu"]
    if not webhook: return
    payload = {"msg_type": "text", "content": {"text": message}}
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(webhook, data=data, headers={'Content-Type': 'application/json'})
    try: urllib.request.urlopen(req)
    except Exception as e: print(f"Feishu alert failed: {e}")

def notify_all(message):
    print(f"Sending notifications: {message}")
    send_discord_alert(message)
    send_telegram_alert(message)
    send_feishu_alert(message)

def main():
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 开始执行黄金价格巡检...")
    current_price = fetch_gold_price()
    if not current_price: return
    
    print(f"当前金价: ¥{current_price}/g")
    
    message = f"📊 【黄金价格监控】当前价格: ¥{current_price}/g\\n"
    should_alert = False

    if current_price <= CONFIG["low_threshold"]:
        message += f"🟢 触发低价提醒！低于设定值 ¥{CONFIG['low_threshold']}/g。建议买入或执行定投 ¥{CONFIG['dca_amount']}。"
        should_alert = True
    elif current_price >= CONFIG["high_threshold"]:
        message += f"🔴 触发高价提醒！高于设定值 ¥{CONFIG['high_threshold']}/g。建议分批卖出止盈。"
        should_alert = True
    else:
        # Check if it's DCA day (e.g., Friday = 4 in Python weekday())
        today = datetime.now().weekday()
        if CONFIG["dca_frequency"] == 'weekly' and today == 4: # Friday
            message += f"📅 今日是定投日，当前价格 ¥{current_price}/g，建议定投 ¥{CONFIG['dca_amount']}。"
            should_alert = True

    if should_alert:
        notify_all(message)
    else:
        print("当前价格在观望区间，无需操作。")

if __name__ == "__main__":
    main()`;
  };

  const generateGithubAction = () => {
    return `name: Gold Price Tracker

on:
  schedule:
    # Run every day at 10:00 AM Beijing Time (02:00 UTC)
    - cron: '0 2 * * *'
  workflow_dispatch: # Allow manual trigger

jobs:
  check-gold-price:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.10'

      - name: Run Tracker
        env:
          DISCORD_WEBHOOK: \${{ secrets.DISCORD_WEBHOOK }}
          TELEGRAM_TOKEN: \${{ secrets.TELEGRAM_TOKEN }}
          TELEGRAM_CHAT_ID: \${{ secrets.TELEGRAM_CHAT_ID }}
          FEISHU_WEBHOOK: \${{ secrets.FEISHU_WEBHOOK }}
        run: python gold_tracker.py`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="flex h-screen bg-zinc-50 text-zinc-900 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-zinc-200 flex flex-col">
        <div className="p-6 border-b border-zinc-200">
          <h1 className="text-xl font-bold flex items-center gap-2 text-amber-600">
            <TrendingUp className="w-6 h-6" />
            Gold Tracker
          </h1>
          <p className="text-xs text-zinc-500 mt-1">Investment Decision Maker</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: 'dashboard', icon: TrendingUp, label: 'Dashboard' },
            { id: 'strategy', icon: Settings, label: 'Strategy' },
            { id: 'notifications', icon: Bell, label: 'Notifications' },
            { id: 'deploy', icon: Download, label: 'Deploy & Export' },
            { id: 'providers', icon: Server, label: 'Cloud Providers' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                activeTab === item.id 
                  ? "bg-amber-50 text-amber-700" 
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto p-8">
          
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-bold">Market Overview</h2>
                  <p className="text-zinc-500">Real-time domestic gold price analysis (AU9999)</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-zinc-500">Current Price (Mock)</div>
                  <div className="text-4xl font-mono font-bold text-amber-600">
                    ¥{currentPrice.toFixed(2)}<span className="text-lg text-zinc-500">/g</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockGoldData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} dy={10} />
                    <YAxis domain={['dataMin - 5', 'dataMax + 5']} axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} dx={-10} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: '#d97706' }}
                    />
                    <ReferenceLine y={lowThreshold} label={{ position: 'insideTopLeft', value: 'Buy Target', fill: '#16a34a', fontSize: 12 }} stroke="#16a34a" strokeDasharray="3 3" />
                    <ReferenceLine y={highThreshold} label={{ position: 'insideTopLeft', value: 'Sell Target', fill: '#ef4444', fontSize: 12 }} stroke="#ef4444" strokeDasharray="3 3" />
                    <Line type="monotone" dataKey="price" stroke="#d97706" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#d97706', stroke: '#fff', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-zinc-200">
                  <div className="text-sm text-zinc-500 mb-1">Status</div>
                  <div className="font-medium flex items-center gap-2">
                    {currentPrice <= lowThreshold ? (
                      <span className="text-green-600 flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> Buy Zone</span>
                    ) : currentPrice >= highThreshold ? (
                      <span className="text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4"/> Sell Zone</span>
                    ) : (
                      <span className="text-zinc-600 flex items-center gap-1"><Play className="w-4 h-4"/> Hold / DCA</span>
                    )}
                  </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-zinc-200">
                  <div className="text-sm text-zinc-500 mb-1">Low Threshold</div>
                  <div className="font-mono font-medium">¥{lowThreshold.toFixed(2)}</div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-zinc-200">
                  <div className="text-sm text-zinc-500 mb-1">High Threshold</div>
                  <div className="font-mono font-medium">¥{highThreshold.toFixed(2)}</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'strategy' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-2xl font-bold">Investment Strategy</h2>
                <p className="text-zinc-500">Configure your Dollar Cost Averaging (DCA) and alert thresholds.</p>
              </div>

              <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
                <div className="p-6 border-b border-zinc-200">
                  <h3 className="font-semibold text-lg">Price Alerts</h3>
                  <p className="text-sm text-zinc-500 mb-4">Set the prices at which you want to be notified to buy or sell.</p>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">Low Price Alert (Buy) ¥/g</label>
                      <input 
                        type="number" 
                        value={lowThreshold}
                        onChange={(e) => setLowThreshold(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">High Price Alert (Sell) ¥/g</label>
                      <input 
                        type="number" 
                        value={highThreshold}
                        onChange={(e) => setHighThreshold(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-semibold text-lg">DCA (定投) Settings</h3>
                  <p className="text-sm text-zinc-500 mb-4">Configure your regular investment plan.</p>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">Investment Amount (¥)</label>
                      <input 
                        type="number" 
                        value={dcaAmount}
                        onChange={(e) => setDcaAmount(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">Frequency</label>
                      <select 
                        value={dcaFrequency}
                        onChange={(e) => setDcaFrequency(e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly (Friday)</option>
                        <option value="monthly">Monthly (1st)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-2xl font-bold">Notifications</h2>
                <p className="text-zinc-500">Configure where you want to receive your investment alerts.</p>
              </div>

              <div className="space-y-4">
                <div className="bg-white p-6 rounded-2xl border border-zinc-200">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#5865F2] rounded-lg flex items-center justify-center text-white font-bold">D</div>
                    Discord Webhook
                  </h3>
                  <input 
                    type="text" 
                    placeholder="https://discord.com/api/webhooks/..."
                    value={discordWebhook}
                    onChange={(e) => setDiscordWebhook(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5865F2]"
                  />
                </div>

                <div className="bg-white p-6 rounded-2xl border border-zinc-200">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#229ED9] rounded-lg flex items-center justify-center text-white font-bold">T</div>
                    Telegram Bot
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">Bot Token</label>
                      <input 
                        type="text" 
                        placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                        value={telegramToken}
                        onChange={(e) => setTelegramToken(e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#229ED9]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">Chat ID</label>
                      <input 
                        type="text" 
                        placeholder="-1001234567890"
                        value={telegramChatId}
                        onChange={(e) => setTelegramChatId(e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#229ED9]"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-zinc-200">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#00D6B9] rounded-lg flex items-center justify-center text-white font-bold">F</div>
                    Feishu Webhook
                  </h3>
                  <input 
                    type="text" 
                    placeholder="https://open.feishu.cn/open-apis/bot/v2/hook/..."
                    value={feishuWebhook}
                    onChange={(e) => setFeishuWebhook(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D6B9]"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'deploy' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-2xl font-bold">Deploy via GitHub Actions</h2>
                <p className="text-zinc-500">Zero-cost, zero-maintenance deployment. Runs automatically every day.</p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm">
                <strong>Instructions:</strong>
                <ol className="list-decimal ml-5 mt-2 space-y-1">
                  <li>Create a new private repository on GitHub.</li>
                  <li>Add the generated <code>gold_tracker.py</code> to the root of the repository.</li>
                  <li>Add the generated YAML to <code>.github/workflows/gold-tracker.yml</code>.</li>
                  <li>Go to Repo Settings {'>'} Secrets and variables {'>'} Actions, and add your webhook secrets (e.g., <code>DISCORD_WEBHOOK</code>).</li>
                </ol>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">1. gold_tracker.py</h3>
                    <button onClick={() => copyToClipboard(generatePythonScript())} className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1">
                      <Copy className="w-4 h-4" /> Copy Code
                    </button>
                  </div>
                  <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-xl overflow-x-auto text-sm font-mono">
                    {generatePythonScript()}
                  </pre>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">2. .github/workflows/gold-tracker.yml</h3>
                    <button onClick={() => copyToClipboard(generateGithubAction())} className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1">
                      <Copy className="w-4 h-4" /> Copy Code
                    </button>
                  </div>
                  <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-xl overflow-x-auto text-sm font-mono">
                    {generateGithubAction()}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'providers' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-2xl font-bold">Cloud Provider Recommendations</h2>
                <p className="text-zinc-500">Lightweight, free or low-cost options for indie developers.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* GitHub Actions */}
                <div className="bg-white p-6 rounded-2xl border border-zinc-200 hover:border-amber-300 transition-colors">
                  <div className="w-12 h-12 bg-zinc-900 text-white rounded-xl flex items-center justify-center mb-4">
                    <Server className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">GitHub Actions</h3>
                  <p className="text-zinc-600 text-sm mb-4">
                    <strong>Best for:</strong> Scheduled tasks (Cron jobs), CI/CD, simple scripts.
                  </p>
                  <ul className="text-sm text-zinc-500 space-y-2 mb-4">
                    <li>✅ 100% Free for public repos</li>
                    <li>✅ 2,000 free minutes/month for private repos</li>
                    <li>✅ Zero server maintenance</li>
                    <li>❌ Not for hosting APIs/Websites</li>
                  </ul>
                  <div className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Highly Recommended for this project</div>
                </div>

                {/* Vercel */}
                <div className="bg-white p-6 rounded-2xl border border-zinc-200 hover:border-amber-300 transition-colors">
                  <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center mb-4 font-bold text-xl">
                    V
                  </div>
                  <h3 className="text-lg font-bold mb-2">Vercel</h3>
                  <p className="text-zinc-600 text-sm mb-4">
                    <strong>Best for:</strong> Frontend hosting, Serverless APIs, Next.js.
                  </p>
                  <ul className="text-sm text-zinc-500 space-y-2 mb-4">
                    <li>✅ Generous free tier</li>
                    <li>✅ Edge functions & Serverless</li>
                    <li>✅ Supports Cron Jobs (Vercel Cron)</li>
                    <li>❌ Strict execution time limits (10s on free)</li>
                  </ul>
                </div>

                {/* PythonAnywhere */}
                <div className="bg-white p-6 rounded-2xl border border-zinc-200 hover:border-amber-300 transition-colors">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center mb-4 font-bold text-xl">
                    P
                  </div>
                  <h3 className="text-lg font-bold mb-2">PythonAnywhere</h3>
                  <p className="text-zinc-600 text-sm mb-4">
                    <strong>Best for:</strong> Python scripts, Flask/Django apps, Scheduled tasks.
                  </p>
                  <ul className="text-sm text-zinc-500 space-y-2 mb-4">
                    <li>✅ Native Python environment</li>
                    <li>✅ Free tier includes 1 scheduled task/day</li>
                    <li>✅ Easy to use web interface</li>
                    <li>❌ Free tier has restricted outbound internet access</li>
                  </ul>
                </div>

                {/* Render */}
                <div className="bg-white p-6 rounded-2xl border border-zinc-200 hover:border-amber-300 transition-colors">
                  <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center mb-4 font-bold text-xl">
                    R
                  </div>
                  <h3 className="text-lg font-bold mb-2">Render</h3>
                  <p className="text-zinc-600 text-sm mb-4">
                    <strong>Best for:</strong> Background workers, Web APIs, Cron Jobs.
                  </p>
                  <ul className="text-sm text-zinc-500 space-y-2 mb-4">
                    <li>✅ Direct GitHub integration</li>
                    <li>✅ Supports Python natively</li>
                    <li>✅ Free tier for Web Services</li>
                    <li>❌ Free instances spin down after inactivity</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
