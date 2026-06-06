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

		if (!string.IsNullOrWhiteSpace(query.Country) &&
			!query.Country.Equals("All", StringComparison.OrdinalIgnoreCase))
		{
			countries = countries
				.Where(x => x.Country.Equals(query.Country, StringComparison.OrdinalIgnoreCase))
				.ToList();
		}

		var response = new DashboardResponse
		{
			TotalDeclarations = countries.Count == 1 ? (int)countries[0].Value : 245038,
			TotalGoodsValue = countries.Sum(x => x.Value),
			TopCountries = countries
		};

		return Task.FromResult(response);
	}
}
