import https from 'https';

async function testUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      console.log(`URL: ${url}`);
      console.log(`Status: ${res.statusCode} ${res.statusMessage}`);
      console.log(`Content-Type: ${res.headers['content-type']}`);
      console.log(`Content-Length: ${res.headers['content-length']}`);
      resolve(res.statusCode);
    }).on('error', (err) => {
      console.log(`Error: ${err.message}`);
      resolve(500);
    });
  });
}

async function main() {
  console.log('--- Testing build91-portfolio-assets ---');
  await testUrl('https://build91-portfolio-assets.s3.us-east-1.amazonaws.com/portfolio/amenities/Gym_2.png');
  
  console.log('\n--- Testing SST bucket ---');
  await testUrl('https://build91-studio-prod-portfoliobucketbucket-bsmmcecr.s3.us-east-1.amazonaws.com/portfolio/interiors/render_01-hero.jpeg');
}

main();
