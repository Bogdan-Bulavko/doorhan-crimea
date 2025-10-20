'use client';
import { useState } from 'react';
import { z } from 'zod';

export interface ValidationError {
  field: string;
  message: string;
}

export function useFormValidation<T>(schema: z.ZodSchema<T>) {
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const validate = (data: unknown): { success: boolean; data?: T; errors?: ValidationError[] } => {
    try {
      const result = schema.parse(data);
      setErrors([]);
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors: ValidationError[] = error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        setErrors(validationErrors);
        return { success: false, errors: validationErrors };
      }
      return { success: false, errors: [{ field: 'general', message: 'Validation error' }] };
    }
  };

  const getFieldError = (fieldName: string): string | undefined => {
    return errors.find(err => err.field === fieldName)?.message;
  };

  const clearErrors = () => setErrors([]);

  return { validate, getFieldError, clearErrors, errors };
}

export function ErrorMessage({ error }: { error?: string }) {
  if (!error) return null;
  return <div className="text-sm text-red-600 mt-1">{error}</div>;
}

export function FormField({ 
  label, children, 
  error, 
  required = false 
}: { 
  label: string; 
  children: React.ReactNode; 
  error?: string; 
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-600">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      <ErrorMessage error={error} />
    </div>
  );
}
