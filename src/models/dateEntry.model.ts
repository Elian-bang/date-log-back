import mongoose, { Schema, Document } from 'mongoose';

export interface IDateEntry extends Document {
  _id: mongoose.Types.ObjectId;
  date: Date;
  region: string;
  createdAt: Date;
  updatedAt: Date;
}

const DateEntrySchema = new Schema<IDateEntry>(
  {
    date: { type: Date, required: true },
    region: { type: String, required: true, maxlength: 50 },
  },
  {
    timestamps: true,
    collection: 'dateEntries',
  }
);

// 복합 유니크 인덱스 (date + region)
DateEntrySchema.index({ date: 1, region: 1 }, { unique: true });

// 검색 최적화 인덱스
DateEntrySchema.index({ region: 1 });
DateEntrySchema.index({ date: 1 });

export const DateEntry = mongoose.model<IDateEntry>('DateEntry', DateEntrySchema);
