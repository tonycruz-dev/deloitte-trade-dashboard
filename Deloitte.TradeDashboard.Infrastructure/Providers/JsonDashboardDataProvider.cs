using Deloitte.TradeDashboard.Application.Contracts;
using Deloitte.TradeDashboard.Application.Models;

namespace Deloitte.TradeDashboard.Infrastructure.Providers;

public class JsonDashboardDataProvider : IDashboardDataProvider
{
	public Task<DashboardResponse> GetDashboardAsync(
		DashboardQuery query,
		CancellationToken cancellationToken)
	{
		var countries = new List<CountryMetricDto>
		{
			new() { Country = "China", Value = 92300 },
			new() { Country = "India", Value = 61750 },
			new() { Country = "Turkey", Value = 44120 },
			new() { Country = "Germany", Value = 28368 },
			new() { Country = "England", Value = 18500 }
		};

		var mapPoints = new List<MapPointDto>
		{
			new() { Country = "China", Latitude = 35.8617, Longitude = 104.1954, Value = 92300 },
			new() { Country = "India", Latitude = 20.5937, Longitude = 78.9629, Value = 61750 },
			new() { Country = "Turkey", Latitude = 38.9637, Longitude = 35.2433, Value = 44120 },
			new() { Country = "Germany", Latitude = 51.1657, Longitude = 10.4515, Value = 28368 },
			new() { Country = "Saudi Arabia", Latitude = 23.8859, Longitude = 45.0792, Value = 18500 }
		};

		if (!string.IsNullOrWhiteSpace(query.Country) &&
			!query.Country.Equals("All", StringComparison.OrdinalIgnoreCase))
		{
			countries = countries
				.Where(x => x.Country.Equals(query.Country, StringComparison.OrdinalIgnoreCase))
				.ToList();

			mapPoints = mapPoints
				.Where(x => x.Country.Equals(query.Country, StringComparison.OrdinalIgnoreCase))
				.ToList();

			var selectedValue = countries.Sum(x => x.Value);

			return Task.FromResult(new DashboardResponse
			{
				TotalDeclarations = selectedValue,
				TotalGoodsValue = selectedValue,
				TopCountries = countries,
				MapPoints = mapPoints
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
