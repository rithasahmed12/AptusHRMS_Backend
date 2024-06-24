import { Schema } from 'mongoose';

export const AnnouncementsSchema = new Schema(
  {
    title: { type: String, required: true },

    details: { type: String, required: true },

    author: { type: String },
    
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);
