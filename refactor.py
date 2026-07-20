import json
import re

with open('./src/app/admin/settings/page.tsx', 'r') as f:
    content = f.read()

# First add imports
imports_to_add = "import { Trash2, Plus, UploadCloud, Loader2, X } from 'lucide-react';\n"
content = content.replace("import { Button } from '@/components/ui/button';", "import { Button } from '@/components/ui/button';\n" + imports_to_add)

# Add states for membership packages and topup packages, and image upload loading state
states_to_add = """  const [membershipPackages, setMembershipPackages] = useState<any[]>([]);
  const [pointsTopupPackages, setPointsTopupPackages] = useState<any[]>([]);
  const [isUploadingQR, setIsUploadingQR] = useState(false);
"""
content = content.replace("const [saving, setSaving] = useState(false);", "const [saving, setSaving] = useState(false);\n" + states_to_add)

# Modify fetchSettings to also set the specific package states
fetch_replacement = """        membership_packages: data.membership_packages ? JSON.stringify(data.membership_packages, null, 2) : '',
        points_topup_packages: data.points_topup_packages ? JSON.stringify(data.points_topup_packages, null, 2) : ''
      });
      setMembershipPackages(data.membership_packages || []);
      setPointsTopupPackages(data.points_topup_packages || []);"""
content = content.replace("""        membership_packages: data.membership_packages ? JSON.stringify(data.membership_packages, null, 2) : '',
        points_topup_packages: data.points_topup_packages ? JSON.stringify(data.points_topup_packages, null, 2) : ''
      });""", fetch_replacement)

# Modify handleSave to use the new state variables directly
handle_save_orig = """    try {
      let membership_packages = [];
      let points_topup_packages = [];

      try {
        membership_packages = formData.membership_packages ? JSON.parse(formData.membership_packages) : [];
        points_topup_packages = formData.points_topup_packages ? JSON.parse(formData.points_topup_packages) : [];
      } catch (e) {
        alert("JSON parse error, please check the format of JSON fields.");
        setSaving(false);
        return;
      }"""
handle_save_new = """    try {
      let membership_packages = membershipPackages;
      let points_topup_packages = pointsTopupPackages;"""
content = content.replace(handle_save_orig, handle_save_new)

# Add Image Upload Function
image_upload_func = """  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingQR(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('site-assets')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('site-assets')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, cs_qrcode_url: publicUrl }));
      alert('上传成功');
    } catch (error: any) {
      alert(`上传失败: ${error.message}`);
    } finally {
      setIsUploadingQR(false);
    }
  };
"""
content = content.replace("const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {", image_upload_func + "\n  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {")

# Replace QRCode Input Field with Image Uploader
qr_input_orig = """        <div className="flex flex-col space-y-2">
          <label className="text-sm text-gray-400">客服二维码URL (QR Code URL)</label>
          <input
            type="text"
            name="cs_qrcode_url"
            value={formData.cs_qrcode_url}
            onChange={handleChange}
            className="bg-gray-800 border border-gray-700 rounded-md p-2 text-white"
            placeholder="https://..."
          />
        </div>"""
qr_input_new = """        <div className="flex flex-col space-y-2">
          <label className="text-sm text-gray-400">客服二维码 (QR Code Image)</label>
          {formData.cs_qrcode_url ? (
            <div className="relative w-32 h-32 group">
              <img src={formData.cs_qrcode_url} alt="QR Code" className="w-full h-full object-cover rounded-md border border-gray-700" />
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                <label className="cursor-pointer flex flex-col items-center text-xs text-white">
                  <UploadCloud className="w-5 h-5 mb-1" />
                  重新上传
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
            </div>
          ) : (
            <label className="w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-700 rounded-md cursor-pointer hover:border-primary-green hover:bg-gray-800/50 transition-colors">
              {isUploadingQR ? (
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
              ) : (
                <>
                  <UploadCloud className="w-6 h-6 text-gray-400 mb-2" />
                  <span className="text-xs text-gray-500">点击上传</span>
                </>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={isUploadingQR} />
            </label>
          )}
        </div>"""
content = content.replace(qr_input_orig, qr_input_new)


with open('./src/app/admin/settings/page.tsx', 'w') as f:
    f.write(content)
