// holiday.schema.ts
import mongoose, { Schema } from 'mongoose';

export const HolidaySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Holiday = mongoose.model('Holiday', HolidaySchema);
export default Holiday;