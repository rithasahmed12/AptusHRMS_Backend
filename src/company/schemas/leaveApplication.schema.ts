import mongoose, { Schema } from 'mongoose';

export const LeaveRequestSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    leaveTypeId: {
      type: Schema.Types.ObjectId,
      ref: 'LeaveType',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    requiresApproval: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const LeaveRequest = mongoose.model('LeaveRequest', LeaveRequestSchema);
export default LeaveRequest;