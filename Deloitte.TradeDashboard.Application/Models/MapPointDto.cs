namespace Deloitte.TradeDashboard.Application.Models;

public class MapPointDto
{
	public string Country { get; set; } = string.Empty;
	public double Latitude { get; set; }
	public double Longitude { get; set; }
	public int Value { get; set; }
}
