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

interface FarmerOrder {
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
  buyerBadge: {
    backgroundColor: '#4caf50',
    color: '#fff',
    padding: '4px 8px',
    borderRadius: 4,
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
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
  farmerSection: {
    marginBottom: 20,
  },
  farmerHeader: {
    backgroundColor: '#e8f5e8',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  farmerName: {
    color: '#2e7d32',
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 2,
  },
  farmerEmail: {
    fontSize: 9,
    color: '#666',
  },
});

const TEMP_PRODUCT_IMG = 'https://cdn-icons-png.flaticon.com/512/135/135620.png';

const FactureBuyerPDF: React.FC<{ order: Order }> = ({ order }) => {
  console.log('order for buyer facture:', order);
  
  // Gestion des données selon la structure reçue
  let farmers: FarmerOrder[] = [];
  
  if (Array.isArray(order)) {
    // Si order est directement un tableau d'agriculteurs
    farmers = order;
  } else if (order.products && order.farmerId) {
    // Si c'est un seul agriculteur
    farmers = [{
      farmerId: order.farmerId,
      name: order.name || '',
      email: order.email || '',
      compteOwo: order.compteOwo || '',
      totalAmount: order.totalAmount || 0,
      totalProducts: order.totalProducts || 0,
      products: order.products
    }];
  } else if (order.fields) {
    // Structure legacy
    const names = order.fields.productName || [];
    const categories = order.fields.category || [];
    const mesures = order.fields.mesure || [];
    const prices = order.fields.price || [];
    const qtys = (order.fields.Qty || '').split(',').map((q: string) => q.trim());
    const photos = order.fields.Photo || [];
    
    const products = names.map((name: string, index: number) => {
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

    farmers = [{
      farmerId: order.fields?.farmerId?.[0] || '',
      name: ((order.fields?.farmerFirstName?.[0] || '') + ' ' + (order.fields?.farmerLastName?.[0] || '')) || '',
      email: order.fields?.farmerEmail?.[0] || '',
      compteOwo: '',
      totalAmount: order.fields?.totalPrice || 0,
      totalProducts: products.length,
      products: products
    }];
  }

  const customer = {
    name: order.customerName || 'Client AgriConnect',
    company: order.customerCompany || 'SOURX',
    phone: order.customerPhone || '',
    email: order.customerEmail || 'client@agriconnect.com',
    address: order.customerAddress || '',
  };

  const orderNumber = order.orderNumber || order.id || '—';
  const orderDate = order.orderDate || order.createdTime?.slice(0, 10) || new Date().toLocaleDateString('fr-FR');

  // Calculs totaux
  const subtotal = farmers.reduce((sum, farmer) => sum + farmer.totalAmount, 0);
  const tax = Math.round(subtotal * 0.18 * 100) / 100;
  const total = subtotal + tax;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Titre Facture */}
        <View style={styles.buyerBadge}>
          Facture Acheteur
        </View>

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
        <View style={styles.sectionRow}>
          <View style={styles.customerInfo}>
            <Text style={styles.customerTitle}>Informations de l'acheteur:</Text>
            <Text style={styles.customerLabel}>Nom: <Text style={styles.customerValue}>{customer.name}</Text></Text>
            <Text style={styles.customerLabel}>Société: <Text style={styles.customerValue}>{customer.company}</Text></Text>
            <Text style={styles.customerLabel}>Téléphone: <Text style={styles.customerValue}>{customer.phone}</Text></Text>
            <Text style={styles.customerLabel}>Email: <Text style={styles.customerValue}>{customer.email}</Text></Text>
            <Text style={styles.customerLabel}>Adresse: <Text style={styles.customerValue}>{customer.address}</Text></Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>Résumé de la commande:</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>N° Commande:</Text>
              <Text style={styles.summaryValue}>{orderNumber}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Date:</Text>
              <Text style={styles.summaryValue}>{orderDate}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Nbre Agriculteurs:</Text>
              <Text style={styles.summaryValue}>{farmers.length}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total HT:</Text>
              <Text style={styles.summaryValue}>{subtotal.toLocaleString('fr-FR')} FCFA</Text>
            </View>
          </View>
        </View>

        {/* Produits par agriculteur */}
        {farmers.map((farmer, farmerIndex) => (
          <View key={farmer.farmerId} style={styles.farmerSection}>
            <View style={styles.farmerHeader}>
              <Text style={styles.farmerName}>Agriculteur: {farmer.name}</Text>
              <Text style={styles.farmerEmail}>{farmer.email}</Text>
            </View>
            
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Produit</Text>
              <Text style={styles.tableHeaderCell}>Qté</Text>
              <Text style={styles.tableHeaderCell}>Prix</Text>
              <Text style={styles.tableHeaderCell}>Total</Text>
            </View>
            
            {farmer.products.map((product, productIndex) => (
              <View style={styles.tableRow} key={`${farmer.farmerId}-${product.productId}`}>
                <View style={[styles.productInfo, { flex: 2, flexDirection: 'row', alignItems: 'center' }]}> 
                  <Image src={TEMP_PRODUCT_IMG} style={styles.productImg} />
                  <View style={{ flexDirection: 'column' }}>
                    <Text style={styles.productName}>{product.lib}</Text>
                    <Text style={styles.productRef}>Ref: {product.productId}</Text>
                  </View>
                </View>
                <Text style={styles.tableCell}>{product.quantity} {product.mesure}</Text>
                <Text style={styles.tableCell}>{product.price.toLocaleString('fr-FR')}</Text>
                <Text style={styles.tableCell}>{product.total.toLocaleString('fr-FR')}</Text>
              </View>
            ))}
            
            <View style={styles.totalsBox}>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Total {farmer.name}:</Text>
                <Text style={styles.totalsValue}>{farmer.totalAmount.toLocaleString('fr-FR')} FCFA</Text>
              </View>
            </View>
          </View>
        ))}

        {/* Totaux généraux */}
        <View style={styles.totalsBox}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Sous-total:</Text>
            <Text style={styles.totalsValue}>{subtotal.toLocaleString('fr-FR')} FCFA</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Taxe (18%):</Text>
            <Text style={styles.totalsValue}>{tax.toLocaleString('fr-FR')} FCFA</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={[styles.totalsLabel, { fontWeight: 'bold' }]}>Total TTC:</Text>
            <Text style={[styles.totalsValue, { fontWeight: 'bold' }]}>{total.toLocaleString('fr-FR')} FCFA</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default FactureBuyerPDF; 