import { Type } from "class-transformer";

import {
  Equals,
  IsDefined,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from "class-validator";

export class PositionDto {
  @IsLongitude()
  lon: number;

  @IsLatitude()
  lat: number;

  @IsNumber()
  h: number;
}

export class QuaternionDto {
  @IsNumber()
  x: number;

  @IsNumber()
  y: number;

  @IsNumber()
  z: number;

  @IsNumber()
  w: number;
}

export class GeoPoseDto {
  @ValidateNested()
  @IsDefined()
  @Type(() => PositionDto)
  position: PositionDto;

  @ValidateNested()
  @IsDefined()
  @Type(() => QuaternionDto)
  quaternion: QuaternionDto;
}

export class RefDto {
  @IsString()
  contentType: string;

  /**
   * Absolute http(s) URL, or a root-relative path in the client public folder
   * (for example `/media/pointclouds/cloud1.ply`).
   * Keep this pattern aligned with `refUrlPattern` in scd-access.
   */
  @Matches(/^(https?:\/\/[^\s]+|\/(?!\/)[\w\-./%~]+)$/, {
    message:
      "url must be an absolute http(s) URL or a root-relative client public path",
  })
  url: string;
}

export class DefDto {
  @IsString()
  type: string;

  @IsString()
  value: string;
}

export class ContentDto {
  @IsString()
  id: string;

  @IsString()
  type: string;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsString({ each: true })
  keywords?: string[];

  @IsString()
  @IsOptional()
  placekey?: string;

  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => RefDto)
  refs?: RefDto[];

  @ValidateNested()
  @IsDefined()
  @Type(() => GeoPoseDto)
  geopose: GeoPoseDto;

  /** Opaque SpatialDDS payload. This service does not validate FramedPose internals. */
  @IsOptional()
  @IsObject()
  framedPose?: any;

  @IsNumber()
  @IsOptional()
  size?: number;

  @IsString()
  @IsOptional()
  bbox?: string;

  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => DefDto)
  definitions?: DefDto[];
}

export class ScrDto {
  @IsString()
  @Equals("scr")
  type: string;

  @ValidateNested()
  @Type(() => ContentDto)
  content: ContentDto;
}
