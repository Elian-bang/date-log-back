import mongoose, { Schema, Document } from 'mongoose';

export interface IRestaurant extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  type: string;
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

const RestaurantSchema = new Schema<IRestaurant>(
  {
    name: { type: String, required: true, maxlength: 100 },
    type: { type: String, required: true, maxlength: 20 },
    memo: { type: String, maxlength: 500 },
    image: { type: String },
    link: { type: String },
    visited: { type: Boolean, default: false },
    latitude: { type: Number },
    longitude: { type: Number },
    dateEntryId: {
      type: Schema.Types.ObjectId,
      ref: 'DateEntry',
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'restaurants',
  }
);

// 인덱스
RestaurantSchema.index({ dateEntryId: 1 });
RestaurantSchema.index({ type: 1 });
RestaurantSchema.index({ visited: 1 });

export const Restaurant = mongoose.model<IRestaurant>('Restaurant', RestaurantSchema);
