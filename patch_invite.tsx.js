const fs = require('fs');
let code = fs.readFileSync('src/components/InviteModal.tsx', 'utf-8');

// 1. Add useState import
code = code.replace('import { BaseModal } from "./BaseModal";', 'import { BaseModal } from "./BaseModal";\nimport { useState } from "react";');

// 2. Add copy state and functions
const componentStart = `export function InviteModal({ isOpen, onClose }: InviteModalProps) {
  if (!isOpen) return null;`;
const componentStartNew = `export function InviteModal({ isOpen, onClose }: InviteModalProps) {
  const [copiedType, setCopiedType] = useState<"code" | "link" | null>(null);

  const handleCopy = (text: string, type: "code" | "link") => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    });
  };

  if (!isOpen) return null;`;
code = code.replace(componentStart, componentStartNew);

// 3. Bind copy code button
const codeCopyBtn = `<Button variant="outline" className="rounded-full border-white/20 text-white bg-transparent hover:bg-white/10 hover:text-white px-6">
                复制
              </Button>`;
const codeCopyBtnNew = `<Button
                variant="outline"
                className="rounded-full border-white/20 text-white bg-transparent hover:bg-white/10 hover:text-white px-6 transition-all"
                onClick={() => handleCopy("c19wfslk", "code")}
              >
                {copiedType === "code" ? "已复制" : "复制"}
              </Button>`;
code = code.replace(codeCopyBtn, codeCopyBtnNew);

// 4. Bind copy link button
const linkCopyBtn = `<Button className="bg-primary-green hover:bg-primary-green/80 text-black rounded-full h-8 px-4 text-xs font-medium transition-colors shadow-lg shadow-primary-green/20">
                复制分享链接 ➔
              </Button>`;
const linkCopyText = "宝子们，我发现一个AI视频宝藏产品 Papagaga！每天发布数百个超有趣好用的AI工作流。打开链接：https://papagaga.com?inviteCode=c19wfslk 注册即可领取 10,000 积分免费生成视频！";
const linkCopyBtnNew = `<Button
                className="bg-primary-green hover:bg-primary-green/80 text-black rounded-full h-8 px-4 text-xs font-medium transition-colors shadow-lg shadow-primary-green/20"
                onClick={() => handleCopy("${linkCopyText}", "link")}
              >
                {copiedType === "link" ? "已复制" : "复制分享链接 ➔"}
              </Button>`;
code = code.replace(linkCopyBtn, linkCopyBtnNew);

fs.writeFileSync('src/components/InviteModal.tsx', code);
