using System;
using System.Collections.Generic;
using System.Text;

namespace Deloitte.TradeDashboard.Application.Models;

public class DashboardResponse
{
	public int TotalDeclarations { get; set; }
	public int TotalGoodsValue { get; set; }
	public List<CountryMetricDto> TopCountries { get; set; } = new List<CountryMetricDto>();
}
