import mongoose, { Schema } from 'mongoose';

// User Schema
export const CompanySchema = new Schema(
  {
    name: {
      type: String,
    },
    industry: {
      type: String,
    },
    logo:{
      type:String
    },
    foundedDate: {
      type: Date,
    },
    description: {
      type: String,
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    website: {
      type: String,
    },
    linkedinHandle: {
      type: String,
    },
    whatsappNumber: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const Company = mongoose.model('Company', CompanySchema);
export default Company;