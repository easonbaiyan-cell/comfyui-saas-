# Plan

1. **Database Schema Setup**
   - Create migration `00000000000005_create_global_settings.sql` to create `global_settings` table.
   - Insert a default row in the migration.
   - Run the migration using `npx supabase db reset` or executing it directly.

2. **Admin UI Implementation**
   - Create `src/app/admin/settings/page.tsx` for the "Global Settings" module.
   - Form fields:
     - Top Banner: `banner_enabled`, `banner_text`, `banner_highlight_tag`, `banner_discount_text`, `banner_countdown_end`
     - Customer Service: `cs_qrcode_url` (with upload to storage or text input), `cs_wechat_id`
     - Membership Pricing (JSON): `membership_packages`
     - Points Top-up (JSON): `points_topup_packages`
   - Use Supabase client to fetch and save.

3. **Frontend Implementation**
   - **Store/Context**: Create a fetch utility or context for `global_settings` or fetch on page load if Server Component, but since they are scattered (Header, PromoBanner, Modal), fetching in a global store (zustand or context) or in root layout and passing down is better. Since `layout.tsx` fetches `site_settings` now, we'll update it to fetch `global_settings` and pass it down via a Context or Zustand store, OR just fetch in the components if they are Client Components. Wait, `useAuthStore` could be updated, or we just create a `useSettingsStore` or fetch inside `layout.tsx` and pass via React Context. Since `site_settings` is fetched in layout, we can fetch `global_settings` there and put it in a context or pass props. Wait, `Header` and `PromoBanner` are rendered in `layout.tsx`. Let's just fetch it in `layout.tsx`.
   - Update `src/app/layout.tsx`: Fetch `global_settings` instead of/along with `site_settings`. Pass down to `PromoBanner` and `Header`.
   - `PromoBanner.tsx`: Accept the dynamic fields.
   - `Header.tsx`: Pass `cs_qrcode_url` and `cs_wechat_id` down to Header for the hover icon.
   - Update `PricingModal.tsx`: Fetch `global_settings` to populate `plans`. Or pass via a Context. Let's create a Client Component Context for global settings so that deep modals can access it.
   - Update `PointsModal.tsx`: Fetch `global_settings` for `pricingTiers` instead of hardcoded array.

4. **Pre-commit checks**
   - Run linter and type checks (`npm run build`).

5. **Submit changes**
