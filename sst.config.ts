export default $config({
  app(input) {
    return {
      name: "build91-studio",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    // Dynamically import fs/path to load .env.local variables
    const fs = await import("fs");
    const path = await import("path");
    
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      const lines = fs.readFileSync(envPath, "utf-8").split(/\r?\n/);
      for (const line of lines) {
        // Ignore comments and empty lines
        if (line.trim().startsWith("#") || !line.includes("=")) continue;
        
        const parts = line.split("=");
        const key = parts[0].trim();
        let value = parts.slice(1).join("=").trim();
        
        // Strip wrapping quotes
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }

    new sst.aws.Nextjs("MyWeb", {
      environment: {
        RESEND_API_KEY: process.env.RESEND_API_KEY || "",
        QUOTE_TO_EMAIL: process.env.QUOTE_TO_EMAIL || "",
        RESEND_FROM: process.env.RESEND_FROM || "",
        GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY || "",
        GOOGLE_PLACE_ID: process.env.GOOGLE_PLACE_ID || "",
        IG_BUSINESS_ACCOUNT_ID: process.env.IG_BUSINESS_ACCOUNT_ID || "",
        IG_ACCESS_TOKEN: process.env.IG_ACCESS_TOKEN || "",
        CRON_SECRET: process.env.CRON_SECRET || "",
        KV_REST_API_URL: process.env.KV_REST_API_URL || "",
        KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN || "",
      },
    });
  },
});
