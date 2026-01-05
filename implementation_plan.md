# Implementation Plan: Marketplace Tax & Commission Engine

## 1. Executive Summary

We are building a standalone EU-Only Marketplace Tax & Commission Engine for a Saleor instance. This app handles financial logic, VAT compliance, and automated invoicing.

## 2. Technical Stack

- **Framework**: Next.js 15.1.4 (App Router)
- **Database**: Prisma 7 + Vercel Postgres
- **Storage**: Vercel Blob (for PDF Invoices)
- **Saleor SDK**: @saleor/app-sdk (v1.5.0)

## 3. Core Logic

### 3.1 Commission Calculation

Orders are parsed for line items, grouped by the "Brand" attribute (`QXR0cmlidXRlOjQ0`). A 10% platform fee is calculated from the net total and stored in the `Commission` table.

### 3.2 Automated Invoicing

Two invoices are generated per order:

1. **Customer Receipt**: Destination-based VAT invoice. Brand = Seller.
2. **Commission Invoice**: B2B Reverse-Charge (0% VAT) invoice. Platform = Seller, Brand = Buyer.

## 4. Immediate Deployment Steps

### Step 1: Environment Variables

The following must be added to Vercel:

- `SALEOR_API_URL`: `https://dashboard.salp.shop/graphql/`
- `APP_URL`: Your deployment URL
- `APL`: `vercel`
- `POSTGRES_PRISMA_URL`: (Auto-linked)
- `BLOB_READ_WRITE_TOKEN`: (Auto-linked)

### Step 2: Database Setup

Run migrations locally pointing to Vercel string:
`npx prisma migrate dev`

### Step 3: Saleor Registration

Install the app in Saleor Dashboard using the manifest URL.

## 5. Build Stability Fixes (Applied)

- Fixed `@saleor/app-sdk` module resolution issues by using specific entry points (`@saleor/app-sdk/saleor-app`).
- Addressed `VercelKvApl` import path changes in SDK v1.5.0.
- Resolved Props typing in `react-pdf` components.
