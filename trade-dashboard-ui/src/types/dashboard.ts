export interface CountryMetricDto {
  country: string;
  value: number;
}

export interface DashboardResponse {
  totalDeclarations: number;
  totalGoodsValue: number;
  topCountries: CountryMetricDto[];
}
