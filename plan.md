1. **Define Database & Server Actions:**
   - Create a migration script `00000000000010_create_official_materials.sql` to define the `official_materials` table with `id`, `category`, `type`, `url`, and `created_at` (Done).
   - The migration also creates the `official_materials` storage bucket and policies (Done).
   - Create `src/actions/officialMaterials.ts` to export Server Actions: `getOfficialMaterials`, `getAllOfficialMaterials`, `uploadOfficialMaterial`, and `deleteOfficialMaterial` using `@supabase/supabase-js` with service role key (Done).

2. **Admin Materials Management UI:**
   - Create `src/app/admin/materials/page.tsx` for managing official materials (Done).
   - It will include an upload form for uploading to Supabase Storage and saving the URL using Server Actions.
   - It will include a grid to display uploaded materials and delete them.
   - Update `src/app/admin/AdminSidebar.tsx` to include the "Materials" link (Done).

3. **Frontend Dynamic Fetch (C-End):**
   - Update `src/components/MaterialLibraryModal.tsx` to use `useEffect` and `getOfficialMaterials` action to fetch real materials based on `nodeCategory`.
   - Remove the `getMockMaterials` function and render the real URLs in the "official" tab.

4. **Pre-commit and Submit:**
   - Run `pre_commit_instructions` and follow its checks.
   - Submit the PR.
