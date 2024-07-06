import mongoose, { Schema } from 'mongoose';

export const AssetRequestSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assetId: {
      type: Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
    },
    requestDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    reason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const AssetRequest = mongoose.model('AssetRequest', AssetRequestSchema);
export default AssetRequest;