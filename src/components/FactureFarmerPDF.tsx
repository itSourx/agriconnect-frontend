import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';
import themeConfig from 'src/configs/themeConfig'

interface Product {
  productId: string;
  lib: string;
  category: string;
  mesure: string;
  price: number;
  quantity: number;
  total: number;
  photo?: string;
}

interface FarmerData {
  farmerId: string;
  name: string;
  email: string;
  compteOwo: string;
  totalAmount: number;
  totalProducts: number;
  products: Product[];
}

interface Order {
  id?: string;
  createdTime?: string;
  fields?: any;
  farmerData?: FarmerData;
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    padding: 30,
    backgroundColor: '#fff',
    minHeight: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: themeConfig.logo.width,
    height: themeConfig.logo.height,
    objectFit: 'contain',
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
    marginBottom: 20, // Réduit de 25 à 20
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
  // Section table avec break automatique
  tableSection: {
    marginTop: 15, // Réduit de 20 à 15
    marginBottom: 15, // Réduit de 20 à 15
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#388E3C',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 11,
    alignItems: 'center',
    minHeight: 24,
  },
  tableHeaderCell: {
    flex: 1,
    padding: 4,
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 10,
    textAlign: 'center',
  },
  // Catégorie avec break si nécessaire
  categorySection: {
    marginTop: 10,
    marginBottom: 5,
  },
  tableCategory: {
    color: '#F9A825',
    fontWeight: 'bold',
    fontSize: 11,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderBottomStyle: 'solid',
    minHeight: 25,
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
  farmerTitle: {
    color: '#2e7d32',
    fontWeight: 'bold',
    fontSize: 11,
    marginBottom: 4,
  },
  // Section totaux avec wrap=false pour éviter les coupures
  totalsSection: {
    marginTop: 20, // Réduit de 30 à 20
    marginBottom: 30, // Réduit de 50 à 30
    paddingTop: 15, // Réduit de 20 à 15
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    borderTopStyle: 'solid',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 6, // Réduit de 8 à 6
  },
  totalLabel: {
    fontSize: 11,
    color: '#222',
    minWidth: 120,
    textAlign: 'right',
    marginRight: 12,
  },
  totalValue: {
    fontWeight: 'bold',
    fontSize: 11,
    color: '#222',
    minWidth: 120,
    textAlign: 'right',
  },
  finalTotalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#222',
    minWidth: 120,
    textAlign: 'right',
    marginRight: 12,
  },
  finalTotalValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#222',
    minWidth: 120,
    textAlign: 'right',
  },
});

const TEMP_PRODUCT_IMG = 'https://cdn-icons-png.flaticon.com/512/135/135620.png';

// Fonction utilitaire pour nettoyer les montants
const cleanNumber = (val: any) => Number(String(val).replace(/[^0-9.,-]/g, '').replace(',', '.')) || 0;

