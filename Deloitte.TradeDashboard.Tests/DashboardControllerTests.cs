using Deloitte.TradeDashboard.Api.Controllers;
using Deloitte.TradeDashboard.Api.Hubs;
using Deloitte.TradeDashboard.Application.Contracts;
using Deloitte.TradeDashboard.Application.Models;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Moq;

namespace Deloitte.TradeDashboard.Tests;

public class DashboardControllerTests
{
	[Fact]
	public async Task GetDashboard_Should_Return_OkResult()
	{
		// Arrange
		var expectedResponse = CreateDashboardResponse();
		var providerMock = CreateProviderMock(expectedResponse);
		var controller = CreateController(providerMock);

		// Act
		var result = await controller.Get(new DashboardQuery(), CancellationToken.None);

		// Assert
		var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
		okResult.StatusCode.Should().Be(200);
	}

	[Fact]
	public async Task GetDashboard_Should_Return_DashboardResponse()
	{
		// Arrange
		var expectedResponse = new DashboardResponse
		{
			TotalDeclarations = 245038,
			TotalGoodsValue = 645345647,
			TopCountries = new List<CountryMetricDto>
			{
				new() { Country = "China", Value = 92300 }
			},
			MapPoints = new List<MapPointDto>
			{
				new() { Country = "China", Latitude = 35.8617, Longitude = 104.1954, Value = 92300 }
			}
		};
		var providerMock = CreateProviderMock(expectedResponse);
		var controller = CreateController(providerMock);

		// Act
		var result = await controller.Get(new DashboardQuery(), CancellationToken.None);

		// Assert
		var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
		var response = okResult.Value.Should().BeOfType<DashboardResponse>().Subject;
		response.TotalDeclarations.Should().Be(245038);
		response.TotalGoodsValue.Should().Be(645345647);
	}

	[Fact]
	public async Task GetDashboard_Should_Invoke_Provider()
	{
		// Arrange
		var providerMock = CreateProviderMock(CreateDashboardResponse());
		var controller = CreateController(providerMock);

		// Act
		await controller.Get(new DashboardQuery(), CancellationToken.None);

		// Assert
		providerMock.Verify(
			x => x.GetDashboardAsync(It.IsAny<DashboardQuery>(), It.IsAny<CancellationToken>()),
			Times.Once);
	}

	[Fact]
	public async Task SimulateUpdate_Should_Return_OkResult()
	{
		// Arrange
		var providerMock = CreateProviderMock(CreateDashboardResponse());
		var controller = CreateController(providerMock);

		// Act
		var result = await controller.SimulateUpdate(new DashboardQuery(), CancellationToken.None);

		// Assert
		var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
		okResult.StatusCode.Should().Be(200);
	}

	[Fact]
	public async Task SimulateUpdate_Should_Return_UpdatedDashboardResponse()
	{
		// Arrange
		var providerMock = CreateProviderMock(CreateDashboardResponse());
		var controller = CreateController(providerMock);

		// Act
		var result = await controller.SimulateUpdate(new DashboardQuery(), CancellationToken.None);

		// Assert
		var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
		var response = okResult.Value.Should().BeOfType<DashboardResponse>().Subject;
		response.TopCountries.Should().NotBeNull();
		response.MapPoints.Should().NotBeNull();
		response.TotalDeclarations.Should().BeGreaterThan(0);
		response.TotalGoodsValue.Should().BeGreaterThan(0);
	}

	private static DashboardController CreateController(Mock<IDashboardDataProvider> providerMock)
	{
		var clientProxyMock = new Mock<IClientProxy>();
		clientProxyMock
			.Setup(x => x.SendCoreAsync(
				It.IsAny<string>(),
				It.IsAny<object?[]>(),
				It.IsAny<CancellationToken>()))
			.Returns(Task.CompletedTask);

		var hubClientsMock = new Mock<IHubClients>();
		hubClientsMock.Setup(x => x.All).Returns(clientProxyMock.Object);

		var hubContextMock = new Mock<IHubContext<DashboardHub>>();
		hubContextMock.Setup(x => x.Clients).Returns(hubClientsMock.Object);

		return new DashboardController(providerMock.Object, hubContextMock.Object);
	}

	private static Mock<IDashboardDataProvider> CreateProviderMock(DashboardResponse response)
	{
		var providerMock = new Mock<IDashboardDataProvider>();
		providerMock
			.Setup(x => x.GetDashboardAsync(It.IsAny<DashboardQuery>(), It.IsAny<CancellationToken>()))
			.ReturnsAsync(response);

		return providerMock;
	}

	private static DashboardResponse CreateDashboardResponse()
	{
		return new DashboardResponse
		{
			TotalDeclarations = 245038,
			TotalGoodsValue = 645345647,
			TopCountries = new List<CountryMetricDto>
			{
				new() { Country = "China", Value = 92300 },
				new() { Country = "India", Value = 61750 }
			},
			MapPoints = new List<MapPointDto>
			{
				new() { Country = "China", Latitude = 35.8617, Longitude = 104.1954, Value = 92300 },
				new() { Country = "Saudi Arabia", Latitude = 23.8859, Longitude = 45.0792, Value = 18500 }
			}
		};
	}
}
