import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { API_BASE_URL } from 'src/configs/constants'

export interface Order {
  id: string
  createdTime: string
  fields: {
    status: string
    totalPrice: number
    Qty: string
    productName: string[]
    farmerFirstName: string[]
    farmerLastName: string[]
    buyerFirstName: string[]
    buyerLastName: string[]
    mesure: string[]
    price: number[]
    orderNumber: string
    Nbr?: number
    farmerId?: string[]
    Status?: string
    farmerPayment?: 'PENDING' | 'PAID'
    payStatus?: 'PAID' | 'PENDING'
    farmerOwoAccount?: number[]
    farmerPayments?: string
    farmerEmail?: string[]
  }
}

export interface FarmerPayment {
  farmerId: string
  name: string
  email: string
  compteOwo: number
  totalAmount: number
  totalProducts: number
  orders: Order[]
}

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()

  const fetchOrders = useCallback(async () => {
    if (!session?.accessToken) {
      setError('Token d\'accès non disponible')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${API_BASE_URL}/orders`, {
        headers: { 
          accept: '*/*',
          Authorization: `bearer ${session.accessToken}`
        }
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des commandes')
      }

      const data = await response.json()
      
      // Trier par date (du plus récent au plus ancien)
      const sortedOrders = data.sort((a: Order, b: Order) =>
        new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime()
      )
      
      setOrders(sortedOrders)
    } catch (err) {
      console.error('Erreur lors de la récupération des commandes:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }, [session?.accessToken])

  // Fonction pour obtenir les paiements des agriculteurs
  const getFarmerPayments = (): FarmerPayment[] => {
    // Filtrer les commandes où payStatus est PAID et farmerPayment est PENDING
    const eligibleOrders = orders.filter(order => 
      order.fields.payStatus === 'PAID' && 
      order.fields.farmerPayment === 'PENDING'
    )

    // Grouper par agriculteur
    const farmerGroups = new Map<string, Order[]>()
    
    eligibleOrders.forEach(order => {
      const farmerId = order.fields.farmerId?.[0]
      if (farmerId) {
        if (!farmerGroups.has(farmerId)) {
          farmerGroups.set(farmerId, [])
        }
        farmerGroups.get(farmerId)!.push(order)
      }
    })

    // Convertir en tableau de paiements d'agriculteurs
    const farmerPayments: FarmerPayment[] = []
    
    farmerGroups.forEach((orders, farmerId) => {
      const firstOrder = orders[0]
      const farmerName = `${firstOrder.fields.farmerFirstName?.[0] || ''} ${firstOrder.fields.farmerLastName?.[0] || ''}`.trim()
      const totalAmount = orders.reduce((sum, order) => sum + (order.fields.totalPrice || 0), 0)
      const totalProducts = orders.length // Nombre de commandes éligibles au paiement
      
      farmerPayments.push({
        farmerId,
        name: farmerName,
        email: firstOrder.fields.farmerEmail?.[0] || '',
        compteOwo: firstOrder.fields.farmerOwoAccount?.[0] || 0,
        totalAmount,
        totalProducts,
        orders
      })
    })

    return farmerPayments
  }

  // Fonction pour calculer les statistiques des commandes
  const getOrderStats = () => {
    const stats = {
      pending: 0,
      confirmed: 0,
      delivered: 0,
      completed: 0
    }

    orders.forEach(order => {
      const orderStatus = order.fields.status as keyof typeof stats
      if (orderStatus in stats) {
        stats[orderStatus]++
      }
    })

    return stats
  }

  useEffect(() => {
    if (session?.accessToken) {
      fetchOrders()
    }
  }, [fetchOrders])

  return {
    orders,
    loading,
    error,
    fetchOrders,
    getFarmerPayments,
    getOrderStats
  }
} 