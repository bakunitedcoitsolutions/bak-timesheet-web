/**
 * Payment Method Service
 * Business logic for payment method operations
 */

import { prisma } from "@/lib/db/prisma";
import type {
  CreatePaymentMethodData,
  UpdatePaymentMethodData,
  ListPaymentMethodsParams,
  ListPaymentMethodsResponse,
} from "./payment-method.dto";

// Type helper for Prisma transaction client
type PrismaTransactionClient = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0];

// Reusable select object
const paymentMethodSelect = {
  id: true,
  nameEn: true,
  nameAr: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

/**
 * Create a new payment method
 */
export const createPaymentMethod = async (data: CreatePaymentMethodData) => {
  // Validate: nameEn must be unique
  const existingPaymentMethod = await prisma.paymentMethod.findFirst({
    where: { nameEn: data.nameEn },
    select: { id: true },
  });

  if (existingPaymentMethod) {
    throw new Error("Payment Method name already exists");
  }

  const paymentMethod = await prisma.paymentMethod.create({
    data: {
      nameEn: data.nameEn,
      nameAr: data.nameAr,
      isActive: data.isActive ?? true,
    },
    select: paymentMethodSelect,
  });

  return paymentMethod;
};

/**
 * Get payment method by ID
 */
export const findPaymentMethodById = async (id: number) => {
  return prisma.paymentMethod.findUnique({
    where: { id },
    select: paymentMethodSelect,
  });
};

/**
 * Update payment method
 */
export const updatePaymentMethod = async (
  id: number,
  data: UpdatePaymentMethodData
) => {
  // Check if payment method exists
  const existingPaymentMethod = await prisma.paymentMethod.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingPaymentMethod) {
    throw new Error("Payment Method not found");
  }

  // Validate: nameEn must be unique (if being updated)
  if (data.nameEn !== undefined) {
    const duplicatePaymentMethod = await prisma.paymentMethod.findFirst({
      where: {
        nameEn: data.nameEn,
        NOT: { id },
      },
      select: { id: true },
    });

    if (duplicatePaymentMethod) {
      throw new Error("Payment Method name already exists");
    }
  }

  const updateData: any = {};
  if (data.nameEn !== undefined) updateData.nameEn = data.nameEn;
  if (data.nameAr !== undefined) updateData.nameAr = data.nameAr;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  const updatedPaymentMethod = await prisma.paymentMethod.update({
    where: { id },
    data: updateData,
    select: paymentMethodSelect,
  });

  return updatedPaymentMethod;
};

/**
 * Delete payment method
 */
export const deletePaymentMethod = async (id: number): Promise<void> => {
  // Check if payment method exists
  const existingPaymentMethod = await prisma.paymentMethod.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingPaymentMethod) {
    throw new Error("Payment Method not found");
  }

  // Check if payment method is being used by payroll details
  const payrollDetailsCount = await prisma.payrollDetails.count({
    where: { paymentMethodId: id },
  });

  if (payrollDetailsCount > 0) {
    throw new Error(
      `Cannot delete payment method: ${payrollDetailsCount} payroll record(s) are using it`
    );
  }

  // Delete payment method
  await prisma.paymentMethod.delete({
    where: { id },
  });
};

/**
 * List payment methods with pagination and sorting
 */
export const listPaymentMethods = async (
  params: ListPaymentMethodsParams
): Promise<ListPaymentMethodsResponse> => {
  const page = params.page || 1;
  const limit = params.limit || 10;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (params.search) {
    where.OR = [
      { nameEn: { contains: params.search, mode: "insensitive" } },
      { nameAr: { contains: params.search, mode: "insensitive" } },
    ];
  }

  const sortBy = params.sortBy || "createdAt";
  const sortOrder = params.sortOrder || "desc";

  const [paymentMethods, total] = await Promise.all([
    prisma.paymentMethod.findMany({
      where,
      skip,
      take: limit,
      select: paymentMethodSelect,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.paymentMethod.count({ where }),
  ]);

  return {
    paymentMethods,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
