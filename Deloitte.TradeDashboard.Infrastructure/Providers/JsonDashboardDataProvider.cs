using Deloitte.TradeDashboard.Application.Contracts;
using Deloitte.TradeDashboard.Application.Models;


namespace Deloitte.TradeDashboard.Infrastructure.Providers;

public class JsonDashboardDataProvider : IDashboardDataProvider
{
	public Task<DashboardResponse> GetDashboardAsync(
		DashboardQuery query,
		CancellationToken cancellationToken)
	{
		var response = new DashboardResponse
		{
			TotalDeclarations = 245038,
			TotalGoodsValue = 645345647,
			TopCountries =
	   [
		   new CountryMetricDto
			{
				Country = "China",
				Value = 92300
			},
			new CountryMetricDto
			{
				Country = "India",
				Value = 61750
			}
	   ]
		};

		return Task.FromResult(response);
	}
}
