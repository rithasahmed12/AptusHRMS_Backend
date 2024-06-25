import { Schema } from 'mongoose';

export const DesignationSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

import mongoose from 'mongoose';
const Designation = mongoose.model('Designation', DesignationSchema);
export default Designation;
