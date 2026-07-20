import json
import re

with open('./src/app/admin/settings/page.tsx', 'r') as f:
    content = f.read()

topup_handlers = """
  const handleAddTopup = () => {
    setPointsTopupPackages([...pointsTopupPackages, { points: 0, price: 0 }]);
  };

  const handleRemoveTopup = (index: number) => {
    const newPkgs = [...pointsTopupPackages];
    newPkgs.splice(index, 1);
    setPointsTopupPackages(newPkgs);
  };

  const handleTopupChange = (index: number, field: string, value: number) => {
    const newPkgs = [...pointsTopupPackages];
    newPkgs[index] = { ...newPkgs[index], [field]: value };
    setPointsTopupPackages(newPkgs);
  };
"""

content = content.replace("  const handleFileUpload", topup_handlers + "\n  const handleFileUpload")

topup_ui_orig = """      <div className="space-y-4 border border-gray-700 p-6 rounded-xl bg-gray-900/50">
        <h2 className="text-xl font-semibold border-b border-gray-700 pb-2">积分充值包管理 (Points Top-up Packages)</h2>
        <p className="text-xs text-gray-500">JSON Format Array</p>
        <textarea
          name="points_topup_packages"
          value={formData.points_topup_packages}
          onChange={handleChange}
          className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white h-48 font-mono text-sm"
        />
      </div>"""

topup_ui_new = """      <div className="space-y-4 border border-gray-700 p-6 rounded-xl bg-gray-900/50">
        <div className="flex items-center justify-between border-b border-gray-700 pb-2">
          <h2 className="text-xl font-semibold">积分充值包管理 (Points Top-up Packages)</h2>
          <Button onClick={handleAddTopup} size="sm" className="bg-primary-green text-black hover:bg-primary-green/80 flex items-center">
            <Plus className="w-4 h-4 mr-1" />
            新增充值档位
          </Button>
        </div>

        <div className="space-y-2">
          {pointsTopupPackages.map((pkg, index) => (
            <div key={index} className="flex items-center space-x-4 bg-gray-800/50 p-3 rounded-lg border border-gray-700">
              <div className="flex-1 flex items-center space-x-2">
                <label className="text-sm text-gray-400 w-16">积分数量</label>
                <input
                  type="number"
                  value={pkg.points || ''}
                  onChange={(e) => handleTopupChange(index, 'points', Number(e.target.value))}
                  className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white"
                />
              </div>
              <div className="flex-1 flex items-center space-x-2">
                <label className="text-sm text-gray-400 w-16">售价 (¥)</label>
                <input
                  type="number"
                  value={pkg.price || ''}
                  onChange={(e) => handleTopupChange(index, 'price', Number(e.target.value))}
                  className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white"
                />
              </div>
              <button onClick={() => handleRemoveTopup(index)} className="text-gray-500 hover:text-red-400 p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
          {pointsTopupPackages.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">暂无充值档位，请点击右上角添加。</p>
          )}
        </div>
      </div>"""
content = content.replace(topup_ui_orig, topup_ui_new)

with open('./src/app/admin/settings/page.tsx', 'w') as f:
    f.write(content)
