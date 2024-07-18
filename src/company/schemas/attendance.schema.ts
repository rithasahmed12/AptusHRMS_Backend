// schemas/attendance.schema.ts
import mongoose, { Schema } from 'mongoose';

export const AttendanceSchema = new Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: { type: Date, required: true },
    checkIn: { type: Date },
    checkOut: { type: Date },
    workShift: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkShift',
      required: false,
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late'],
      default: 'Absent',
    },
    hoursWorked: { type: Number, default: 0 },
    lateArrivalMinutes: { type: Number, default: 0 },
    earlyDepartureMinutes: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const Attendance = mongoose.model('Attendance', AttendanceSchema);
export default Attendance;