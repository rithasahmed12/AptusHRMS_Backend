// schemas/work-shift.schema.ts
import mongoose, { Schema } from 'mongoose';

export const WorkShiftSchema = new Schema(
  {
    shiftName: {
      type: String,
      required: true,
    },
    workingDays: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    }],
    shiftIn: {
      type: String,
      required: true,
    },
    shiftOut: {
      type: String,
      required: true,
    },
    lateThreshold: {
      type: Number,
      default: 0,
    },
    halfdayThreshold: {
      type: Number,
      default: 0,
    },
    shiftOutNextDay: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const WorkShift = mongoose.model('WorkShift', WorkShiftSchema);
export default WorkShift;