# Task Checklist: Saleor Marketplace Tax & Commission Engine

## Current Status: [IN PROGRESS]

### Phase 1: Manual Configuration [100% DONE]

- [x] **Saleor Tax Rates**: 20% default set for all Eurozone channels.
- [x] **Brand Attribute**: Identified as `QXR0cmlidXRlOjQ0`.

### Phase 2: Repository & Scaffolding [100% DONE]

- [x] **Project Initialized**: Next.js app created.
- [x] **Prisma Schema**: Defined `VendorProfile`, `Commission`, and `InvoiceLog` models.
- [x] **Core Services**: Initial implementation of `commission.ts` and `invoice-generator.ts`.
- [x] **Git**: Local repo initialized and pushed to GitHub.

### Phase 3: Deployment & Build Fixes [IN PROGRESS]

- [x] **Downgrade Next.js**: Pin to `15.1.4` to avoid Turbopack/SDK conflicts.
- [x] **Fix SDK Imports**: Update to explicit `v1.5.0` paths in `saleor-app.ts` and `route.ts`.
- [x] **TypeScript Fixes**: Add explicit types to invoice components.
- [x] **React-PDF Fixes**: Remove non-standard CSS properties causing build errors.
- [x] **Push Fixes**: Pushed to `master` (Wait for Vercel rebuild).

### Phase 4: Integration & Validation [PENDING]

- [ ] **Vercel Settings**: Add environment variables (`SALEOR_API_URL`, `APP_URL`, `APL`, etc.).
- [ ] **Database Migration**: Run `npx prisma migrate dev` against Vercel DB.
- [ ] **Manifest Installation**: Install via `https://[APP_URL]/api/manifest`.

### Phase 5: Future Roadmap [PENDING]

- [ ] **OSS Export**: Quarterly CSV reports for EU tax filing.
- [ ] **Self-Billing**: UI toggle in Vendor Profiles.
- [ ] **Auto-Emailing**: Send PDFs to vendors upon payment.
- [ ] **Portal Bridge**: Dashboard tab in Saleor Portal.
