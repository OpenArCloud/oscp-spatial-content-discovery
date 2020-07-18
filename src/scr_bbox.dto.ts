import { IsLatitude, IsLongitude } from 'class-validator';

export class BboxDto {
  @IsLongitude()
  minLongitude: number;

  @IsLatitude()
  minLatitude: number;

  @IsLongitude()
  maxLongitude: number;

  @IsLatitude()
  maxLatitude: number;

}

