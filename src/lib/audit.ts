import { db } from './db';

export type AuditAction = 
  | 'CREATE'
  | 'UPDATE' 
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'BULK_DELETE'
  | 'BULK_UPDATE'
  | 'EXPORT'
  | 'IMPORT';

export type AuditEntity = 
  | 'User'
  | 'Product'
  | 'Category'
  | 'Order'
  | 'CallbackRequest'
  | 'ContactForm'
  | 'SiteSetting';

interface AuditLogData {
  userId: number;
  action: AuditAction;
  tableName: AuditEntity;
  recordId?: number;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export async function logAuditEvent(data: AuditLogData) {
  try {
    await db.adminLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        tableName: data.tableName,
        recordId: data.recordId,
        oldValues: data.oldValues ? JSON.parse(JSON.stringify(data.oldValues)) : null,
        newValues: data.newValues ? JSON.parse(JSON.stringify(data.newValues)) : null,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
    // Don't throw error to avoid breaking the main operation
  }
}

export async function getAuditLogs(filters?: {
  userId?: number;
  action?: AuditAction;
  tableName?: AuditEntity;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  const where: Record<string, unknown> = {};
  
  if (filters?.userId) where.userId = filters.userId;
  if (filters?.action) where.action = filters.action;
  if (filters?.tableName) where.tableName = filters.tableName;
  if (filters?.startDate || filters?.endDate) {
    (where as Record<string, unknown>).createdAt = {};
    if (filters.startDate) ((where as Record<string, unknown>).createdAt as Record<string, unknown>).gte = filters.startDate;
    if (filters.endDate) ((where as Record<string, unknown>).createdAt as Record<string, unknown>).lte = filters.endDate;
  }

  return await db.adminLog.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: filters?.limit || 100,
    skip: filters?.offset || 0,
  });
}
