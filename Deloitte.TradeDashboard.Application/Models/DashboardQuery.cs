using System;
using System.Collections.Generic;
using System.Text;

namespace Deloitte.TradeDashboard.Application.Models;

public class DashboardQuery
{
	public string? Country { get; set; }
	public string? TradeType { get; set; }
	public string? Period { get; set; }
}
