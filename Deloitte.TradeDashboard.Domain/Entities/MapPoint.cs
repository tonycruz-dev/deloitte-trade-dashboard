namespace Deloitte.TradeDashboard.Domain.Entities;

public class MapPoint
{
	public string Country { get; set; } = string.Empty;
	public double Latitude { get; set; }
	public double Longitude { get; set; }
	public decimal Value { get; set; }
}
