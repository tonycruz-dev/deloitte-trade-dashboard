namespace Deloitte.TradeDashboard.Domain.Entities;

public class DashboardData
{
	public decimal TotalGoodsValue { get; set; }
	public int TotalDeclarations { get; set; }

	public List<CountryMetric> TopCountries { get; set; } = [];
	public List<MapPoint> MapPoints { get; set; } = [];
}