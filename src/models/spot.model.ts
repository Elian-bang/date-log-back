import mongoose, { Schema, Document } from 'mongoose';

export interface ISpot extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  memo?: string;
  image?: string;
  link?: string;
  visited: boolean;
  latitude?: number;
  longitude?: number;
  dateEntryId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SpotSchema = new Schema<ISpot>(
  {
    name: { type: String, required: true, maxlength: 100 },
    memo: { type: String, maxlength: 500 },
    image: { type: String },
    link: { type: String },
    visited: { type: Boolean, default: false },
    latitude: { type: Number },
    longitude: { type: Number },
    dateEntryId: {
      type: Schema.Types.ObjectId,
      ref: 'DateEntry',
      required: true
    },
  },
  {
    timestamps: true,
    collection: 'spots',
  }
);

// 인덱스
SpotSchema.index({ dateEntryId: 1 });
SpotSchema.index({ visited: 1 });

export const Spot = mongoose.model<ISpot>('Spot', SpotSchema);
