using Deloitte.TradeDashboard.Application.Contracts;
using Deloitte.TradeDashboard.Application.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace Deloitte.TradeDashboard.Infrastructure.Providers;

public class JsonDashboardDataProvider : IDashboardDataProvider
{
	public Task<DashboardResponse> GetDashboardAsync(
		DashboardQuery query,
		CancellationToken cancellationToken)
	{
		throw new NotImplementedException();
	}
}
