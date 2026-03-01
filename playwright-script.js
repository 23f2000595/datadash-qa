const { chromium } = require('playwright');

async function calculateSumForSeed(seed) {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
        const url = `https://datadash-one.vercel.app/seed/${seed}`;
        console.log(`\n🔍 Processing Seed ${seed} - ${url}`);
        
        // Navigate with longer timeout
        await page.goto(url, { timeout: 30000, waitUntil: 'networkidle' });
        
        // Wait for any table or content to load with longer timeout
        try {
            await page.waitForSelector('table', { timeout: 10000 });
        } catch (e) {
            console.log(`⚠️ No table found for seed ${seed}, checking for other content...`);
            // Take screenshot for debugging
            await page.screenshot({ path: `debug-seed-${seed}.png` });
            
            // Check if page loaded at all
            const bodyText = await page.textContent('body');
            if (bodyText.includes('404') || bodyText.includes('not found')) {
                console.log(`❌ Seed ${seed} page not found (404)`);
                await browser.close();
                return 0;
            }
        }
        
        // Get all tables on the page
        const tables = await page.$$('table');
        let seedTotal = 0;
        
        if (tables.length === 0) {
            console.log(`⚠️ No tables found for seed ${seed}, checking for numbers in page...`);
            // Try to find any numbers in the page body
            const bodyText = await page.textContent('body');
            const numbers = bodyText.match(/-?\d+\.?\d*/g);
            
            if (numbers) {
                numbers.forEach(num => {
                    const value = parseFloat(num);
                    if (!isNaN(value) && value !== 0) {
                        seedTotal += value;
                        console.log(`Found number: ${value}`);
                    }
                });
            }
        } else {
            console.log(`Found ${tables.length} table(s) for seed ${seed}`);
            
            for (const table of tables) {
                const cells = await table.$$('td');
                
                for (const cell of cells) {
                    const text = await cell.textContent();
                    const numbers = text.match(/-?\d+\.?\d*/g);
                    
                    if (numbers) {
                        numbers.forEach(num => {
                            const value = parseFloat(num);
                            if (!isNaN(value)) {
                                seedTotal += value;
                            }
                        });
                    }
                }
            }
        }
        
        console.log(`✅ Seed ${seed} total: ${seedTotal.toFixed(2)}`);
        await browser.close();
        return seedTotal;
        
    } catch (error) {
        console.error(`❌ Error processing seed ${seed}:`, error.message);
        // Take screenshot on error
        try {
            await page.screenshot({ path: `error-seed-${seed}.png` });
        } catch (e) {
            // Ignore screenshot error
        }
        await browser.close();
        return 0;
    }
}

async function main() {
    console.log('🚀 Starting Automated QA for DataDash Reports\n');
    console.log('='.repeat(50));
    
    const seeds = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
    let grandTotal = 0;
    
    for (const seed of seeds) {
        const seedTotal = await calculateSumForSeed(seed);
        grandTotal += seedTotal;
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`📊 GRAND TOTAL OF ALL SEEDS: ${grandTotal.toFixed(2)}`);
    console.log('='.repeat(50));
}

main().catch(console.error);
