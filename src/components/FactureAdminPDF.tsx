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
  // Nouveaux champs pour les photos
  productPhotos?: string[];
  farmerPhoto?: string;
  buyerPhoto?: string;
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
  adminBadge: {
    backgroundColor: '#ff5722',
    color: '#fff',
    padding: '4px 8px',
    borderRadius: 4,
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  farmerInfo: {
    backgroundColor: '#e8f5e8',
    padding: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  farmerTitle: {
    color: '#2e7d32',
    fontWeight: 'bold',
    fontSize: 11,
    marginBottom: 4,
  },
});

const TEMP_PRODUCT_IMG = 'https://cdn-icons-png.flaticon.com/512/135/135620.png';

// Fonction utilitaire pour nettoyer les montants
const cleanNumber = (val: any) => Number(String(val).replace(/[^0-9.,-]/g, '').replace(',', '.')) || 0;

// Fonction pour formater les nombres avec des espaces normaux (pas d'Unicode)
const formatNumber = (num: number): string => {
  return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

const FactureAdminPDF: React.FC<{ order: Order }> = ({ order }) => {
  let products: Product[] = [];
  // 1. Utiliser farmerPayments si dispo
  if (order.fields?.farmerPayments) {
    try {
      const farmerPayments = JSON.parse(order.fields.farmerPayments);
      products = farmerPayments.flatMap((farmer: any) =>
        (farmer.products || []).map((p: any, idx: number) => ({
          productId: p.productId || `prod_${idx}`,
          lib: p.lib || p.name || '',
          category: p.category || 'Produit',
          mesure: p.mesure || p.unit || 'unité',
          price: Number(p.price) || 0,
          quantity: Number(p.quantity) || 0,
          total: (Number(p.price) || 0) * (Number(p.quantity) || 0),
          photo: p.photo || TEMP_PRODUCT_IMG
        }))
      );
    } catch (e) {
      products = [];
    }
  }
  // 2. Sinon, fallback sur le mapping classique
  if (!products.length && order.fields?.productName) {
    const names = order.fields.productName || [];
    const categories = order.fields.category || [];
    const mesures = order.fields.mesure || [];
    const prices = order.fields.price || [];
    const qtys = (order.fields.Qty || '').split(',').map((q: string) => q.trim());
    const photos = order.fields.Photo || [];
    products = names.map((name: string, index: number) => {
      const price = Number(prices[index]);
      const quantity = Number(qtys[index]);
      return {
        productId: `prod_${index}`,
        lib: name,
        category: categories[index] || 'Produit',
        mesure: mesures[index] || 'unité',
        price: isNaN(price) ? 0 : price,
        quantity: isNaN(quantity) ? 0 : quantity,
        total: (isNaN(price) ? 0 : price) * (isNaN(quantity) ? 0 : quantity),
        photo: photos[index]?.[0]?.url || TEMP_PRODUCT_IMG
      };
    });
  }
  // 3. Toujours fallback à 0 dans le rendu

  // Groupement par catégorie
  const groupedProducts: Record<string, Product[]> = {};
  products.forEach((p: Product) => {
    const cat = p.category?.toUpperCase() || 'AUTRES';
    if (!groupedProducts[cat]) groupedProducts[cat] = [];
    groupedProducts[cat].push(p);
  });

  const customer = {
    name: order.customerName || order.name || ((order.fields?.buyerFirstName?.[0] || '') + ' ' + (order.fields?.buyerLastName?.[0] || '')) || '',
    company: order.customerCompany || 'SOURX',
    phone: order.customerPhone || order.fields?.buyerPhone?.[0] || '',
    email: order.customerEmail || order.email || order.fields?.buyerEmail?.[0] || '',
    address: order.customerAddress || order.fields?.buyerAddress?.[0] || '',
  };

  const farmer = {
    name: ((order.fields?.farmerFirstName?.[0] || '') + ' ' + (order.fields?.farmerLastName?.[0] || '')) || '',
    email: order.fields?.farmerEmail?.[0] || '',
    id: order.fields?.farmerId?.[0] || '',
    photo: order.farmerPhoto || TEMP_PRODUCT_IMG
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
            <Image src={themeConfig.logo.src} style={styles.logo} />
          </View>
        </View>

        {/* Customer info & Summary */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
          <View style={{ flex: 1, marginRight: 24 }}>
            <Text style={{ color: '#F9A825', fontWeight: 'bold', fontSize: 15, marginBottom: 8 }}>Customer info:</Text>
            <Text style={{ fontSize: 11, marginBottom: 2 }}><Text style={{ fontWeight: 'bold' }}>Name:</Text> {customer.name}</Text>
            <Text style={{ fontSize: 11, marginBottom: 2 }}><Text style={{ fontWeight: 'bold' }}>Company:</Text> {customer.company}</Text>
            <Text style={{ fontSize: 11, marginBottom: 2 }}><Text style={{ fontWeight: 'bold' }}>Phone:</Text> {customer.phone}</Text>
            <Text style={{ fontSize: 11, marginBottom: 2 }}><Text style={{ fontWeight: 'bold' }}>Email:</Text> {customer.email}</Text>
            <Text style={{ fontSize: 11, marginBottom: 2 }}><Text style={{ fontWeight: 'bold' }}>Address:</Text> {customer.address}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: '#f7f7f7', borderRadius: 6, padding: 12, minWidth: 180 }}>
            <Text style={{ color: '#F9A825', fontWeight: 'bold', fontSize: 15, marginBottom: 8, textAlign: 'right' }}>Summary :</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 11 }}>Order number:</Text>
              <Text style={{ fontSize: 11 }}>{orderNumber}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 11 }}>Date:</Text>
              <Text style={{ fontSize: 11 }}>{orderDate}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 11 }}>Amount:</Text>
              <Text style={{ fontSize: 11 }}>{formatNumber(total)} FCFA</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 11 }}>Customer Ref.:</Text>
              <Text style={{ fontSize: 11 }}>{customerRef}</Text>
            </View>
          </View>
        </View>

        {/* Tableau produits */}
        <View style={{ marginTop: 8, marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', backgroundColor: '#388E3C', minHeight: 24, alignItems: 'center' }}>
            <Text style={{ flex: 2, color: '#fff', fontWeight: 'bold', fontSize: 11, textAlign: 'center', padding: 4 }}>Product</Text>
            <Text style={{ flex: 1, color: '#fff', fontWeight: 'bold', fontSize: 11, textAlign: 'center', padding: 4 }}>Qty</Text>
            <Text style={{ flex: 1, color: '#fff', fontWeight: 'bold', fontSize: 11, textAlign: 'center', padding: 4 }}>Price</Text>
            <Text style={{ flex: 1, color: '#fff', fontWeight: 'bold', fontSize: 11, textAlign: 'center', padding: 4 }}>Total</Text>
            <Text style={{ flex: 1, color: '#fff', fontWeight: 'bold', fontSize: 11, textAlign: 'center', padding: 4 }}>Tax</Text>
            <Text style={{ flex: 1, color: '#fff', fontWeight: 'bold', fontSize: 11, textAlign: 'center', padding: 4 }}>Total(inc. tax)</Text>
          </View>
          {Object.entries(groupedProducts).map(([cat, prods], i) => (
            <View key={cat}>
              <Text style={{ color: '#F9A825', fontWeight: 'bold', fontSize: 13, marginTop: 10, marginBottom: 2 }}>{cat}</Text>
              {prods.map((product, idx) => (
                <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee', borderBottomStyle: 'solid', minHeight: 22 }} key={product.productId || idx}>
                  <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center', paddingLeft: 4 }}>
                    <Image src={product.photo || TEMP_PRODUCT_IMG} style={{ width: 24, height: 24, marginRight: 6 }} />
                    <View style={{ flexDirection: 'column' }}>
                      <Text style={{ fontWeight: 'bold', fontSize: 11 }}>{product.lib}</Text>
                      <Text style={{ fontSize: 8, color: '#888' }}>Ref: {product.productId}</Text>
                    </View>
                  </View>
                  <Text style={{ flex: 1, fontSize: 11, textAlign: 'center' }}>{Number(product.quantity) || 0}</Text>
                  <Text style={{ flex: 1, fontSize: 11, textAlign: 'center' }}>{Number(product.price) || 0}</Text>
                  <Text style={{ flex: 1, fontSize: 11, textAlign: 'center' }}>{Number(product.total) || 0}</Text>
                  <Text style={{ flex: 1, fontSize: 11, textAlign: 'center' }}>{formatNumber(Math.round(product.total * 0.18 * 100) / 100)}</Text>
                  <Text style={{ flex: 1, fontSize: 11, textAlign: 'center' }}>{formatNumber(Math.round(product.total * 1.18 * 100) / 100)}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* Totaux */}
        <View wrap={false} style={{ flexDirection: 'column', alignItems: 'flex-end', marginTop: 16, marginRight: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 2 }}>
            <Text style={{ fontSize: 11, color: '#222', minWidth: 100, textAlign: 'right', marginRight: 8 }}>Subtotal:</Text>
            <Text style={{ fontWeight: 'bold', fontSize: 11, color: '#222', minWidth: 100, textAlign: 'right' }}>{formatNumber(cleanNumber(subtotal))} FCFA</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 2 }}>
            <Text style={{ fontSize: 11, color: '#222', minWidth: 100, textAlign: 'right', marginRight: 8 }}>Tax:</Text>
            <Text style={{ fontWeight: 'bold', fontSize: 11, color: '#222', minWidth: 100, textAlign: 'right' }}>{formatNumber(cleanNumber(tax))} FCFA</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 2 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 12, color: '#222', minWidth: 100, textAlign: 'right', marginRight: 8 }}>Total:</Text>
            <Text style={{ fontWeight: 'bold', fontSize: 12, color: '#222', minWidth: 100, textAlign: 'right' }}>{formatNumber(cleanNumber(total))} FCFA</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default FactureAdminPDF; 