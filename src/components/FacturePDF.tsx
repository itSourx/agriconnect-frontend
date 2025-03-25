import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';
import { Order } from '@/types/order';

// Création des styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    position: 'relative'
  },
  filigrane: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(-45deg)',
    fontSize: 60,
    color: '#f0f0f0',
    opacity: 0.1,
    zIndex: 0
  },
  contenu: {
    position: 'relative',
    zIndex: 1
  },
  enTete: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    borderBottom: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 20
  },
  logo: {
    width: 150,
    height: 50,
    objectFit: 'contain'
  },
  infoEntreprise: {
    textAlign: 'right'
  },
  nomEntreprise: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5
  },
  adresseEntreprise: {
    fontSize: 10,
    color: '#7f8c8d'
  },
  infoFacture: {
    marginBottom: 30
  },
  titreFacture: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10
  },
  numeroFacture: {
    fontSize: 12,
    color: '#7f8c8d'
  },
  section: {
    marginBottom: 20
  },
  titreSection: {
    fontSize: 16,
    marginBottom: 10,
    color: '#2c3e50'
  },
  ligne: {
    flexDirection: 'row',
    marginBottom: 5
  },
  etiquette: {
    width: 120,
    fontSize: 10,
    color: '#7f8c8d'
  },
  valeur: {
    flex: 1,
    fontSize: 10,
    color: '#2c3e50'
  },
  tableau: {
    width: 'auto',
    borderStyle: 'solid',
    borderColor: '#bdc3c7',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginTop: 20
  },
  ligneTableau: {
    flexDirection: 'row'
  },
  colonneTableau: {
    width: '20%',
    borderStyle: 'solid',
    borderColor: '#bdc3c7',
    borderBottomWidth: 1,
    borderRightWidth: 1
  },
  celluleTableau: {
    margin: 5,
    fontSize: 10,
    color: '#2c3e50'
  },
  total: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  texteTotal: {
    fontSize: 12,
    color: '#2c3e50',
    fontWeight: 'bold'
  },
  piedDePage: {
    marginTop: 50,
    textAlign: 'center',
    fontSize: 8,
    color: '#7f8c8d'
  },
  imageProduit: {
    width: 100,
    height: 100,
    marginTop: 20,
    alignSelf: 'center'
  },
  infoSecurite: {
    marginTop: 10,
    fontSize: 7,
    color: '#95a5a6',
    fontStyle: 'italic'
  }
});

interface PropsFacturePDF {
  order: Order
}

