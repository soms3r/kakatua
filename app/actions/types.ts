// Common Type definitions for Kakatua Server Actions (app/actions/types.ts)

export type ActionResponse<T> = 
  | { success: true; message: string; data: T }
  | { success: false; error: string };
