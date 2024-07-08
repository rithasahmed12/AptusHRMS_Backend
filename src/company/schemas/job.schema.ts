import mongoose, { Schema } from 'mongoose';

const DynamicFieldSchema = new Schema({
  name: String,
  type: String,
  required: Boolean,
  fileTypes: [String]
}, { _id: false });

export const JobSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  requirements: [String],
  status: { type: String, default: 'Open' },
  dynamicFields: [DynamicFieldSchema],
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Job = mongoose.model('Job', JobSchema);
export default Job;