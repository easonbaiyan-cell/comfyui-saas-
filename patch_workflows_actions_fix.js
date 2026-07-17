const fs = require('fs');
const path = 'src/app/admin/workflows/actions.ts';
let content = fs.readFileSync(path, 'utf8');

// Undo the mistaken duplicate replacement in getCategoriesAction
content = content.replace(
    ".order('sort_order', { ascending: true })\n      .order('sort_order', { ascending: true, nullsFirst: false })\n      .order('created_at', { ascending: false });",
    ".order('sort_order', { ascending: true })\n      .order('created_at', { ascending: false });"
);

// Apply the replacement in getWorkflowsAction specifically
const oldGetWorkflowsAction = `
export async function getWorkflowsAction(accessToken: string) {
  try {
    const supabase = getAuthenticatedClient(accessToken);
    const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);

    if (userError || !userData.user || userData.user.id !== process.env.NEXT_PUBLIC_ADMIN_UUID) {
      throw new Error('Unauthorized');
    }

    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .order('created_at', { ascending: false });`;

const newGetWorkflowsAction = `
export async function getWorkflowsAction(accessToken: string) {
  try {
    const supabase = getAuthenticatedClient(accessToken);
    const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);

    if (userError || !userData.user || userData.user.id !== process.env.NEXT_PUBLIC_ADMIN_UUID) {
      throw new Error('Unauthorized');
    }

    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .order('sort_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });`;

content = content.replace(oldGetWorkflowsAction, newGetWorkflowsAction);

fs.writeFileSync(path, content);
console.log('Fixed actions.ts');
