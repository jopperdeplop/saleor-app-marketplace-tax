import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica', color: '#333' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold' },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 10, fontWeight: 'bold', marginBottom: 5, color: '#999', textTransform: 'uppercase' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f9f9f9' },
  label: { fontWeight: 'bold' },
  totalBox: { marginTop: 30, padding: 20, backgroundColor: '#f9f9f9', borderRadius: 8 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  footer: { position: 'absolute', bottom: 40, left: 40, right: 40, textAlign: 'center', color: '#999', fontSize: 8 },
  reversed: { marginTop: 20, fontStyle: 'italic', color: '#666' }
});

export const CommissionInvoice = ({ order, vendor, commissionAmount }) => (
  <Document>
    <Page size='A4' style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>PLATFORM FEE</Text>
          <Text>Saleor Marketplace Platform</Text>
          <Text>Antigravity Street 1, AI City</Text>
        </View>
        <View style={{ textAlign: 'right' }}>
          <Text>Invoice ID: FEE-{order.number}</Text>
          <Text>Date: {new Date().toLocaleDateString()}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vendor Information (Buyer)</Text>
        <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{vendor.brandName}</Text>
        <Text>{vendor.address || 'Address not configured'}</Text>
        <Text>VAT ID: {vendor.vatNumber || 'N/A'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Service Details</Text>
        <View style={styles.row}>
          <Text>Marketplace Facilitation Fee for Order {order.number}</Text>
          <Text>{commissionAmount.toFixed(2)} {order.total.gross.currency}</Text>
        </View>
      </View>

      <View style={styles.totalBox}>
        <View style={styles.totalRow}>
          <Text>Subtotal (Net):</Text>
          <Text>{commissionAmount.toFixed(2)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text>VAT (0%):</Text>
          <Text>0.00</Text>
        </View>
        <View style={[styles.totalRow, { borderTopWidth: 1, borderTopColor: '#ddd', paddingTop: 10, marginTop: 10 }]}>
          <Text style={{ fontWeight: 'bold', fontSize: 14 }}>TOTAL DUE:</Text>
          <Text style={{ fontWeight: 'bold', fontSize: 14 }}>{commissionAmount.toFixed(2)} {order.total.gross.currency}</Text>
        </View>
      </View>

      <View style={styles.reversed}>
        <Text>Note: Reverse Charge Mechanism applies according to Art. 196 EU VAT Directive. 
        Zero-rated B2B service provided to an EU taxable person.</Text>
      </View>

      <Text style={styles.footer}>
        This invoice is generated automatically by the Saleor Marketplace Platform.
      </Text>
    </Page>
  </Document>
);
