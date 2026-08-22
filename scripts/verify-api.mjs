async function test() {
  const res = await fetch('https://studio.build91.in/api/portfolio?bypassCache=true');
  const data = await res.json();
  console.log('--- API PORTFOLIO RESPONSE FROM studio.build91.in ---');
  for (const [k, v] of Object.entries(data)) {
    console.log(`\n📁 Category: "${k}" (Total images: ${v.images?.length})`);
    console.log(`   Hero Image: ${v.heroImage}`);
    console.log(`   Sample images:`, v.images?.slice(0, 4));
  }
}
test().catch(console.error);
