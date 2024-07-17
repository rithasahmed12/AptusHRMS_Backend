import mongoose, { Schema } from 'mongoose';

export interface PayrollInterface extends mongoose.Document {
    employeeId: mongoose.Schema.Types.ObjectId;
    year: number;
    month: number;
    dailyRecords: Array<{
      date: Date;
      salary: number;
      type: string;
      deductions: number;
    }>;
    totalWorkingDays: number;
    totalPresentDays: number;
    totalAbsentDays: number;
    totalLeaveDays: number;
    totalHolidays: number;
    grossSalary: number;
    totalDeductions: number;
    totalAllowances: number;
    netSalary: number;
  }