import { IsLatitude, IsLongitude, IsUrl, IsNumber, IsPositive, IsString, Equals } from 'class-validator';

export class GeoPoseDto {
  @IsLatitude()
  north: Number;

  @IsLongitude()
  east: Number;

  @IsNumber()
  @IsPositive()
  vertical: Number;

  @IsNumber()
  qNorth: Number;

  @IsNumber()
  qEast: Number;

  @IsNumber()
  qVertical: Number;

  @IsNumber()
  qW: Number;
}

export class ScrDto {

  @IsString()
  @Equals("scr")
  type: String;

  geopose: GeoPoseDto;

  @IsUrl()
  url: URL;
}
