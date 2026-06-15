import { http } from '@/http/http'

// Products
export function getProducts(params?: Record<string, any>) {
  return http.get<any>('/sgs/api/products', params)
}
export function getProductsPage(query?: Record<string, any>) {
  return http.get<any>('/sgs/api/products/page', query)
}
export function getPublicProducts(params?: Record<string, any>) {
  return http.get<any>('/sgs/api/public/products', params)
}
export function getProductById(id: number) {
  return http.get<any>(`/sgs/api/products/${id}`)
}
export function addProduct(data: Record<string, any>) {
  return http.post<void>('/sgs/api/products', data)
}
export function updateProduct(data: Record<string, any>) {
  return http.put<void>('/sgs/api/products', data)
}
export function deleteProducts(ids: number[] | string) {
  const idStr = Array.isArray(ids) ? ids.join(',') : ids
  return http.delete<void>(`/sgs/api/products/${idStr}`)
}

// Customer policies (staff create)
export function createCustomerPolicy(data: Record<string, any>) {
  return http.post<void>('/sgs/api/policies', data)
}
export function getPoliciesByPhone(phone: string) {
  return http.get<any>('/sgs/api/policies/by-phone', { phone })
}
export function getStaffPolicies(staffId?: number) {
  const params: any = {}
  if (staffId) params.staffId = staffId
  return http.get<any>('/sgs/api/staff/policies', params)
}
export function getStaffPoliciesByPhone(phone: string, staffId?: number) {
  const params: any = { phone }
  if (staffId) params.staffId = staffId
  return http.get<any>('/sgs/api/staff/policies/by-phone', params)
}

// Claims
export function claimPolicy(data: Record<string, any>) {
  return http.post<void>('/sgs/api/claims', data)
}
export function getMyClaims(staffId?: number) {
  const params: any = {}
  if (staffId) params.staffId = staffId
  return http.get<any>('/sgs/api/staff/claims', params)
}
