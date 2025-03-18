import mongoose, { Document, Schema } from 'mongoose';

export interface IPart extends Document {
  chapterId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  order: number;
}

const PartSchema = new Schema({
  chapterId: { type: Schema.Types.ObjectId, ref: 'Chapter', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  order: { type: Number, required: true }
}, {
  timestamps: true
});

export default mongoose.model<IPart>('Part', PartSchema); 