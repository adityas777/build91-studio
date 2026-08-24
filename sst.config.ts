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

    const portfolioBucket = new sst.aws.Bucket("PortfolioBucket", {
      public: true
    });

    const isProd = $app.stage === "production" || $app.stage === "prod";
    const domain = isProd ? {
      name: "studio.build91.in",
      aliases: ["www.studio.build91.in"],
      dns: false,
      cert: "arn:aws:acm:us-east-1:533267081620:certificate/456a4078-d60b-465e-ae2a-7c607ddf0987",
    } : undefined;

    new sst.aws.Nextjs("MyWeb", {
      domain,
      link: [portfolioBucket],
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
        LINKEDIN_CLIENT_ID: process.env.LINKEDIN_CLIENT_ID || "",
        LINKEDIN_CLIENT_SECRET: process.env.LINKEDIN_CLIENT_SECRET || "",
        LINKEDIN_ORGANIZATION_ID: process.env.LINKEDIN_ORGANIZATION_ID || "",
        LINKEDIN_ACCESS_TOKEN: process.env.LINKEDIN_ACCESS_TOKEN || "",
        PORTFOLIO_BUCKET_NAME: portfolioBucket.name,
        GOOGLE_SHEETS_FEEDBACK_WEBHOOK_URL: process.env.GOOGLE_SHEETS_FEEDBACK_WEBHOOK_URL || "https://script.google.com/macros/s/AKfycbyZdvI51g7OrAxucVW3RjWtM8Vi5FUH0MCo1XtqpzvF1WpyXo-9BOt3PcVlyNVLWkas/exec",
      },
    });
  },
});

