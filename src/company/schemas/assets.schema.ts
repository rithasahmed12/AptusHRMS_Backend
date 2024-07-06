import mongoose, { Schema } from 'mongoose';

export const AssetSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    assetId:{
       type:String,
       required:true
    },
    status: {
      type: String,
      enum: ['In Use', 'Available', 'Maintenance'],
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref:'User'
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Asset = mongoose.model('Asset', AssetSchema);
export default Asset;
