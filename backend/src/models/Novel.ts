import mongoose, { Document, Schema } from 'mongoose';

export interface INovel extends Document {
  title: string;
  description: string;
  coverImage: string;
  chapters: mongoose.Types.ObjectId[];
  sideStories: mongoose.Types.ObjectId[];
}

const NovelSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  coverImage: { type: String, required: false, default: '' },
  chapters: [{ type: Schema.Types.ObjectId, ref: 'Chapter' }],
  sideStories: [{ type: Schema.Types.ObjectId, ref: 'Chapter' }]
}, {
  timestamps: true
});

export default mongoose.model<INovel>('Novel', NovelSchema); 