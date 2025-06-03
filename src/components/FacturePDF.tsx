import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';

interface Product {
  productId: string;
  lib: string;
  category: string;
  mesure: string;
  price: number;
  quantity: number;
  total: number;
}

interface Order {
  id?: string;
  createdTime?: string;
  totalAmount?: number;
  totalProducts?: number;
  products?: Product[];
  farmerId?: string;
  name?: string;
  email?: string;
  compteOwo?: string;
  // Customer info
  customerName?: string;
  customerCompany?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  orderNumber?: string;
  orderDate?: string;
  customerRef?: string;
  fields?: any;
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    padding: 30,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    color: '#2196f3',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 2,
  },
  companyAddress: {
    fontSize: 10,
    color: '#222',
    marginBottom: 2,
  },
  companyVAT: {
    fontSize: 10,
    color: '#222',
  },
  logoBox: {
    width: 120,
    alignItems: 'flex-end',
  },
  logo: {
    width: 90,
    height: 60,
    objectFit: 'contain',
    marginBottom: 4,
    marginLeft: 'auto',
  },
  agriConnectText: {
    color: '#7CB342',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'right',
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  customerInfo: {
    flex: 1.2,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 4,
  },
  customerTitle: {
    color: '#F9A825',
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 6,
  },
  customerLabel: {
    fontWeight: 'bold',
    fontSize: 10,
    marginBottom: 2,
  },
  customerValue: {
    fontSize: 10,
    marginBottom: 2,
  },
  summaryBox: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    borderRadius: 4,
    padding: 10,
    marginLeft: 16,
    minWidth: 180,
  },
  summaryTitle: {
    color: '#F9A825',
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 6,
    textAlign: 'right',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryLabel: {
    fontWeight: 'bold',
    fontSize: 10,
  },
  summaryValue: {
    fontSize: 10,
    textAlign: 'right',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#388E3C',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 11,
    alignItems: 'center',
    minHeight: 24,
    marginTop: 18,
  },
  tableHeaderCell: {
    flex: 1,
    padding: 4,
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 10,
    textAlign: 'center',
  },
  tableCategory: {
    color: '#F9A825',
    fontWeight: 'bold',
    fontSize: 11,
    marginTop: 10,
    marginBottom: 2,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderBottomStyle: 'solid',
    minHeight: 22,
  },
  tableCell: {
    flex: 1,
    padding: 4,
    fontSize: 10,
    textAlign: 'center',
  },
  productInfo: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    flex: 1,
    paddingLeft: 4,
  },
  productName: {
    fontWeight: 'bold',
    fontSize: 10,
    marginBottom: 2,
    textAlign: 'left',
  },
  productRef: {
    fontSize: 8,
    color: '#888',
    textAlign: 'left',
  },
  productImg: {
    width: 18,
    height: 18,
    marginRight: 4,
  },
  totalsBox: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    marginTop: 12,
    marginRight: 10,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 2,
  },
  totalsLabel: {
    fontSize: 10,
    color: '#222',
    minWidth: 60,
    textAlign: 'right',
    marginRight: 8,
  },
  totalsValue: {
    fontWeight: 'bold',
    fontSize: 10,
    color: '#222',
    minWidth: 60,
    textAlign: 'right',
  },
});

const TEMP_LOGO = 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Bitmap_Logo.png'; // À remplacer par ton logo plus tard
const TEMP_PRODUCT_IMG = 'https://cdn-icons-png.flaticon.com/512/135/135620.png'; // Icône légume/fruits

