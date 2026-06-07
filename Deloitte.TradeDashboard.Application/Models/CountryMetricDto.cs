using System;
using System.Collections.Generic;
using System.Text;

namespace Deloitte.TradeDashboard.Application.Models;

public class CountryMetricDto
{
	public string Country { get; set; } = string.Empty;
	public int Value { get; set; }
}
