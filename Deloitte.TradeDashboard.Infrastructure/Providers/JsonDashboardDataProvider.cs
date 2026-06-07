using Deloitte.TradeDashboard.Application.Contracts;
using Deloitte.TradeDashboard.Application.Models;

namespace Deloitte.TradeDashboard.Infrastructure.Providers;

public class JsonDashboardDataProvider : IDashboardDataProvider
{
	public Task<DashboardResponse> GetDashboardAsync(
		DashboardQuery query,
		CancellationToken cancellationToken)
	{
		var mapPoints = new List<MapPointDto>
		{
			new() { Country = "China", Latitude = 35.8617, Longitude = 104.1954, Value = 92300 },
			new() { Country = "India", Latitude = 20.5937, Longitude = 78.9629, Value = 61750 },
			new() { Country = "Turkey", Latitude = 38.9637, Longitude = 35.2433, Value = 44120 },
			new() { Country = "Germany", Latitude = 51.1657, Longitude = 10.4515, Value = 28368 },
			new() { Country = "Saudi Arabia", Latitude = 23.8859, Longitude = 45.0792, Value = 18500 },
			new() { Country = "United States", Latitude = 37.0902, Longitude = -95.7129, Value = 38000 },
			new() { Country = "Brazil", Latitude = -14.2350, Longitude = -51.9253, Value = 22000 },
			new() { Country = "South Africa", Latitude = -30.5595, Longitude = 22.9375, Value = 21000 },
			new() { Country = "Japan", Latitude = 36.2048, Longitude = 138.2529, Value = 34000 },
			new() { Country = "Australia", Latitude = -25.2744, Longitude = 133.7751, Value = 26000 },
			new() { Country = "France", Latitude = 46.2276, Longitude = 2.2137, Value = 24000 },
			new() { Country = "United Arab Emirates", Latitude = 23.4241, Longitude = 53.8478, Value = 30000 }
		};

		var countries = mapPoints
			.Where(x => x.Country != "Saudi Arabia")
			.OrderByDescending(x => x.Value)
			.Take(5)
			.Select(x => new CountryMetricDto
			{
				Country = x.Country,
				Value = x.Value
			})
			.ToList();

		if (!string.IsNullOrWhiteSpace(query.Country) &&
			!query.Country.Equals("All", StringComparison.OrdinalIgnoreCase))
		{
			var filteredTopCountries = countries
				.Where(x => x.Country.Equals(query.Country, StringComparison.OrdinalIgnoreCase))
				.ToList();

			var filteredMapPoints = mapPoints
				.Where(x => x.Country.Equals(query.Country, StringComparison.OrdinalIgnoreCase))
				.ToList();

			var selectedValue = filteredMapPoints.Sum(x => x.Value);

			return Task.FromResult(new DashboardResponse
			{
				TotalDeclarations = selectedValue,
				TotalGoodsValue = selectedValue,
				TopCountries = filteredTopCountries,
				MapPoints = filteredMapPoints
			});
		}

		return Task.FromResult(new DashboardResponse
		{
			TotalDeclarations = 245038,
			TotalGoodsValue = 645345647,
			TopCountries = countries,
			MapPoints = mapPoints
		});
	}
}
