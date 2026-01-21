/**
 * User Service DTOs
 * Type definitions for user service operations
 */

export interface BranchInterface {
  id: number;
  nameEn: string;
  nameAr: string;
  isActive: boolean;
  createdAt: Date | any;
  updatedAt: Date | any;
}
