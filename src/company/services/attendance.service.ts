// services/attendance.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { Connection } from 'mongoose';
import { TenantService } from 'src/tenant/tenant.service';
import { AttendanceSchema } from '../schemas/attendance.schema';
import * as moment from 'moment';
import { WorkShiftService } from './workshift.service';
import { UserSchema } from '../schemas/user.schema';
import { WorkShiftSchema } from '../schemas/workshift.schema';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly tenantService: TenantService,
    private readonly workShiftService: WorkShiftService,
  ) {}

  private async getAttendanceModel(tenantId: string, domain: string) {
    const tenantDb: Connection = await this.tenantService.getTenantDatabase(
      tenantId,
      domain,
    );
    return (
      tenantDb.models.Attendance ||
      tenantDb.model('Attendance', AttendanceSchema)
    );
  }

  private async getWorkShiftModel(tenantId: string, domain: string) {
    const tenantDb: Connection = await this.tenantService.getTenantDatabase(
      tenantId,
      domain,
    );
    return (
      tenantDb.models.WorkShift || tenantDb.model('WorkShift', WorkShiftSchema)
    );
  }

  private async getEmployeeModel(tenantId: string, domain: string) {
    const tenantDb: Connection = await this.tenantService.getTenantDatabase(
      tenantId,
      domain,
    );
    return tenantDb.models.User || tenantDb.model('User', UserSchema);
  }

  async checkIn(tenantId: string, domain: string, employeeId: string) {
    const attendanceModel = await this.getAttendanceModel(tenantId, domain);
    const employeeModel = await this.getEmployeeModel(tenantId, domain);
    const workShiftModel = await this.getWorkShiftModel(tenantId, domain);
  
    const employee = await employeeModel
      .findById(employeeId)
      .populate({ path: 'workShift', model: workShiftModel });
  
    if (!employee) {
      throw new BadRequestException('Employee not found');
    }
  
    const workShift = employee.workShift;
    const now = moment().utc();
    const today = now.startOf('day');
    
    const shiftStart = moment.utc(today.format('YYYY-MM-DD') + ' ' + workShift.startTime, 'YYYY-MM-DD HH:mm');
    const shiftEnd = moment.utc(today.format('YYYY-MM-DD') + ' ' + workShift.endTime, 'YYYY-MM-DD HH:mm');
  
    if (now.isBefore(shiftStart.subtract(30, 'minutes'))) {
      throw new BadRequestException('Check-in is not allowed yet');
    }
  
    // Find attendance for today
    const todayAttendance = await attendanceModel.findOne({
      employee: employeeId,
      date: today.toDate(),
    });
  
    if (todayAttendance && todayAttendance.checkIn) {
      throw new BadRequestException('Already checked in for today');
    }
  
    // If no attendance for today, create a new one
    const attendance = todayAttendance || new attendanceModel({
      employee: employeeId,
      date: today.toDate(),
      workShift: workShift._id,
    });
  
    attendance.checkIn = now.toDate();
    attendance.status = now.isAfter(shiftStart) ? 'Late' : 'Present';
  
    await attendance.save();
  
    return { message: 'Check-in successful', attendance };
  }

  async checkOut(tenantId: string, domain: string, employeeId: string) {
    const attendanceModel = await this.getAttendanceModel(tenantId, domain);

    const now = moment().utc();
    const attendance = await attendanceModel.findOne({
      employee: employeeId,
      date: now.startOf('day').toDate(),
    });

    if (!attendance || !attendance.checkIn) {
      throw new BadRequestException('No check-in record found for today');
    }

    if (attendance.checkOut) {
      throw new BadRequestException('Already checked out for today');
    }

    attendance.checkOut = now.toDate();
    attendance.hoursWorked = moment
      .duration(moment.utc(attendance.checkOut).diff(moment.utc(attendance.checkIn)))
      .asHours();

    await attendance.save();

    return { message: 'Check-out successful', attendance };
  }

  async getEmployeeAttendance(
    tenantId: string,
    domain: string,
    employeeId: string,
  ) {
    const attendanceModel = await this.getAttendanceModel(tenantId, domain);
    return attendanceModel.find({ employee: employeeId }).sort({ date: -1 });
  }

  async getTodayAttendance(tenantId: string, domain: string) {
    const attendanceModel = await this.getAttendanceModel(tenantId, domain);
    const workShiftModel = await this.getWorkShiftModel(tenantId,domain);
    const employeeModel = await this.getEmployeeModel(tenantId,domain);

    const today = moment.utc().startOf('day').toDate();
    return attendanceModel
      .find({ date: today })
      .populate([
        { path: 'workShift', model: workShiftModel },
        { path: 'employee', model: employeeModel }
      ]);
  }

  async getAttendanceStatus(
    tenantId: string,
    domain: string,
    employeeId: string,
  ) {
    const attendanceModel = await this.getAttendanceModel(tenantId, domain);
    const employeeModel = await this.getEmployeeModel(tenantId, domain);

    const employee = await employeeModel
      .findById(employeeId)
      .populate('workShift');
    if (!employee) {
      throw new BadRequestException('Employee not found');
    }

    const workShift = employee.workShift;
    const now = moment();
    const shiftStart = moment.utc(workShift.startTime, 'HH:mm');
    const shiftEnd = moment.utc(workShift.endTime, 'HH:mm');

    const todayAttendance = await attendanceModel.findOne({
      employee: employeeId,
      date: now.startOf('day').toDate(),
    });

    const canCheckIn =
      now.isAfter(shiftStart.subtract(30, 'minutes')) &&
      (!todayAttendance || !todayAttendance.checkIn);
    const canCheckOut =
      todayAttendance && todayAttendance.checkIn && !todayAttendance.checkOut;

    return {
      employeeId,
      workShift: {
        startTime: workShift.startTime,
        endTime: workShift.endTime,
      },
      todayAttendance: todayAttendance || null,
      canCheckIn,
      canCheckOut,
    };
  }
}
