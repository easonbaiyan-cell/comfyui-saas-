const fs = require('fs');
let code = fs.readFileSync('src/app/workflow/[id]/page.tsx', 'utf-8');

// 1. Add elapsedTime state
const stateDecs = `const [isGenerating, setIsGenerating] = useState(false);`;
const stateDecsNew = `const [isGenerating, setIsGenerating] = useState(false);\n  const [elapsedTime, setElapsedTime] = useState(0);`;
code = code.replace(stateDecs, stateDecsNew);

// 2. Add size suggestion text
const uploadText = `<p className="text-xs text-gray-500">支持 JPG, PNG, WEBP 等格式</p>`;
const uploadTextNew = `<p className="text-xs text-gray-500">支持 JPG, PNG, WEBP 等格式</p>\n                    <p className="text-xs text-primary-green/70 mt-1">建议尺寸 9:16，不超过 10MB</p>`;
code = code.replace(uploadText, uploadTextNew);

// 3. Add effect to handle elapsed time timer when isGenerating is true
const injectionPoint = `const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {`;
const newEffect = `
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      setElapsedTime(0);
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGenerating]);
`;
code = code.replace(injectionPoint, newEffect + '\n  ' + injectionPoint);

// 4. Update generating UI text to include timer
const generatingText = `<p className="text-sm font-medium animate-pulse">正在生成，请耐心等待...</p>`;
const generatingTextNew = `<div className="flex flex-col items-center gap-2">
                    <p className="text-sm font-medium animate-pulse">正在生成，请耐心等待...</p>
                    <div className="bg-primary-green/10 text-primary-green text-xs font-mono px-3 py-1 rounded-full border border-primary-green/20">
                      已用时间: {elapsedTime} 秒
                    </div>
                  </div>`;
code = code.replace(generatingText, generatingTextNew);

fs.writeFileSync('src/app/workflow/[id]/page.tsx', code);
