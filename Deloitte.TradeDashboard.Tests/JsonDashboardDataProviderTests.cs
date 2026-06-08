using Deloitte.TradeDashboard.Application.Models;
using Deloitte.TradeDashboard.Infrastructure.Providers;
using FluentAssertions;

namespace Deloitte.TradeDashboard.Tests;

public class JsonDashboardDataProviderTests
{
	[Fact]
	public async Task GetDashboard_Should_Return_Dashboard_Data()
	{
		// Arrange
		var provider = new JsonDashboardDataProvider();
		var query = new DashboardQuery();

		// Act
		var result = await provider.GetDashboardAsync(query, CancellationToken.None);

		// Assert
		result.Should().NotBeNull();
		result.TotalDeclarations.Should().BeGreaterThan(0);
		result.TotalGoodsValue.Should().BeGreaterThan(0);
		result.TopCountries.Should().NotBeEmpty();
		result.MapPoints.Should().NotBeEmpty();
	}

	[Fact]
	public async Task GetDashboard_Should_Return_Only_TopFive_Countries()
	{
		// Arrange
		var provider = new JsonDashboardDataProvider();
		var query = new DashboardQuery();

		// Act
		var result = await provider.GetDashboardAsync(query, CancellationToken.None);

		// Assert
		result.TopCountries.Should().HaveCount(5);
	}

	[Fact]
	public async Task GetDashboard_Should_Contain_SaudiArabia_MapPoint()
	{
		// Arrange
		var provider = new JsonDashboardDataProvider();
		var query = new DashboardQuery();

		// Act
		var result = await provider.GetDashboardAsync(query, CancellationToken.None);

		// Assert
		result.MapPoints.Should().Contain(point => point.Country == "Saudi Arabia");
	}

	[Fact]
	public async Task GetDashboard_Should_Return_Valid_Map_Coordinates()
	{
		// Arrange
		var provider = new JsonDashboardDataProvider();
		var query = new DashboardQuery();

		// Act
		var result = await provider.GetDashboardAsync(query, CancellationToken.None);

		// Assert
		result.MapPoints.Should().OnlyContain(point =>
			point.Latitude >= -90 &&
			point.Latitude <= 90 &&
			point.Longitude >= -180 &&
			point.Longitude <= 180);
	}
}
