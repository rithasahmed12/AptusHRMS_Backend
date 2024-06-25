import { Schema } from 'mongoose';

export const UserSchema = new Schema(
  {
    name: {
      type: String,
    },
    gender: {
      type: String,
    },
    dob: {
      type: Date,
    },
    streetAddress: {
      type: String,
    },
    city: {
      type: String,
    },
    country: {
      type: String,
    },
    postalCode: {
      type: String,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    hireDate: {
      type: Date,
    },
    joiningDate: {
      type: Date,
    },
    basicSalary: {
      type: Number,
    },
    employeeType: {
      type: String,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
    },
    designationId: {
      type: Schema.Types.ObjectId,
      ref: 'Designation',
    },
    employeeId: {
      type: String,
    },
    status: {
      type: String,
    },
    role: {
      type: String,
      required: true,
    },
    shift: {
      type: String,
    },
    profilePic: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

import mongoose from 'mongoose';
const User = mongoose.model('User', UserSchema);
export default User;
