import { Schema } from 'mongoose';

export const DepartmentSchema = new Schema(
  {
    name: { type: String, required: true },

    head: { type: String, required: true },
  },
  { timestamps: true },
);