const FacturePDF: React.FC<{ order: Order }> = ({ order }) => {
  // Extraction des infos client et commande
  console.log('order')
  console.log(order)
  const products = order.products ?? order.fields?.products ?? [];
  const customer = {
    name: order.customerName || order.name || ((order.fields?.buyerFirstName?.[0] || '') + ' ' + (order.fields?.buyerLastName?.[0] || '')) || '',
    company: order.customerCompany || 'SOURX',
    phone: order.customerPhone || order.fields?.buyerPhone?.[0] || '',
    email: order.customerEmail || order.email || order.fields?.buyerEmail?.[0] || '',
    address: order.customerAddress || order.fields?.buyerAddress?.[0] || '',
  };
  const orderNumber = order.orderNumber || order.id || '—';
  const orderDate = order.orderDate || order.createdTime?.slice(0, 10) || order.fields?.createdAt?.slice(0, 10) || new Date().toLocaleDateString('fr-FR');
  const amount = order.totalAmount || order.fields?.totalPrice || 0;
  const customerRef = order.customerRef || order.compteOwo || order.fields?.farmerId?.[0] || '—';

  // Calculs taxes (exemple 18%)
  const subtotal = products.reduce((sum: number, p: any) => sum + (p.price * p.quantity), 0);
  const tax = Math.round(subtotal * 0.18 * 100) / 100;
  const total = subtotal + tax;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <View style={styles.headerRow}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>SOURX LIMITED</Text>
            <Text style={styles.companyAddress}>71-75 Shelton Street Covent Garden</Text>
            <Text style={styles.companyAddress}>London WC2H 9JQ</Text>
            <Text style={styles.companyVAT}>VAT Registration No: 438434679</Text>
            <Text style={styles.companyVAT}>Registered in England No : 08828978</Text>
          </View>
          <View style={styles.logoBox}>
            <Image src={TEMP_LOGO} style={styles.logo} />
            <Text style={styles.agriConnectText}>AgriConnect</Text>
          </View>
        </View>

        {/* Customer info & Summary */}
        <View style={styles.sectionRow}>
          <View style={styles.customerInfo}>
            <Text style={styles.customerTitle}>Customer info:</Text>
            <Text style={styles.customerLabel}>Name: <Text style={styles.customerValue}>{customer.name}</Text></Text>
            <Text style={styles.customerLabel}>Company: <Text style={styles.customerValue}>{customer.company}</Text></Text>
            <Text style={styles.customerLabel}>Phone: <Text style={styles.customerValue}>{customer.phone}</Text></Text>
            <Text style={styles.customerLabel}>Email: <Text style={styles.customerValue}>{customer.email}</Text></Text>
            <Text style={styles.customerLabel}>Address: <Text style={styles.customerValue}>{customer.address}</Text></Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>Summary :</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Order number:</Text>
              <Text style={styles.summaryValue}>{orderNumber}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Date:</Text>
              <Text style={styles.summaryValue}>{orderDate}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Amount:</Text>
              <Text style={styles.summaryValue}>{amount.toLocaleString('fr-FR')} FCFA</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Customer Ref.:</Text>
              <Text style={styles.summaryValue}>{customerRef}</Text>
            </View>
          </View>
        </View>

        {/* Tableau produits */}
        <Text style={styles.tableCategory}>{products[0]?.category?.toUpperCase() || 'PRODUITS'}</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Product</Text>
          <Text style={styles.tableHeaderCell}>Qty</Text>
          <Text style={styles.tableHeaderCell}>Price</Text>
          <Text style={styles.tableHeaderCell}>Total</Text>
          <Text style={styles.tableHeaderCell}>Tax</Text>
          <Text style={styles.tableHeaderCell}>Total(inc. tax)</Text>
        </View>
        {products.map((product: any, idx: number) => (
          <View style={styles.tableRow} key={product.productId || product.id}>
            <View style={[styles.productInfo, { flex: 2, flexDirection: 'row', alignItems: 'center' }]}> 
              <Image src={TEMP_PRODUCT_IMG} style={styles.productImg} />
              <View style={{ flexDirection: 'column' }}>
                <Text style={styles.productName}>{product.lib || product.name || product.fields?.Name}</Text>
                <Text style={styles.productRef}>Ref: {product.productId || product.id}</Text>
              </View>
            </View>
            <Text style={styles.tableCell}>{product.quantity}</Text>
            <Text style={styles.tableCell}>{(product.price || product.fields?.price || 0).toLocaleString('fr-FR')}</Text>
            <Text style={styles.tableCell}>{((product.price || product.fields?.price || 0) * product.quantity).toLocaleString('fr-FR')}</Text>
            <Text style={styles.tableCell}>{(Math.round((product.price || product.fields?.price || 0) * product.quantity * 0.18 * 100) / 100).toLocaleString('fr-FR')}</Text>
            <Text style={styles.tableCell}>{(Math.round((product.price || product.fields?.price || 0) * product.quantity * 1.18 * 100) / 100).toLocaleString('fr-FR')}</Text>
          </View>
        ))}

        {/* Totaux */}
        <View style={styles.totalsBox}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal:</Text>
            <Text style={styles.totalsValue}>{subtotal.toLocaleString('fr-FR')} FCFA</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Tax:</Text>
            <Text style={styles.totalsValue}>{tax.toLocaleString('fr-FR')} FCFA</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={[styles.totalsLabel, { fontWeight: 'bold' }]}>Total:</Text>
            <Text style={[styles.totalsValue, { fontWeight: 'bold' }]}>{total.toLocaleString('fr-FR')} FCFA</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default FacturePDF;