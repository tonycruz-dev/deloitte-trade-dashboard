using Deloitte.TradeDashboard.Application.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace Deloitte.TradeDashboard.Application.Contracts;

public interface IDashboardDataProvider
{
	Task<DashboardResponse> GetDashboardAsync(
		DashboardQuery query,
		CancellationToken cancellationToken);
}