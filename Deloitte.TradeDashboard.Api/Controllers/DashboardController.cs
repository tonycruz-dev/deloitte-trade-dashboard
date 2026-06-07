using Deloitte.TradeDashboard.Api.Hubs;
using Deloitte.TradeDashboard.Application.Contracts;
using Deloitte.TradeDashboard.Application.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace Deloitte.TradeDashboard.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController(
	IDashboardDataProvider provider,
	IHubContext<DashboardHub> hubContext) : ControllerBase
{
	private readonly IDashboardDataProvider _provider = provider;
	private readonly IHubContext<DashboardHub> _hubContext = hubContext;
	private const string DashboardUpdatedEventName = "DashboardUpdated";

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

	[HttpPost("simulate-update")]
	public async Task<IActionResult> SimulateUpdate(
		[FromQuery] DashboardQuery query,
		CancellationToken cancellationToken)
	{
		var currentDashboard = await _provider.GetDashboardAsync(query, cancellationToken);
		var updatedDashboard = BuildUpdatedDashboard(currentDashboard);

		await _hubContext.Clients.All.SendAsync(
			DashboardUpdatedEventName,
			updatedDashboard,
			cancellationToken);

		return Ok(updatedDashboard);
	}

	private static DashboardResponse BuildUpdatedDashboard(DashboardResponse currentDashboard)
	{
		var sourceMapPoints = currentDashboard.MapPoints ?? new List<MapPointDto>();

		var updatedMapPoints = sourceMapPoints
			.Select(point => new MapPointDto
			{
				Country = point.Country,
				Latitude = point.Latitude,
				Longitude = point.Longitude,
				Value = ApplyVariation(point.Value, 0.14, 900)
			})
			.ToList();

		var updatedTopCountries = BuildUpdatedTopCountries(currentDashboard, updatedMapPoints);
		var totalDeclarations = ApplyVariation(currentDashboard.TotalDeclarations, 0.08, 1200);
		var totalGoodsValue = ApplyVariation(currentDashboard.TotalGoodsValue, 0.1, 2500000);

		return new DashboardResponse
		{
			TotalDeclarations = totalDeclarations,
			TotalGoodsValue = totalGoodsValue,
			TopCountries = updatedTopCountries,
			MapPoints = updatedMapPoints
		};
	}

	private static List<CountryMetricDto> BuildUpdatedTopCountries(
		DashboardResponse currentDashboard,
		List<MapPointDto> updatedMapPoints)
	{
		if (currentDashboard.TopCountries.Count == 0)
		{
			return updatedMapPoints
				.OrderByDescending(point => point.Value)
				.Take(5)
				.Select(point => new CountryMetricDto
				{
					Country = point.Country,
					Value = point.Value
				})
				.ToList();
		}

		var topCountryNames = currentDashboard.TopCountries
			.Select(country => country.Country)
			.ToHashSet(StringComparer.OrdinalIgnoreCase);

		return updatedMapPoints
			.Where(point => topCountryNames.Contains(point.Country))
			.OrderByDescending(point => point.Value)
			.Select(point => new CountryMetricDto
			{
				Country = point.Country,
				Value = point.Value
			})
			.ToList();
	}

	private static int ApplyVariation(int currentValue, double maxRatio, int minimumDelta)
	{
		var ratio = (Random.Shared.NextDouble() * 2d - 1d) * maxRatio;
		var delta = Math.Max(minimumDelta, (int)Math.Round(currentValue * Math.Abs(ratio)));
		var updatedValue = currentValue + Math.Sign(ratio) * delta;

		return Math.Max(1, updatedValue);
	}
}
