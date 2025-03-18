export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      User: {
        Row: {
          id: string
          name: string | null
          email: string
          password: string
          role: 'USER' | 'ADMIN'
          emailVerified: string | null
          image: string | null
          createdAt: string
          updatedAt: string
          lastLogin: string | null
          isActive: boolean
          resetToken: string | null
          resetTokenExpiry: string | null
          twoFactorSecret: string | null
          twoFactorEnabled: boolean
          lastLoginAt: string | null
        }
        Insert: {
          id?: string
          name?: string | null
          email: string
          password: string
          role?: 'USER' | 'ADMIN'
          emailVerified?: string | null
          image?: string | null
          createdAt?: string
          updatedAt?: string
          lastLogin?: string | null
          isActive?: boolean
          resetToken?: string | null
          resetTokenExpiry?: string | null
          twoFactorSecret?: string | null
          twoFactorEnabled?: boolean
          lastLoginAt?: string | null
        }
        Update: {
          id?: string
          name?: string | null
          email?: string
          password?: string
          role?: 'USER' | 'ADMIN'
          emailVerified?: string | null
          image?: string | null
          createdAt?: string
          updatedAt?: string
          lastLogin?: string | null
          isActive?: boolean
          resetToken?: string | null
          resetTokenExpiry?: string | null
          twoFactorSecret?: string | null
          twoFactorEnabled?: boolean
          lastLoginAt?: string | null
        }
      }
      Novel: {
        Row: {
          id: string
          title: string
          description: string
          coverImage: string | null
          createdAt: string
          updatedAt: string
          authorId: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          coverImage?: string | null
          createdAt?: string
          updatedAt?: string
          authorId: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          coverImage?: string | null
          createdAt?: string
          updatedAt?: string
          authorId?: string
        }
      }
      Chapter: {
        Row: {
          id: string
          title: string
          content: string
          novelId: string
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          novelId: string
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          novelId?: string
          createdAt?: string
          updatedAt?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      execute_sql: {
        Args: {
          query: string
          params: unknown[]
        }
        Returns: unknown
      }
    }
    Enums: {
      Role: 'USER' | 'ADMIN'
    }
  }
} 