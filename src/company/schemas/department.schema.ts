import mongoose, { Schema } from 'mongoose';

// Department Schema
export const DepartmentSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    head: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Department = mongoose.model('Department', DepartmentSchema);
export default Department;