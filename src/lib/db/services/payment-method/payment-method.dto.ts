/**
 * Payment Method Service DTOs
 * Type definitions for payment method service operations
 */

export interface CreatePaymentMethodData {
  nameEn: string;
  nameAr?: string;
  isActive?: boolean;
}

export interface UpdatePaymentMethodData {
  nameEn?: string;
  nameAr?: string;
  isActive?: boolean;
}

export type ListPaymentMethodsSortableField =
  | "nameEn"
  | "nameAr"
  | "isActive"
  | "createdAt";

export interface ListPaymentMethodsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortOrder?: "asc" | "desc";
  sortBy?: ListPaymentMethodsSortableField;
}

export interface PaymentMethodInterface {
  id: number;
  nameEn: string;
  nameAr: string | null;
  isActive: boolean;
  createdAt: Date | any;
  updatedAt: Date | any;
}

export interface ListedPaymentMethod extends PaymentMethodInterface {}

export interface ListPaymentMethodsResponse {
  paymentMethods: ListedPaymentMethod[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
