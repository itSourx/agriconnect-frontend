import { toast } from 'react-hot-toast'
import { emitNotification, NotificationEvents } from '@/@core/layouts/components/shared-components/NotificationDropdown'

export const useNotifications = () => {
  const notifySuccess = (message: string, notificationTitle?: string) => {
    toast.success(message)
    if (notificationTitle) {
      emitNotification(NotificationEvents.LOGIN_SUCCESS, notificationTitle)
    }
  }

  const notifyError = (message: string) => {
    toast.error(message)
  }

  const notifyProductCreated = (name: string) => {
    toast.success(`Le produit "${name}" a été créé avec succès`)
    emitNotification(NotificationEvents.PRODUCT_CREATED, name)
  }

  const notifyProductUpdated = (name: string) => {
    toast.success(`Le produit "${name}" a été modifié avec succès`)
    emitNotification(NotificationEvents.PRODUCT_UPDATED, name)
  }

  const notifyProductDeleted = (name: string) => {
    toast.success(`Le produit "${name}" a été supprimé avec succès`)
    emitNotification(NotificationEvents.PRODUCT_DELETED, name)
  }

  const notifyOrderCreated = (id: string) => {
    toast.success(`La commande #${id} a été créée avec succès`)
    emitNotification(NotificationEvents.ORDER_CREATED, id)
  }

  const notifyOrderUpdated = (id: string) => {
    toast.success(`La commande #${id} a été modifiée avec succès`)
    emitNotification(NotificationEvents.ORDER_UPDATED, id)
  }

  const notifyOrderDeleted = (id: string) => {
    toast.success(`La commande #${id} a été supprimée avec succès`)
    emitNotification(NotificationEvents.ORDER_DELETED, id)
  }

  return {
    notifySuccess,
    notifyError,
    notifyProductCreated,
    notifyProductUpdated,
    notifyProductDeleted,
    notifyOrderCreated,
    notifyOrderUpdated,
    notifyOrderDeleted
  }
} 