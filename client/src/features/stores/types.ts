export interface StoreItem {
  id: number
  name: string
  price: number
  description?: string
}

export interface CreateStoreItemDto {
  name: string
  price: number
  description?: string
}
