using Deloitte.TradeDashboard.Application.Contracts;
using Deloitte.TradeDashboard.Infrastructure.Providers;
using Microsoft.OpenApi.Models;
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddSwaggerGen(options =>
{
	options.SwaggerDoc("v1", new OpenApiInfo
	{
		Title = "TradeDashboard API",
		Version = "v1"
	});


});
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddScoped<IDashboardDataProvider, JsonDashboardDataProvider>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
	app.UseSwagger();
	app.UseSwaggerUI(options =>
	{
		options.SwaggerEndpoint("/swagger/v1/swagger.json", "TradeDashboard API v1");
	});
}


app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
