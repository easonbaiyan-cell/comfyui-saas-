1. **Update Header.tsx:**
   - Import `isDistributor` from `useAuthStore` in `src/components/Header.tsx`.
   - In the "常规功能导航菜单" (General Function Navigation Menu) section of the profile dropdown, conditionally render a link to `/affiliate` titled "分销中心" (Distributor Center) if `isDistributor` is true.

2. **Create Affiliate Page (`/affiliate`):**
   - Create `src/app/affiliate/page.tsx`.
   - Implement route protection: if there is no user or `isDistributor` is false, redirect to `/`. I will use a client-side redirect using `useRouter` from `next/navigation` combined with a `useEffect` and `useAuthStore`.
   - Mock data for "累计预估收益（￥）", "可结算余额（￥）", and "我邀请的用户数".
   - Create a UI with "暗黑科技风" (dark tech style).
   - Add a notice "本页面仅作收益记账，实际结算请联系专属商务进行线下打款" clearly on the page.
   - Add Tabs to switch between "我的邀请记录" (My Invite Records) and "分佣账单" (Commission Bills). The tabs will just show empty/mock content for now.

3. **Pre-commit checks**
