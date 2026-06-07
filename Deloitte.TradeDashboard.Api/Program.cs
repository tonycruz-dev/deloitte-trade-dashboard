using Deloitte.TradeDashboard.Api.Hubs;
using Deloitte.TradeDashboard.Application.Contracts;
using Deloitte.TradeDashboard.Infrastructure.Providers;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.AddSwaggerGen(options =>
{
	options.SwaggerDoc("v1", new OpenApiInfo
	{
		Title = "TradeDashboard API",
		Version = "v1"
	});
});
builder.Services.AddCors(options =>
{
	options.AddPolicy("ReactApp", policy =>
	{
		policy
			.WithOrigins(
				"http://localhost:3000",
				"https://localhost:3000",
				"http://localhost:5173",
				"https://localhost:5173")
			.AllowAnyHeader()
			.AllowAnyMethod()
			.AllowCredentials();
	});
});
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

app.UseCors("ReactApp");

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();
app.MapHub<DashboardHub>("/hubs/dashboard");

app.Run();
