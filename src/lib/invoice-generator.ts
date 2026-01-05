import { renderToBuffer } from "@react-pdf/renderer";
// import { CustomerReceipt } from "@/components/Invoices/CustomerReceipt";

export const generateCustomerInvoice = async (order: any, vendor: any) => {
  // Placeholder for real PDF component rendering
  return Buffer.from("PDF Content Placeholder");
};

export const generateCommissionInvoice = async (order: any, vendor: any, commission: any) => {
  return Buffer.from("Commission Invoice PDF Placeholder");
};