const FacturePDF: React.FC<PropsFacturePDF> = ({ order }) => {
  const dateCommande = new Date(order.createdTime).toLocaleDateString('fr-FR')
  const dateGeneration = new Date().toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  const numeroFacture = `F${order.id.slice(-8)}-${new Date().getTime().toString().slice(-6)}`

  const formatMontant = (montant: number) => {
    const nombreFormate = Math.round(montant).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    return `${nombreFormate} FCFA`
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.filigrane}>AgriConnect</Text>
        <View style={styles.contenu}>
          <View style={styles.enTete}>
            <Image src="/images/logo.png" style={styles.logo} />
            <View style={styles.infoEntreprise}>
              <Text style={styles.nomEntreprise}>AgriConnect</Text>
              <Text style={styles.adresseEntreprise}>
                Rue de l'Agriculture, 12345{'\n'}
                Ville, Pays{'\n'}
                Tél: +123 456 789{'\n'}
                Email: contact@agriconnect.com
              </Text>
            </View>
          </View>

          <View style={styles.infoFacture}>
            <Text style={styles.titreFacture}>FACTURE</Text>
            <Text style={styles.numeroFacture}>
              N° {numeroFacture}{'\n'}
              Date de commande : {dateCommande}{'\n'}
              Date de génération : {dateGeneration}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.titreSection}>Informations de l'acheteur</Text>
            <View style={styles.ligne}>
              <Text style={styles.etiquette}>Nom :</Text>
              <Text style={styles.valeur}>
                {order.fields.buyerFirstName?.[0] || 'Non spécifié'} {order.fields.buyerLastName?.[0] || 'Non spécifié'}
              </Text>
            </View>
            <View style={styles.ligne}>
              <Text style={styles.etiquette}>Email :</Text>
              <Text style={styles.valeur}>{order.fields.buyerEmail?.[0] || 'Non spécifié'}</Text>
            </View>
            <View style={styles.ligne}>
              <Text style={styles.etiquette}>Téléphone :</Text>
              <Text style={styles.valeur}>{order.fields.buyerPhone?.[0] || 'Non spécifié'}</Text>
            </View>
            <View style={styles.ligne}>
              <Text style={styles.etiquette}>Adresse :</Text>
              <Text style={styles.valeur}>{order.fields.buyerAddress?.[0] || 'Non spécifiée'}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.titreSection}>Informations du vendeur</Text>
            <View style={styles.ligne}>
              <Text style={styles.etiquette}>Nom :</Text>
              <Text style={styles.valeur}>
                {order.fields.farmerFirstName?.[0] || 'Non spécifié'} {order.fields.farmerLastName?.[0] || 'Non spécifié'}
              </Text>
            </View>
            <View style={styles.ligne}>
              <Text style={styles.etiquette}>Email :</Text>
              <Text style={styles.valeur}>{order.fields.farmerEmail?.[0] || 'Non spécifié'}</Text>
            </View>
            <View style={styles.ligne}>
              <Text style={styles.etiquette}>Téléphone :</Text>
              <Text style={styles.valeur}>{order.fields.farmerPhone?.[0] || 'Non spécifié'}</Text>
            </View>
            <View style={styles.ligne}>
              <Text style={styles.etiquette}>Adresse :</Text>
              <Text style={styles.valeur}>{order.fields.farmerAddress?.[0] || 'Non spécifiée'}</Text>
            </View>
          </View>

          <View style={styles.tableau}>
            <View style={styles.ligneTableau}>
              <View style={styles.colonneTableau}>
                <Text style={styles.celluleTableau}>Produit</Text>
              </View>
              <View style={styles.colonneTableau}>
                <Text style={styles.celluleTableau}>Quantité</Text>
              </View>
              <View style={styles.colonneTableau}>
                <Text style={styles.celluleTableau}>Prix unitaire</Text>
              </View>
              <View style={styles.colonneTableau}>
                <Text style={styles.celluleTableau}>Total</Text>
              </View>
            </View>
            {order.fields.productName?.map((produit: string | undefined, index: number) => (
              <View key={index} style={styles.ligneTableau}>
                <View style={styles.colonneTableau}>
                  <Text style={styles.celluleTableau}>{produit || 'Non spécifié'}</Text>
                </View>
                <View style={styles.colonneTableau}>
                  <Text style={styles.celluleTableau}>{order.fields.Qty}</Text>
                </View>
                <View style={styles.colonneTableau}>
                  <Text style={styles.celluleTableau}>
                    {formatMontant(order.fields.totalPrice / (order.fields.productName?.length || 1))}
                  </Text>
                </View>
                <View style={styles.colonneTableau}>
                  <Text style={styles.celluleTableau}>
                    {formatMontant(order.fields.Qty * (order.fields.totalPrice / (order.fields.productName?.length || 1)))}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.total}>
            <Text style={styles.texteTotal}>
              Total : {formatMontant(order.fields.totalPrice)}
            </Text>
          </View>

          {order.fields.productImage?.[0] && (
            <Image src={order.fields.productImage[0]} style={styles.imageProduit} />
          )}

          <View style={styles.piedDePage}>
            <Text>
              AgriConnect - SIRET : 123 456 789 00000{'\n'}
              TVA : FR12345678900{'\n'}
              Cette facture est générée automatiquement et est valable sans signature
            </Text>
            <Text style={styles.infoSecurite}>
              Document sécurisé - Reproduction interdite{'\n'}
              Numéro de facture unique : {numeroFacture}{'\n'}
              Date de génération : {dateGeneration}{'\n'}
              © {new Date().getFullYear()} AgriConnect - Tous droits réservés
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}

export default FacturePDF 