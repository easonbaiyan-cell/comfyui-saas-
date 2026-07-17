const fs = require('fs');
let code = fs.readFileSync('src/components/Header.tsx', 'utf-8');

// 1. new states in Header component
const stateDecs = `const [unreadMessages, setUnreadMessages] = useState(true);`;
const stateDecsNew = `const [unreadMessages, setUnreadMessages] = useState(true);\n  const [messageTab, setMessageTab] = useState<"official" | "tasks">("official");\n  // eslint-disable-next-line @typescript-eslint/no-explicit-any\n  const [videoTasks, setVideoTasks] = useState<any[]>([]);`;
code = code.replace(stateDecs, stateDecsNew);

// 2. Polling effect inside Header component
const pollingEffect = `
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isMessageOpen && user) {
      // initial fetch
      const fetchTasks = async () => {
        const { data } = await supabase
          .from('video_tasks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);
        if (data) setVideoTasks(data);
      };

      fetchTasks();

      interval = setInterval(fetchTasks, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMessageOpen, user]);
`;
const useEffectHook = `useEffect(() => {
    // Initial fetch`;
code = code.replace(useEffectHook, pollingEffect + '\n  ' + useEffectHook);

// 3. Tab UI replacing hardcoded Tab
const oldTabs = `{/* 分类 Tab */}
          <div className="px-4 border-b border-white/5">
            <div className="inline-block py-3 text-sm font-medium text-white border-b-2 border-primary-green">
              官方消息
            </div>
          </div>`;

const newTabs = `{/* 分类 Tab */}
          <div className="px-4 border-b border-white/5 flex gap-4">
            <div
              className={\`cursor-pointer inline-block py-3 text-sm font-medium transition-colors \${messageTab === 'official' ? 'text-white border-b-2 border-primary-green' : 'text-gray-400 hover:text-white border-b-2 border-transparent'}\`}
              onClick={() => setMessageTab('official')}
            >
              官方消息
            </div>
            <div
              className={\`cursor-pointer inline-block py-3 text-sm font-medium transition-colors \${messageTab === 'tasks' ? 'text-white border-b-2 border-primary-green' : 'text-gray-400 hover:text-white border-b-2 border-transparent'}\`}
              onClick={() => setMessageTab('tasks')}
            >
              生成任务
            </div>
          </div>`;
code = code.replace(oldTabs, newTabs);

// 4. Render logic based on active tab
const newRenderBlock = `{/* 消息列表 */}
          <div className="flex-1 overflow-y-auto p-4">
            {messageTab === "official" ? (
              <>
                <MockMessage title="全新「控制台」上线" date="2026-05-15" content="原消费记录已全面升级，提供更清晰的账单明细和使用分析。" isGreen={true} />
                <MockMessage title="充值优惠活动" date="2026-05-12" content="本月充值积分享受额外20%赠送，多充多送，活动限时进行中。" isGreen={true} />
                <MockMessage title="系统维护通知" date="2026-05-01" content="预计于周日凌晨2点进行系统升级，期间可能出现短暂的访问波动。" isGreen={false} />
              </>
            ) : (
              <div className="flex flex-col gap-3">
                {videoTasks.length === 0 ? (
                  <div className="text-center text-gray-500 text-sm mt-10">暂无生成任务</div>
                ) : (
                  videoTasks.map(task => (
                    <div key={task.id} className="bg-[#1a1a1a] rounded-lg p-3 border border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400 font-mono truncate max-w-[140px]">{task.id}</span>
                        <span className={\`text-[10px] px-2 py-0.5 rounded-full font-medium \${
                          task.status === 'success' ? 'bg-primary-green/20 text-primary-green' :
                          task.status === 'failed' ? 'bg-danger-red/20 text-danger-red' :
                          'bg-yellow-500/20 text-yellow-500 animate-pulse'
                        }\`}>
                          {task.status === 'success' ? '已完成' : task.status === 'failed' ? '失败' : '生成中'}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-500">{new Date(task.created_at).toLocaleString()}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>`;

code = code.replace(/\{\/\* 消息列表 \*\/\}\n\s*<div className="flex-1 overflow-y-auto p-4">[\s\S]*?isGreen=\{false\} \/>\n\s*<\/div>/, newRenderBlock);

fs.writeFileSync('src/components/Header.tsx', code);
