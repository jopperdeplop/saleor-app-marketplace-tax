# Marketplace Tax & Commission Engine Documentation

This document outlines the functionality of the Marketplace Tax Application and its integration with the Saleor Portal. The system is designed to automate commission tracking, tax compliance, and invoice generation for a multi-vendor marketplace.

## 1. Admin Functionality

_For Platform Owners and Marketplace Managers_

### **Global Configuration**

Admins have control over the baseline economics of the marketplace.

- **Global Settings Access**: Located on the main dashboard of the Tax App.
- **Default Commission Rate**: Set a global percentage (e.g., 10%) that applies automatically to all new vendors when they are first discovered by the system.

### **Vendor Management & Overrides**

The system automatically creates vendor profiles when orders are processed, but Admins have granular control over specific vendor terms.

- **Vendor List**: View all active vendors, their registered "Brand Attribute" slug, and current status.
- **Vendor Detail Portal**: A dedicated dashboard for each vendor that displays:
  - **Performance Stats**: Total aggregated commissions and pending order syncs.
  - **Invoice History**: A complete audit trail of all generated invoices (Customer Receipts and Commission Invoices).
- **Commission Overrides**:
  - **Temporary Rates**: Admins can set a "Temporary Commission Rate" (lower or higher) for a specific vendor.
  - **Time-Bound**: These overrides are set with an specific **End Date**.
  - **Effective Rate Logic**: The system automatically calculates the "Effective Rate" for every order. It checks if a valid override exists and is not expired; otherwise, it reverts to the vendor's standard rate.

### **System Monitoring**

- **Dashboard Overview**: Provides a "System Health" check and summary of connected services (Database, Object Storage, Saleor API).
- **Invoice Auditing**: Admins can download any generated invoice directly from the Vendor Detail view to verify accuracy.

---

## 2. Vendor Functionality

_For Marketplace Sellers/Partners (Accessed via Saleor Portal)_

### **Access**

Vendors access their tax and financial data seamlessly through the main Saleor Portal they use for product management.

- **Navigation**: A dedicated **"Tax & Invoices"** link is available in the sidebar under the active vendor's session.

### **Tax Compliance Dashboard**

This vendor-facing page provides a simplified, read-only view of their financial standing:

- **Commission Rate**: Displays their current contracted commission percentage.
- **Financial Overview**:
  - **Total Commissions**: The total amount of fees owed/paid to the platform.
  - **Pending Sync**: Number of orders currently being processed or awaiting final settlement.
  - **VAT Compliance**: Status indicator (e.g., "Active").
- **Documents**:
  - **Invoice List**: A tabular view of all relevant invoices generated for their orders.
  - **One-Click Download**: Direct links to download PDF copies of Commission Invoices (Platform Fees) and Customer Invoices (Receipts).

---

## 3. Automated System Logic

_How the "Creation" works behind the scenes_

### **Order Processing (Webhook Driven)**

1.  **Trigger**: The system listens for the `ORDER_PAID` event from the Saleor core.
2.  **Verification**: Every request is cryptographically verified using Saleor's JWKS signature to ensure security.
3.  **Vendor Identification**: The system parses the order lines to identify the "Brand" attribute, grouping items by vendor.

### **Commission Calculation**

For every vendor involved in an order:

1.  **Profile Check**: If the vendor doesn't exist in the Tax DB, they are auto-created using the **Global Default Rate**.
2.  **Rate Determination**:
    - _Step 1_: Is there a **Temporary Override** set?
    - _Step 2_: Is the current date before the **Override End Date**?
    - _Result_: Use Override Rate if Yes, otherwise use Standard Rate.
3.  **Math**: `Commission = (Net Sales for Brand) * (Effective Rate / 100)`.

### **Invoice Generation & Storage**

1.  **PDF Creation**: The system dynamically generates two PDF documents using `@react-pdf/renderer`:
    - **Customer Invoice**: Itemized receipt for the end-user.
    - **Commission Invoice**: A tax document billing the vendor for the platform fee.
2.  **Blob Storage**: These binary files are uploaded to Vercel Blob storage.
3.  **Record Keeping**: Public URLs for these files are stored in the PostgreSQL database and linked to the Order and Vendor Profile.
