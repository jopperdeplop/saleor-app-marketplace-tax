import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { put } from '@vercel/blob';
import { prisma } from '@/lib/prisma';
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

export const saveInvoice = async (
  orderId: string,
  type: 'CUSTOMER' | 'COMMISSION',
  buffer: Buffer,
  vendorSlug: string
) => {
  const filename = `invoices/${type.toLowerCase()}-${orderId}-${vendorSlug}.pdf`;
  
  const blob = await put(filename, buffer, {
    access: 'public',
    contentType: 'application/pdf',
  });

  await prisma.invoiceLog.create({
    data: {
      orderId,
      type,
      url: blob.url,
    },
  });

  return blob.url;
};
