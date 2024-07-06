import mongoose, { Schema } from 'mongoose';

export const LeaveSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    numberOfDays: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Leave = mongoose.model('Leave', LeaveSchema);
export default Leave;
