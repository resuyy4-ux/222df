
import { useState, useEffect } from 'react'

interface CrudOperations<T> {
  items: T[]
  setItems: (items: T[]) => void
  create: (item: Omit<T, 'id'>) => Promise<T>
  update: (id: string, item: Partial<T>) => Promise<T>
  delete: (id: string) => Promise<void>
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useCrud<T extends { id: string }>(
  service: {
    getAll: () => Promise<T[]>
    create: (item: Omit<T, 'id'>) => Promise<T>
    update: (id: string, item: Partial<T>) => Promise<T>
    delete: (id: string) => Promise<void>
  },
  showNotification: (message: string) => void,
  entityName: string
): CrudOperations<T> {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await service.getAll()
      setItems(data)
    } catch (err) {
      const errorMessage = `Error memuat ${entityName.toLowerCase()}`
      setError(errorMessage)
      showNotification(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const create = async (item: Omit<T, 'id'>): Promise<T> => {
    setLoading(true)
    setError(null)
    try {
      const newItem = await service.create(item)
      setItems(prev => [newItem, ...prev])
      showNotification(`${entityName} berhasil ditambahkan`)
      return newItem
    } catch (err) {
      const errorMessage = `Error menambahkan ${entityName.toLowerCase()}: ${err.message || err}`
      setError(errorMessage)
      showNotification(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const update = async (id: string, item: Partial<T>): Promise<T> => {
    setLoading(true)
    setError(null)
    try {
      const updatedItem = await service.update(id, item)
      setItems(prev => prev.map(i => i.id === id ? updatedItem : i))
      showNotification(`${entityName} berhasil diupdate`)
      return updatedItem
    } catch (err) {
      const errorMessage = `Error mengupdate ${entityName.toLowerCase()}: ${err.message || err}`
      setError(errorMessage)
      showNotification(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteItem = async (id: string): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      await service.delete(id)
      setItems(prev => prev.filter(i => i.id !== id))
      showNotification(`${entityName} berhasil dihapus`)
    } catch (err) {
      const errorMessage = `Error menghapus ${entityName.toLowerCase()}: ${err.message || err}`
      setError(errorMessage)
      showNotification(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    items,
    setItems,
    create,
    update,
    delete: deleteItem,
    loading,
    error,
    refresh
  }
}
