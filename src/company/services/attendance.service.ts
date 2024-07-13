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
    const now = moment();
    const today = now.clone().startOf('day');

    // Parse shift times in UTC
    const shiftStart = moment(
      today.format('YYYY-MM-DD') + ' ' + workShift.shiftIn,
      'YYYY-MM-DD HH:mm',
    );
    const shiftEnd = moment(
      today.format('YYYY-MM-DD') + ' ' + workShift.shiftOut,
      'YYYY-MM-DD HH:mm',
    );

    // Adjust shiftStart if it's after current time (might be due to day change)
    // if (shiftStart.isAfter(now)) {
    //   shiftStart.subtract(1, 'day');
    // }

    const checkInAllowedTime = shiftStart.clone().subtract(30, 'minutes');

    console.log('Current time (UTC):', now.format());
    console.log('Shift start (UTC):', shiftStart.format());
    console.log('Check-in allowed from (UTC):', checkInAllowedTime.format());

    if (now.isBefore(checkInAllowedTime)) {
      throw new BadRequestException('Check-in is not allowed yet');
    }

  
    const todayAttendance = await attendanceModel.findOne({
      employee: employeeId,
      date: today.toDate(),
    });

    if (todayAttendance && todayAttendance.checkIn) {
      throw new BadRequestException('Already checked in for today');
    }

    const attendance =
      todayAttendance ||
      new attendanceModel({
        employee: employeeId,
        date: today.toDate(),
        workShift: workShift._id,
      });

    attendance.checkIn = now.toDate();
    attendance.status = now.isAfter(shiftStart) ? 'Late' : 'Present';

    if (now.isAfter(shiftStart)) {
      attendance.lateArrivalMinutes = now.diff(shiftStart, 'minutes');
    }

    await attendance.save();

    return { message: 'Check-in successful', attendance };
  }

  async checkOut(tenantId: string, domain: string, employeeId: string) {
    const attendanceModel = await this.getAttendanceModel(tenantId, domain);
    const workShiftModel = await this.getWorkShiftModel(tenantId, domain);
    const now = moment();
    const today = now.clone().startOf('day');

    const attendance = await attendanceModel
      .findOne({
        employee: employeeId,
        date: today.toDate(),
      })
      .populate({ path: 'workShift', model: workShiftModel });

    if (!attendance || !attendance.checkIn) {
      throw new BadRequestException('No check-in record found for today');
    }

    if (attendance.checkOut) {
      throw new BadRequestException('Already checked out for today');
    }

    const workShift = attendance.workShift;
    const shiftEnd = moment(
      today.format('YYYY-MM-DD') + ' ' + workShift.shiftOut,
      'YYYY-MM-DD HH:mm',
    );

    attendance.checkOut = now.toDate();
    attendance.hoursWorked = moment
      .duration(moment(attendance.checkOut).diff(moment(attendance.checkIn)))
      .asHours();

    if(now.isBefore(shiftEnd)){
      attendance.earlyDepartureMinutes = shiftEnd.diff(now,'minutes');
    }  

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
    const workShiftModel = await this.getWorkShiftModel(tenantId, domain);
    const employeeModel = await this.getEmployeeModel(tenantId, domain);

    const today = moment().startOf('day').toDate();
    return attendanceModel.find({ date: today }).populate([
      { path: 'workShift', model: workShiftModel },
      { path: 'employee', model: employeeModel },
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
    const shiftStart = moment(workShift.startTime, 'HH:mm');
    const shiftEnd = moment(workShift.endTime, 'HH:mm');

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

  async getCurrentDayEmployeeAttendance(
    tenantId: string,
    domain: string,
    employeeId: string,
  ) {
    const attendanceModel = await this.getAttendanceModel(tenantId, domain);
    const workShiftModel = await this.getWorkShiftModel(tenantId, domain);
    const userModel = await this.getEmployeeModel(tenantId, domain);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    let attendance = await attendanceModel.findOne({
      employee: employeeId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    }).populate({ path: 'workShift', model: workShiftModel });
  
    console.log("Attendance:", attendance);
  
    let workShift;
    if (!attendance) {
      const user = await userModel.findById(employeeId).populate({ path: 'workShift', model: workShiftModel });
      console.log('user:', user);
  
      if (!user || !user.workShift) {
        return {
          checkInTime: null,
          checkOutTime: null,
          status: null,
        };
      }
      workShift = user.workShift;
    } else {
      workShift = attendance.workShift;
    }
  
    const currentTime = new Date();
    const shiftIn = this.parseTime(workShift.shiftIn);
    const shiftOut = this.parseTime(workShift.shiftOut);
  
    // Handle shift crossing midnight
    if (workShift.shiftOutNextDay) {
      shiftOut.setDate(shiftOut.getDate() + 1);
    }
  
    const shiftDuration = shiftOut.getTime() - shiftIn.getTime();
    const halfShiftDuration = shiftDuration / 2;
    const timeElapsed = currentTime.getTime() - shiftIn.getTime();
  
    console.log('halfShiftDuration:', halfShiftDuration);
    console.log('shiftDuration:', shiftDuration);
    console.log('timeElapsed:', timeElapsed);
  
    let status = null;
  
    if (!attendance && timeElapsed > halfShiftDuration) {
      // Create a new attendance document marking as absent only if it doesn't exist
      attendance = new attendanceModel({
        employee: employeeId,
        date: today,
        workShift: workShift._id,
        status: 'Absent',
        hoursWorked: 0,
        lateArrivalMinutes: 0,
        earlyDepartureMinutes: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      await attendance.save();
      status = 'Absent';
    } else if (attendance) {
      status = attendance.status;
    }
  
    return {
      checkInTime: attendance ? attendance.checkIn : null,
      checkOutTime: attendance ? attendance.checkOut : null,
      status: status,
    };
  }
  
  // Helper function to parse time string (HH:mm) to Date object
  private parseTime(timeString: string): Date {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }
}
