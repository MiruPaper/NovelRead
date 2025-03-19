// Custom mongoose type definitions
import mongoose from 'mongoose';

declare module 'mongoose' {
  export * from '@types/mongoose';
  export interface MongooseStatic {
    connect: (uri: string, options?: mongoose.ConnectOptions) => Promise<typeof mongoose>;
  }
} 