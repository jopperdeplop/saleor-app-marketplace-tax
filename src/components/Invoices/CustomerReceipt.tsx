/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Register a clean font if needed, or use defaults
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 20,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  invoiceInfo: {
    textAlign: 'right',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    textTransform: 'uppercase',
    color: '#666',
  },
  table: {
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginTop: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
    height: 30,
  },
  tableHeader: {
    backgroundColor: '#f9f9f9',
    fontWeight: 'bold',
  },
  tableCell: {
    padding: 5,
  },
  colDesc: { width: '50%' },
  colQty: { width: '10%', textAlign: 'center' },
  colPrice: { width: '20%', textAlign: 'right' },
  colTotal: { width: '20%', textAlign: 'right' },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#999',
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 20,
  },
  totalsSection: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  totalLabel: {
    width: 100,
    textAlign: 'right',
    marginRight: 10,
  },
  totalVal: {
    width: 60,
    textAlign: 'right',
    fontWeight: 'bold',
  }
});

interface CustomerReceiptProps {
  order: any;
  vendor: any;
  items: any[];
}

export const CustomerReceipt = ({ order, vendor, items }: CustomerReceiptProps) => (
  <Document>
    <Page size='A4' style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.brandTitle}>{vendor.brandName}</Text>
          <Text>{vendor.address || ''}</Text>
          <Text>VAT ID: {vendor.vatNumber || 'N/A'}</Text>
        </View>
        <View style={styles.invoiceInfo}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>RECEIPT</Text>
          <Text>Order #: {order.number}</Text>
          <Text>Date: {new Date().toLocaleDateString()}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Info</Text>
        <Text>{order.billingAddress?.firstName} {order.billingAddress?.lastName}</Text>
        <Text>{order.billingAddress?.streetAddress1}</Text>
        <Text>{order.billingAddress?.city}, {order.billingAddress?.postalCode}</Text>
        <Text>{order.billingAddress?.country?.code}</Text>
      </View>

      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCell, styles.colDesc]}>Item</Text>
          <Text style={[styles.tableCell, styles.colQty]}>Qty</Text>
          <Text style={[styles.tableCell, styles.colPrice]}>Price</Text>
          <Text style={[styles.tableCell, styles.colTotal]}>Total</Text>
        </View>
        {items.map((line, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.colDesc]}>{line.productName}</Text>
            <Text style={[styles.tableCell, styles.colQty]}>{line.quantity}</Text>
            <Text style={[styles.tableCell, styles.colPrice]}>{line.unitPrice.gross.amount.toFixed(2)}</Text>
            <Text style={[styles.tableCell, styles.colTotal]}>{line.totalPrice.gross.amount.toFixed(2)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.totalsSection}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal (Net):</Text>
          <Text style={styles.totalVal}>
            {items.reduce((acc, l) => acc + l.totalPrice.net.amount, 0).toFixed(2)}
          </Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>VAT:</Text>
          <Text style={styles.totalVal}>
            {(items.reduce((acc, l) => acc + l.totalPrice.gross.amount, 0) - items.reduce((acc, l) => acc + l.totalPrice.net.amount, 0)).toFixed(2)}
          </Text>
        </View>
        <View style={[styles.totalRow, { marginTop: 10, fontSize: 14 }]}>
          <Text style={styles.totalLabel}>TOTAL:</Text>
          <Text style={styles.totalVal}>
            {items.reduce((acc, l) => acc + l.totalPrice.gross.amount, 0).toFixed(2)} {order.total.gross.currency}
          </Text>
        </View>
      </View>

      <Text style={styles.footer}>
        This is a digital receipt generated by the Marketplace Tax Engine. 
        Thank you for shopping on our marketplace!
      </Text>
    </Page>
  </Document>
);
