import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { CustomerReceipt } from '@/components/Invoices/CustomerReceipt';
import { CommissionInvoice } from '@/components/Invoices/CommissionInvoice';

export const generateCustomerInvoice = async (order: any, vendor: any, items: any[]) => {
  return await renderToBuffer(
    <CustomerReceipt order={order} vendor={vendor} items={items} />
  );
};

export const generateCommissionInvoice = async (order: any, vendor: any, commissionAmount: number) => {
  return await renderToBuffer(
    <CommissionInvoice order={order} vendor={vendor} commissionAmount={commissionAmount} />
  );
};
