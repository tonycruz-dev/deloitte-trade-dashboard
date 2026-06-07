export interface CountryMetricDto {
  country: string;
  value: number;
}

export interface MapPointDto {
  country: string;
  latitude: number;
  longitude: number;
  value: number;
}

export interface DashboardResponse {
  totalDeclarations: number;
  totalGoodsValue: number;
  topCountries: CountryMetricDto[];
  mapPoints: MapPointDto[];
}
