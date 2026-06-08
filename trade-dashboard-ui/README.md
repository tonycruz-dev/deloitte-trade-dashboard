# Trade Dashboard UI

## Microsoft Clarity

This frontend is a React 19 + Vite application. Microsoft Clarity is loaded globally from `src/main.tsx`, so it runs on every page after the app starts. The script is only injected when `NEXT_PUBLIC_CLARITY_ID` is present at build time.

### Get the Clarity Project ID

1. Sign in to [Microsoft Clarity](https://clarity.microsoft.com/).
2. Create a new project or open your existing project for `https://trade-dashboard.mpa-demo.co.uk`.
3. Copy the Project ID shown in the Clarity install snippet.

### Set `NEXT_PUBLIC_CLARITY_ID`

Set the variable in the frontend build environment before running the production build.

Example `.env.production` entry:

```env
NEXT_PUBLIC_CLARITY_ID=your_clarity_project_id
VITE_API_BASE_URL=https://trade-dashboard.mpa-demo.co.uk
VITE_SIGNALR_HUB_URL=/hubs/dashboard
VITE_MAPBOX_TOKEN=your_mapbox_public_token_here
```

Because this is a Vite app, the build has been configured to expose both `VITE_*` variables and `NEXT_PUBLIC_*` variables to the client bundle.

### Rebuild the frontend

From the repository root:

```powershell
cd trade-dashboard-ui
npm install
npm run build
```

The Vite build outputs directly into `Deloitte.TradeDashboard.Api/wwwroot`.

### Redeploy to IIS

After rebuilding the frontend, publish the ASP.NET Core host:

```powershell
dotnet publish .\Deloitte.TradeDashboard.Api\Deloitte.TradeDashboard.Api.csproj -c Release -o .\publish
```

Copy the contents of the `publish` folder to the IIS site folder for the application. That publish output includes:

- the ASP.NET Core application files
- the updated `wwwroot` folder
- the built React assets with the Clarity loader

If you already use a publish profile or CI/CD pipeline, rebuild the frontend first, then run your normal publish step so the refreshed `wwwroot` assets are included.

### Verify Clarity is working

1. Open the deployed site in the browser.
2. Open DevTools and go to the `Network` tab.
3. Filter for `clarity` or `collect`.
4. Confirm requests are being sent to `https://www.clarity.ms/collect`.
5. Check the Clarity dashboard for new sessions, devices, and page activity.

### Sensitive fields

The current dashboard does not contain free-text, password, payment, or personal-data form fields. If you add sensitive inputs later, explicitly mask them in the markup with:

```html
<input data-clarity-mask="true" />
```

Use the same attribute on any container that should be masked before enabling tracking on new user-input flows.
