import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePlansDto {
  @IsNotEmpty()
  @IsString()
  planName: string;

  @IsNotEmpty()
  @IsString()
  planAmount: string;

  @IsNotEmpty()
  @IsString()
  planDuration: string;

  @IsNotEmpty()
  @IsString()
  maxEmployees: string;
}
