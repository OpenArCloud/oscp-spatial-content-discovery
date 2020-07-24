import {
  IsLatitude,
  IsLongitude,
  IsUrl,
  IsNumber,
  IsPositive,
  IsString,
  Equals,
} from "class-validator";

export class GeoPoseDto {
  @IsLatitude()
  north: number;

  @IsLongitude()
  east: number;

  @IsNumber()
  @IsPositive()
  vertical: number;

  @IsNumber()
  qNorth: number;

  @IsNumber()
  qEast: number;

  @IsNumber()
  qVertical: number;

  @IsNumber()
  qW: number;
}

export class ScrDto {
  @IsString()
  @Equals("scr")
  type: String;

  geopose: GeoPoseDto;

  @IsUrl()
  url: URL;
}
