import { redirect } from 'next/navigation';

export default function AdminDashboardPage() {
  // Redirect to workflows as the primary admin page for now
  redirect('/admin/workflows');
}
