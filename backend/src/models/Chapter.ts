import mongoose, { Document, Schema } from 'mongoose';
import { IPart } from './Part';

export interface IChapter extends Document {
  novelId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  coverImage?: string;
  type: 'main' | 'side';
  order: number;
  hasParts: boolean;
  parts?: IPart[];
}

const ChapterSchema = new Schema({
  novelId: {
    type: Schema.Types.ObjectId,
    ref: 'Novel',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  coverImage: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['main', 'side'],
    default: 'main'
  },
  order: {
    type: Number,
    required: true
  },
  hasParts: {
    type: Boolean,
    default: true
  }
});

export default mongoose.model<IChapter>('Chapter', ChapterSchema); 