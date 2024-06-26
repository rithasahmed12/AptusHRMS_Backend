// Designation Schema
import mongoose, { Schema } from 'mongoose';

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

const Designation = mongoose.model('Designation', DesignationSchema);
export default Designation;