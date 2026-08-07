const https = require('https');
const fs = require('fs');
const path = require('path');

const targets = [
  {
    name: 'Old Website (studio.build91.in)',
    url: 'https://studio.build91.in'
  },
  {
    name: 'New Platform (CloudFront - Optimized)',
    url: 'https://d2k73itel8zrf6.cloudfront.net'
  },
  {
    name: 'New Platform (Custom Domain - dev.build91.in)',
    url: 'https://dev.build91.in'
  }
];

const strategies = ['mobile', 'desktop'];

function fetchPagespeed(targetUrl, strategy) {
  const categories = ['performance', 'accessibility', 'best-practices', 'seo'];
  const categoriesParams = categories.map(c => `category=${c}`).join('&');
  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(targetUrl)}&strategy=${strategy}&${categoriesParams}`;

  console.log(`Fetching PageSpeed for: ${targetUrl} (${strategy})...`);
  
  return new Promise((resolve, reject) => {
    https.get(apiUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        if (res.statusCode !== 200) {
          console.error(`Error status ${res.statusCode} for ${targetUrl} (${strategy})`);
          try {
            const errObj = JSON.parse(body);
            console.error(JSON.stringify(errObj.error, null, 2));
          } catch (e) {
            console.error(body.substring(0, 500));
          }
          resolve(null);
          return;
        }
        try {
          const data = JSON.parse(body);
          resolve(data);
        } catch (e) {
          console.error(`Failed to parse JSON for ${targetUrl} (${strategy}):`, e.message);
          resolve(null);
        }
      });
    }).on('error', (err) => {
      console.error(`Request error for ${targetUrl} (${strategy}):`, err.message);
      resolve(null);
    });
  });
}

function parseMetrics(data) {
  if (!data || !data.lighthouseResult) return null;
  const lh = data.lighthouseResult;
  
  const getScore = (cat) => {
    return lh.categories[cat] ? Math.round(lh.categories[cat].score * 100) : 'N/A';
  };

  const getAudit = (auditName) => {
    const audit = lh.audits[auditName];
    return audit ? {
      displayValue: audit.displayValue || 'N/A',
      numericValue: audit.numericValue !== undefined ? Math.round(audit.numericValue) : 'N/A'
    } : { displayValue: 'N/A', numericValue: 'N/A' };
  };

  return {
    scores: {
      performance: getScore('performance'),
      accessibility: getScore('accessibility'),
      bestPractices: getScore('best-practices'),
      seo: getScore('seo')
    },
    metrics: {
      fcp: getAudit('first-contentful-paint'),
      lcp: getAudit('largest-contentful-paint'),
      tbt: getAudit('total-blocking-time'),
      cls: getAudit('cumulative-layout-shift'),
      speedIndex: getAudit('speed-index'),
      tti: getAudit('interactive')
    }
  };
}

async function run() {
  const results = {};

  for (const target of targets) {
    results[target.name] = { url: target.url };
    for (const strategy of strategies) {
      // Retry once if it fails
      let data = await fetchPagespeed(target.url, strategy);
      if (!data) {
        console.log(`Retrying fetch for ${target.name} (${strategy})...`);
        await new Promise(r => setTimeout(r, 5000));
        data = await fetchPagespeed(target.url, strategy);
      }
      
      const parsed = parseMetrics(data);
      if (parsed) {
        results[target.name][strategy] = parsed;
        console.log(`Success: ${target.name} (${strategy}) - Performance: ${parsed.scores.performance}`);
      } else {
        results[target.name][strategy] = 'Failed to fetch/parse';
        console.log(`Failed: ${target.name} (${strategy})`);
      }
    }
  }

  // Save raw results
  const outPath = path.join(__dirname, '..', 'docs', 'pagespeed_results.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`\nResults written to: ${outPath}`);

  // Generate markdown report snippet
  let md = `# PageSpeed Insights Performance Comparison\n\n`;
  md += `Generated on: ${new Date().toLocaleString()}\n\n`;

  for (const strategy of strategies) {
    md += `## Strategy: ${strategy.toUpperCase()}\n\n`;
    md += `| Metric | Old Website (Wix) | New Platform (CloudFront) | New Platform (dev.build91.in) |\n`;
    md += `| :--- | :---: | :---: | :---: |\n`;
    
    const oldRes = results['Old Website (studio.build91.in)'][strategy];
    const cfRes = results['New Platform (CloudFront - Optimized)'][strategy];
    const customRes = results['New Platform (Custom Domain - dev.build91.in)'][strategy];

    const getVal = (res, pathStr, defaultVal = '-') => {
      if (!res || typeof res === 'string') return defaultVal;
      const parts = pathStr.split('.');
      let val = res;
      for (const part of parts) {
        if (val && val[part] !== undefined) {
          val = val[part];
        } else {
          return defaultVal;
        }
      }
      return val;
    };

    md += `| **Performance Score** | ${getVal(oldRes, 'scores.performance')} / 100 | ${getVal(cfRes, 'scores.performance')} / 100 | ${getVal(customRes, 'scores.performance')} / 100 |\n`;
    md += `| **Accessibility Score** | ${getVal(oldRes, 'scores.accessibility')} / 100 | ${getVal(cfRes, 'scores.accessibility')} / 100 | ${getVal(customRes, 'scores.accessibility')} / 100 |\n`;
    md += `| **Best Practices Score** | ${getVal(oldRes, 'scores.bestPractices')} / 100 | ${getVal(cfRes, 'scores.bestPractices')} / 100 | ${getVal(customRes, 'scores.bestPractices')} / 100 |\n`;
    md += `| **SEO Score** | ${getVal(oldRes, 'scores.seo')} / 100 | ${getVal(cfRes, 'scores.seo')} / 100 | ${getVal(customRes, 'scores.seo')} / 100 |\n`;
    md += `| --- | | | |\n`;
    md += `| **First Contentful Paint (FCP)** | ${getVal(oldRes, 'metrics.fcp.displayValue')} | ${getVal(cfRes, 'metrics.fcp.displayValue')} | ${getVal(customRes, 'metrics.fcp.displayValue')} |\n`;
    md += `| **Largest Contentful Paint (LCP)** | ${getVal(oldRes, 'metrics.lcp.displayValue')} | ${getVal(cfRes, 'metrics.lcp.displayValue')} | ${getVal(customRes, 'metrics.lcp.displayValue')} |\n`;
    md += `| **Total Blocking Time (TBT)** | ${getVal(oldRes, 'metrics.tbt.displayValue')} | ${getVal(cfRes, 'metrics.tbt.displayValue')} | ${getVal(customRes, 'metrics.tbt.displayValue')} |\n`;
    md += `| **Cumulative Layout Shift (CLS)** | ${getVal(oldRes, 'metrics.cls.displayValue')} | ${getVal(cfRes, 'metrics.cls.displayValue')} | ${getVal(customRes, 'metrics.cls.displayValue')} |\n`;
    md += `| **Speed Index** | ${getVal(oldRes, 'metrics.speedIndex.displayValue')} | ${getVal(cfRes, 'metrics.speedIndex.displayValue')} | ${getVal(customRes, 'metrics.speedIndex.displayValue')} |\n`;
    md += `| **Time to Interactive (TTI)** | ${getVal(oldRes, 'metrics.tti.displayValue')} | ${getVal(cfRes, 'metrics.tti.displayValue')} | ${getVal(customRes, 'metrics.tti.displayValue')} |\n\n`;
  }

  const mdPath = path.join(__dirname, '..', 'docs', 'pagespeed_comparison.md');
  fs.writeFileSync(mdPath, md);
  console.log(`Markdown report written to: ${mdPath}`);
  console.log('\nReport summary:\n');
  console.log(md);
}

run().catch(err => {
  console.error('Execution error:', err);
});
