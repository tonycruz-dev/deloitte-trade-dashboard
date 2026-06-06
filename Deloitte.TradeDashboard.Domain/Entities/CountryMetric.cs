using System;
using System.Collections.Generic;
using System.Text;

namespace Deloitte.TradeDashboard.Domain.Entities;

public class CountryMetric
{
	public string Country { get; set; } = string.Empty;
	public decimal Value { get; set; }
	public int Declarations { get; set; }
}