// Fonction pour formater les nombres avec des espaces normaux (pas d'Unicode)
const formatNumber = (num: number): string => {
  return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

const FactureFarmerPDF: React.FC<{ order: Order; farmerData: FarmerData }> = ({ order, farmerData }) => {
  const products = farmerData.products || [];

  const customer = {
    name: ((order.fields?.buyerFirstName?.[0] || '') + ' ' + (order.fields?.buyerLastName?.[0] || '')) || '',
    company: order.fields?.buyerCompany?.[0] || 'SOURX',
    phone: order.fields?.buyerPhone?.[0] || '',
    email: order.fields?.buyerEmail?.[0] || '',
    address: order.fields?.buyerAddress?.[0] || '',
  };

  const orderNumber = order.fields?.orderNumber || order.id || '—';
  const orderDate = order.createdTime?.slice(0, 10) || order.fields?.createdAt?.slice(0, 10) || new Date().toLocaleDateString('fr-FR');
  const customerRef = order.fields?.customerRef?.[0] || '—';

  // Calculs taxes (exemple 18%)
  const subtotal = products.reduce((sum: number, p: any) => sum + (p.total || 0), 0);
  const tax = Math.round(subtotal * 0.18 * 100) / 100;
  const total = subtotal + tax;
  const taxRate = 0.18;

  // Groupement par catégorie
  const groupedProducts: Record<string, Product[]> = {};
  products.forEach((p: Product) => {
    const cat = p.category?.toUpperCase() || 'AUTRES';
    if (!groupedProducts[cat]) groupedProducts[cat] = [];
    groupedProducts[cat].push(p);
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <View style={styles.headerRow} fixed>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>SOURX LIMITED</Text>
            <Text style={styles.companyAddress}>71-75 Shelton Street Covent Garden</Text>
            <Text style={styles.companyAddress}>London WC2H 9JQ</Text>
            <Text style={styles.companyVAT}>VAT Registration No: 438434679</Text>
            <Text style={styles.companyVAT}>Registered in England No : 08828978</Text>
          </View>
          <View style={styles.logoBox}>
            <Image src={themeConfig.logo.src} style={styles.logo} />
          </View>
        </View>

        {/* Customer info & Summary */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 }}>
          <View style={{ flex: 1, marginRight: 30 }}>
            <Text style={{ color: '#F9A825', fontWeight: 'bold', fontSize: 14, marginBottom: 8 }}>Customer info:</Text>
            <Text style={{ fontSize: 11, marginBottom: 3, color: '#333' }}>Name: {customer.name}</Text>
            <Text style={{ fontSize: 11, marginBottom: 3, color: '#333' }}>Company: {customer.company}</Text>
            <Text style={{ fontSize: 11, marginBottom: 3, color: '#333' }}>Phone: {customer.phone}</Text>
            <Text style={{ fontSize: 11, marginBottom: 3, color: '#333' }}>Email: {customer.email}</Text>
            <Text style={{ fontSize: 11, marginBottom: 3, color: '#333' }}>Address: {customer.address}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: '#f7f7f7', borderRadius: 6, padding: 15, minWidth: 200 }}>
            <Text style={{ color: '#F9A825', fontWeight: 'bold', fontSize: 14, marginBottom: 8, textAlign: 'right' }}>Summary :</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 11, color: '#333' }}>Order number:</Text>
              <Text style={{ fontSize: 11, color: '#333' }}>{orderNumber}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 11, color: '#333' }}>Date:</Text>
              <Text style={{ fontSize: 11, color: '#333' }}>{orderDate}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 11, color: '#333' }}>Amount:</Text>
              <Text style={{ fontSize: 11, color: '#333' }}>{formatNumber(total)} FCFA</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 11, color: '#333' }}>Customer Ref.:</Text>
              <Text style={{ fontSize: 11, color: '#333' }}>{customerRef}</Text>
            </View>
          </View>
        </View>

        {/* Tableau produits avec gestion des breaks */}
        <View style={styles.tableSection}>
          {/* En-tête du tableau */}
          <View style={styles.tableHeader}>
            <Text style={{ flex: 2, color: '#fff', fontWeight: 'bold', fontSize: 11, textAlign: 'center', padding: 6 }}>Product</Text>
            <Text style={{ flex: 1, color: '#fff', fontWeight: 'bold', fontSize: 11, textAlign: 'center', padding: 6 }}>Qty</Text>
            <Text style={{ flex: 1, color: '#fff', fontWeight: 'bold', fontSize: 11, textAlign: 'center', padding: 6 }}>Price</Text>
            <Text style={{ flex: 1, color: '#fff', fontWeight: 'bold', fontSize: 11, textAlign: 'center', padding: 6 }}>Total</Text>
            <Text style={{ flex: 1, color: '#fff', fontWeight: 'bold', fontSize: 11, textAlign: 'center', padding: 6 }}>Tax</Text>
            <Text style={{ flex: 1, color: '#fff', fontWeight: 'bold', fontSize: 11, textAlign: 'center', padding: 6 }}>Total(inc. tax)</Text>
          </View>

          {/* Produits par catégorie */}
          {Object.entries(groupedProducts).map(([cat, prods], categoryIndex) => (
            <View key={cat} style={styles.categorySection} wrap={false}>
              <Text style={styles.tableCategory}>{cat}</Text>
              {prods.map((product, idx) => {
                const productTax = Math.round(product.total * taxRate * 100) / 100;
                const productTotalWithTax = product.total + productTax;
                return (
                  <View 
                    style={styles.tableRow} 
                    key={product.productId || idx}
                    wrap={false}
                  >
                    <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center', paddingLeft: 6 }}>
                      <Image 
                        src={product.photo || TEMP_PRODUCT_IMG} 
                        style={{ width: 24, height: 24, marginRight: 8 }} 
                      />
                      <View style={{ flexDirection: 'column' }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 11 }}>{product.lib}</Text>
                        <Text style={{ fontSize: 8, color: '#888' }}>Ref: {product.productId}</Text>
                      </View>
                    </View>
                    <Text style={{ flex: 1, fontSize: 11, textAlign: 'center', padding: 4 }}>
                      {Number(product.quantity) || 0}
                    </Text>
                    <Text style={{ flex: 1, fontSize: 11, textAlign: 'center', padding: 4 }}>
                      {Number(product.price) || 0}
                    </Text>
                    <Text style={{ flex: 1, fontSize: 11, textAlign: 'center', padding: 4 }}>
                      {Number(product.total) || 0}
                    </Text>
                    <Text style={{ flex: 1, fontSize: 11, textAlign: 'center', padding: 4 }}>
                      {formatNumber(productTax)}
                    </Text>
                    <Text style={{ flex: 1, fontSize: 11, textAlign: 'center', padding: 4 }}>
                      {formatNumber(productTotalWithTax)}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>

        {/* Totaux - Empêche la coupure de cette section */}
        <View wrap={false} style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{formatNumber(cleanNumber(subtotal))} FCFA</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax:</Text>
            <Text style={styles.totalValue}>{formatNumber(cleanNumber(tax))} FCFA</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.finalTotalLabel}>Total:</Text>
            <Text style={styles.finalTotalValue}>{formatNumber(cleanNumber(total))} FCFA</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default FactureFarmerPDF;