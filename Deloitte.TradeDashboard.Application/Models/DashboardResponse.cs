using System.Collections.Generic;

namespace Deloitte.TradeDashboard.Application.Models;

public class DashboardResponse
{
	public int TotalDeclarations { get; set; }
	public int TotalGoodsValue { get; set; }
	public List<CountryMetricDto> TopCountries { get; set; } = new();
	public List<MapPointDto> MapPoints { get; set; } = new();
}
