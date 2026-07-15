"use client";

import { Header } from "@/components/Header";
import { Check, Zap } from "lucide-react";

const pricingTiers = [
  {
    id: "basic",
    name: "基础包",
    points: 1000,
    originalPrice: 9.9,
    price: 4.9,
    features: ["1000 积分", "基础生成速度", "标准质量输出"],
    isPopular: false,
  },
  {
    id: "pro",
    name: "专业包",
    points: 5000,
    originalPrice: 49.9,
    price: 19.9,
    features: ["5000 积分", "优先生成速度", "最高质量输出", "优先专属客服"],
    isPopular: true,
  },
  {
    id: "infinite",
    name: "无限包",
    points: 20000,
    originalPrice: 199.9,
    price: 79.9,
    features: ["20000 积分", "极速生成", "4K 视频输出支持", "全天候优先支持"],
    isPopular: false,
  },
];

const transactions = [
  { id: 1, date: "2023-10-27 14:30", action: "生成视频 (ID: a1b2)", amount: -15 },
  { id: 2, date: "2023-10-26 09:15", action: "生成图片 (ID: x9y8)", amount: -5 },
  { id: 3, date: "2023-10-25 18:00", action: "充值 - 专业包", amount: 5000 },
  { id: 4, date: "2023-10-24 11:20", action: "生成视频 (ID: c3d4)", amount: -20 },
  { id: 5, date: "2023-10-20 08:00", action: "新用户注册奖励", amount: 1000 },
  { id: 6, date: "2023-10-19 16:45", action: "生成视频 (ID: e5f6)", amount: -15 },
];

export default function BillingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a]">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl">
        {/* Header Title */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">积分与账单</h1>
          <p className="text-gray-400">管理您的积分余额和查看消费明细</p>
        </div>

        {/* Current Balance Card */}
        <section className="mb-16">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="flex flex-col items-center md:items-start">
              <span className="text-sm font-medium text-gray-400 mb-2">当前剩余积分</span>
              <div className="flex items-center gap-3">
                <Zap className="h-8 w-8 md:h-10 md:w-10 text-yellow-500 fill-current" />
                <span className="text-5xl md:text-6xl font-extrabold text-white tracking-tighter">
                  6,525
                </span>
              </div>
            </div>
            <button className="w-full md:w-auto px-8 py-4 bg-lime-300 hover:bg-[#b5e62b] text-black font-bold rounded-full text-lg transition-colors shadow-[0_0_20px_rgba(212,255,63,0.3)]">
              立即充值
            </button>
          </div>
        </section>

        {/* Pricing Tiers */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white mb-2">获取更多灵感</h2>
            <p className="text-sm text-gray-400">选择适合您的超值积分包，畅享无限创意</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {pricingTiers.map((tier) => (
              <div
                key={tier.id}
                className={`relative flex flex-col p-8 rounded-3xl border transition-all duration-300 ${
                  tier.isPopular
                    ? "bg-[#1a1a1a] border-lime-300/50 shadow-[0_0_30px_rgba(212,255,63,0.1)] transform md:-translate-y-2"
                    : "bg-[#0a0a0a] border-white/10 hover:border-white/30"
                }`}
              >
                {tier.isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-lime-300 text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    HOT / 推荐
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-white mb-2">{tier.name}</h3>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-4xl font-bold text-white">¥{tier.price}</span>
                  </div>
                  <div className="text-sm text-gray-500 line-through">原价 ¥{tier.originalPrice}</div>
                </div>

                <div className="flex items-center gap-2 mb-8 bg-white/5 w-fit px-4 py-2 rounded-lg border border-white/5">
                   <Zap className="h-4 w-4 text-yellow-500 fill-current" />
                   <span className="text-lg font-bold text-white">{tier.points}</span>
                </div>

                <ul className="flex-1 space-y-4 mb-8">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-lime-300 shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-4 rounded-full font-bold text-sm transition-colors ${
                    tier.isPopular
                      ? "bg-lime-300 hover:bg-[#b5e62b] text-black"
                      : "bg-transparent border border-white/20 hover:bg-white/5 text-white"
                  }`}
                  onClick={() => {
                    // handleSubscribe(tier.id)
                  }}
                >
                  购买 {tier.name}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Transaction History */}
        <section>
          <div className="mb-6 border-b border-white/10 pb-4">
            <h2 className="text-2xl font-bold text-white">账单与明细</h2>
          </div>

          <div className="bg-[#111111] rounded-2xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-[#1a1a1a]">
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">时间</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">明细</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">数额</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{tx.date}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{tx.action}</td>
                      <td className={`px-6 py-4 text-sm font-semibold text-right whitespace-nowrap ${
                        tx.amount > 0 ? "text-lime-400" : "text-gray-400"
                      }`}>
                        {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Minimal Pagination Placeholder */}
            <div className="p-4 border-t border-white/5 flex items-center justify-center">
              <button className="text-xs text-gray-500 hover:text-white transition-colors">查看更多</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
