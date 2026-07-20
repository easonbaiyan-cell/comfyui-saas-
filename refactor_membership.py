import json
import re

with open('./src/app/admin/settings/page.tsx', 'r') as f:
    content = f.read()

# Helper for membership logic
membership_handlers = """
  const handleAddMembership = () => {
    setMembershipPackages([...membershipPackages, {
      name: '新套餐',
      current_price: 0,
      original_price: 0,
      points_per_month: 0,
      features: []
    }]);
  };

  const handleRemoveMembership = (index: number) => {
    const newPkgs = [...membershipPackages];
    newPkgs.splice(index, 1);
    setMembershipPackages(newPkgs);
  };

  const handleMembershipChange = (index: number, field: string, value: any) => {
    const newPkgs = [...membershipPackages];
    newPkgs[index] = { ...newPkgs[index], [field]: value };
    setMembershipPackages(newPkgs);
  };

  const handleAddFeature = (pkgIndex: number) => {
    const newPkgs = [...membershipPackages];
    if (!newPkgs[pkgIndex].features) {
      newPkgs[pkgIndex].features = [];
    }
    newPkgs[pkgIndex].features.push('新特权');
    setMembershipPackages(newPkgs);
  };

  const handleRemoveFeature = (pkgIndex: number, featureIndex: number) => {
    const newPkgs = [...membershipPackages];
    newPkgs[pkgIndex].features.splice(featureIndex, 1);
    setMembershipPackages(newPkgs);
  };

  const handleFeatureChange = (pkgIndex: number, featureIndex: number, value: string) => {
    const newPkgs = [...membershipPackages];
    newPkgs[pkgIndex].features[featureIndex] = value;
    setMembershipPackages(newPkgs);
  };
"""

content = content.replace("  const handleFileUpload", membership_handlers + "\n  const handleFileUpload")


# Replace Textarea with UI form
membership_ui_orig = """      <div className="space-y-4 border border-gray-700 p-6 rounded-xl bg-gray-900/50">
        <h2 className="text-xl font-semibold border-b border-gray-700 pb-2">会员套餐管理 (Membership Pricing Configuration)</h2>
        <p className="text-xs text-gray-500">JSON Format Array</p>
        <textarea
          name="membership_packages"
          value={formData.membership_packages}
          onChange={handleChange}
          className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white h-48 font-mono text-sm"
        />
      </div>"""

membership_ui_new = """      <div className="space-y-4 border border-gray-700 p-6 rounded-xl bg-gray-900/50">
        <div className="flex items-center justify-between border-b border-gray-700 pb-2">
          <h2 className="text-xl font-semibold">会员套餐管理 (Membership Pricing Configuration)</h2>
          <Button onClick={handleAddMembership} size="sm" className="bg-primary-green text-black hover:bg-primary-green/80 flex items-center">
            <Plus className="w-4 h-4 mr-1" />
            新增会员套餐
          </Button>
        </div>

        {membershipPackages.map((pkg, index) => (
          <div key={index} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 space-y-4 relative">
            <button
              onClick={() => handleRemoveMembership(index)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-400 transition-colors"
              title="删除套餐"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mr-8">
              <div className="flex flex-col space-y-1">
                <label className="text-xs text-gray-400">套餐名称</label>
                <input
                  type="text"
                  value={pkg.name || ''}
                  onChange={(e) => handleMembershipChange(index, 'name', e.target.value)}
                  className="bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white"
                  placeholder="如: 连续包月"
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-xs text-gray-400">当前价格 (¥)</label>
                <input
                  type="number"
                  value={pkg.current_price || ''}
                  onChange={(e) => handleMembershipChange(index, 'current_price', Number(e.target.value))}
                  className="bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white"
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-xs text-gray-400">原价 (¥)</label>
                <input
                  type="number"
                  value={pkg.original_price || ''}
                  onChange={(e) => handleMembershipChange(index, 'original_price', Number(e.target.value))}
                  className="bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white"
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-xs text-gray-400">每月赠送积分</label>
                <input
                  type="number"
                  value={pkg.points_per_month || ''}
                  onChange={(e) => handleMembershipChange(index, 'points_per_month', Number(e.target.value))}
                  className="bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white"
                />
              </div>
            </div>

            <div className="space-y-2 mt-4 pt-4 border-t border-gray-700">
              <div className="flex justify-between items-center">
                <label className="text-sm text-gray-300">特权列表 (Features)</label>
                <Button onClick={() => handleAddFeature(index)} size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 h-7 text-xs px-2">
                  <Plus className="w-3 h-3 mr-1" />
                  添加特权
                </Button>
              </div>
              {pkg.features && pkg.features.map((feature: string, fIndex: number) => (
                <div key={fIndex} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, fIndex, e.target.value)}
                    className="flex-1 bg-gray-900 border border-gray-700 rounded p-1.5 text-sm text-white"
                  />
                  <button onClick={() => handleRemoveFeature(index, fIndex)} className="text-gray-500 hover:text-red-400 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {(!pkg.features || pkg.features.length === 0) && (
                <p className="text-xs text-gray-500 italic">暂无特权</p>
              )}
            </div>
          </div>
        ))}
        {membershipPackages.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">暂无套餐，请点击右上角添加。</p>
        )}
      </div>"""
content = content.replace(membership_ui_orig, membership_ui_new)

with open('./src/app/admin/settings/page.tsx', 'w') as f:
    f.write(content)
