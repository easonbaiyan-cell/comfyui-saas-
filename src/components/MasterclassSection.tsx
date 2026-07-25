'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface MasterclassLesson {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  syllabus: string[];
}

const lessons: MasterclassLesson[] = [
  {
    id: '1',
    number: '01',
    title: '平台掘金模式解析',
    subtitle: '深入了解底层商业逻辑',
    syllabus: ['1. 平台生态与流量分发机制', '2. 变现模式的底层逻辑', '3. 核心竞争力构建'],
  },
  {
    id: '2',
    number: '02',
    title: '高转化账号定位',
    subtitle: '打造极具吸引力的IP',
    syllabus: ['1. 目标人群画像分析', '2. 差异化人设打造', '3. 主页视觉设计原则'],
  },
  {
    id: '3',
    number: '03',
    title: '爆款内容选题库',
    subtitle: '源源不断的创作灵感',
    syllabus: ['1. 挖掘平台热门趋势', '2. 建立结构化选题库', '3. 痛点与爽点分析'],
  },
  {
    id: '4',
    number: '04',
    title: '吸睛文案写作指南',
    subtitle: '用文字抓住用户注意力',
    syllabus: ['1. 黄金前3秒文案框架', '2. 情绪价值在文案中的运用', '3. 促转化引导话术'],
  },
  {
    id: '5',
    number: '05',
    title: '高效视频剪辑实战',
    subtitle: '快速产出高质量视频',
    syllabus: ['1. 剪辑软件基础操作', '2. 节奏感与卡点技巧', '3. 特效与转场的合理运用'],
  },
  {
    id: '6',
    number: '06',
    title: '自然流推荐算法破解',
    subtitle: '让你的内容被更多人看到',
    syllabus: ['1. 算法推荐机制深度拆解', '2. 互动指标提升策略', '3. 破播放层级方法论'],
  },
  {
    id: '7',
    number: '07',
    title: '矩阵号批量矩阵运营',
    subtitle: '放大你的流量收益',
    syllabus: ['1. 矩阵号搭建防关联技巧', '2. 内容批量化生产SOP', '3. 矩阵账号引流策略'],
  },
  {
    id: '8',
    number: '08',
    title: '直播带货人货场',
    subtitle: '打造高转化直播间',
    syllabus: ['1. 主播话术与状态调整', '2. 爆款选品与排品逻辑', '3. 直播间场景搭建与灯光'],
  },
  {
    id: '9',
    number: '09',
    title: '私域流量沉淀与转化',
    subtitle: '建立属于你的高粘性客户池',
    syllabus: ['1. 公域转私域的高效路径', '2. 朋友圈剧本式营销', '3. 社群发售与复购提升'],
  },
  {
    id: '10',
    number: '10',
    title: '商业广告变现路径',
    subtitle: '接单变现的技巧与避坑',
    syllabus: ['1. 商业报价与合作洽谈', '2. 软广植入的巧妙构思', '3. 广告数据复盘与优化'],
  },
  {
    id: '11',
    number: '11',
    title: 'AI辅助内容创作',
    subtitle: '利用AI提升创作效率',
    syllabus: ['1. AI工具库介绍与选择', '2. AI写脚本与生成图片', '3. AI配音与数字人应用'],
  },
  {
    id: '12',
    number: '12',
    title: '数据分析与复盘迭代',
    subtitle: '用数据指导运营决策',
    syllabus: ['1. 核心数据指标监控', '2. 爆款内容拆解复盘', '3. 账号健康度诊断'],
  },
  {
    id: '13',
    number: '13',
    title: '常见违规规避指南',
    subtitle: '保护你的账号资产',
    syllabus: ['1. 平台违规红线解析', '2. 限流降权原因排查', '3. 申诉与账号恢复技巧'],
  },
  {
    id: '14',
    number: '14',
    title: '百变人设脚本公式',
    subtitle: '套用公式快速出稿',
    syllabus: ['1. 痛点+反转脚本结构', '2. 故事化叙事技巧', '3. 专家身份塑造话术'],
  },
  {
    id: '15',
    number: '15',
    title: '全自动被动收益系统',
    subtitle: '躺赚模式的终极奥义',
    syllabus: ['1. 知识付费产品打包', '2. 自动分发与转化漏斗', '3. 个人IP长期价值构建'],
  },
];

export function MasterclassSection() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
          30讲系统实操大师班
        </h2>
        <p className="text-gray-400 text-lg md:text-xl">
          30节课·实践操作大师班
        </p>
      </div>

      {/* Grid */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {lessons.map((lesson) => {
          const isExpanded = expandedId === lesson.id;

          return (
            <div
              key={lesson.id}
              className={`flex flex-col border border-gray-800 bg-gray-900 rounded-xl overflow-hidden transition-colors duration-300 ${
                isExpanded ? 'border-[#D0FF2A]/50' : 'hover:border-[#D0FF2A]/50'
              }`}
            >
              {/* Card Header (Clickable) */}
              <button
                onClick={() => toggleExpand(lesson.id)}
                className="w-full text-left p-5 flex items-start justify-between focus:outline-none"
              >
                <div className="flex gap-4">
                  {/* Number Badge */}
                  <div className="bg-[#D0FF2A]/10 text-[#D0FF2A] font-bold text-xl rounded-lg px-2 py-1 h-fit">
                    {lesson.number}
                  </div>

                  {/* Title & Subtitle */}
                  <div className="flex flex-col">
                    <h3 className="text-white font-bold text-lg leading-tight mb-1">
                      {lesson.title}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {lesson.subtitle}
                    </p>
                  </div>
                </div>

                {/* Arrow Icon */}
                <div
                  className={`text-gray-500 transition-transform duration-300 mt-1 flex-shrink-0 ${
                    isExpanded ? 'rotate-180 text-[#D0FF2A]' : ''
                  }`}
                >
                  <ChevronDown className="w-5 h-5" />
                </div>
              </button>

              {/* Accordion Content */}
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="p-5 pt-0 bg-black/40 border-t border-gray-800/50">
                    <ul className="space-y-2 mt-4">
                      {lesson.syllabus.map((item, index) => (
                        <li key={index} className="text-gray-400 text-sm">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
