using Deloitte.TradeDashboard.Application.Contracts;
using Deloitte.TradeDashboard.Application.Models;
using Microsoft.AspNetCore.Mvc;
namespace Deloitte.TradeDashboard.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController(IDashboardDataProvider provider) : ControllerBase
{
	private readonly IDashboardDataProvider _provider = provider;

	[HttpGet]
	public async Task<IActionResult> Get(
		[FromQuery] DashboardQuery query,
		CancellationToken cancellationToken)
	{
		var result = await _provider.GetDashboardAsync(
			query,
			cancellationToken);

		return Ok(result);
	}
}