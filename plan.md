1. **Update Database Model**
   - Create a migration file in `supabase/migrations/` (e.g., `00000000000007_add_is_distributor.sql`) to add `is_distributor BOOLEAN DEFAULT false` to the `profiles` table. (Already created).
   - *Since I don't have Supabase CLI available in the test environment, I might not need to run the migration locally if it's meant for a PR.*

2. **Update Global State (Zustand)**
   - I need to update the auth store (`src/store/auth.ts`) to fetch and store `is_distributor`. However, Supabase Auth user object (`user.user_metadata`) doesn't automatically contain this if it's in the `profiles` table. But the instructions say: `确保全局状态 (Zustand) 能正确拉取该字段` (ensure global state can correctly pull this field).
   - Actually, I can just add `is_distributor: boolean` to the `useAuthStore` and fetch it when setting the user in the header, or handle it where appropriate. Since memory explicitly says: `Absolutely forbid querying the profiles table for points (e.g., supabase.from('profiles').select('points')) anywhere in the codebase ... due to severe 406 network crashes`, maybe I need to be careful querying `profiles` at all? Or maybe we should add `is_distributor` directly to `user_metadata` or just `profiles`? Memory says: `We need to add a field in the user system (Supabase's profiles table or users table)`. Since the migrations show `profiles`, we can add it there. Wait, memory says `Absolutely forbid querying the profiles table for points`. We might just query `is_distributor`? Or just put it in the Zustand store. Wait, if we can't query `profiles`, maybe we can't fetch it on the client without errors. Let's see how they do it. The instructions don't forbid querying other fields, just `points`. Actually, I'll update `src/store/auth.ts` to include `is_distributor: boolean; setIsDistributor: (val: boolean) => void;`. I might need to update the Header or wherever the auth state is initialized to fetch this field. Wait, if we add it to `auth.users.raw_user_meta_data`, it might be easier. Let's stick to adding it to `profiles` as done in the migration.

3. **Create Server Actions for Admin Users**
   - Create `src/app/admin/users/actions.ts` containing:
     - `getUsersAction(token: string)`: Retrieves users from `profiles` joined with `auth.users` (if possible, or just mock/query `profiles`). The instructions state: `When displaying user information in admin tables that requires data from auth.users (like emails or phone numbers), fallback to displaying the user's UUID if direct joins are not available, as querying the auth schema securely requires specific admin RPCs or custom views.` So we will just query `profiles` (id, created_at, is_distributor) and show UUID for Nickname/ID.
     - `toggleDistributorAction(token: string, userId: string, isDistributor: boolean)`: Updates the `is_distributor` field in the `profiles` table for the specified user.

4. **Build Admin Users Page**
   - Create `src/app/admin/users/page.tsx` displaying the Users page. It should fetch users and pass them to a Client Component.
   - Create `src/app/admin/users/UsersClient.tsx` that renders a Table.
     - Table columns: ID (UUID), Registration Time (created_at), Is Distributor (Toggle switch/Action button).
     - Implement the interaction logic: clicking the toggle calls `toggleDistributorAction` and updates the local state (optimistic update).

5. **Update Admin Sidebar**
   - Add `/admin/users` to the links in `src/app/admin/AdminSidebar.tsx`.

6. **Pre-commit Steps**
   - Run pre-commit instructions to ensure everything is proper before submitting.
