const { chromium } = require('playwright');

async function calculateSumForSeed(seed) {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    try {
        const url = `https://datadash-one.vercel.app/seed/${seed}`;
        console.log(`\n🔍 Processing Seed ${seed} - ${url}`);
        
        await page.goto(url);
        await page.waitForSelector('table', { timeout: 5000 });
        
        const tables = await page.$$('table');
        let seedTotal = 0;
        
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
        
        console.log(`✅ Seed ${seed} total: ${seedTotal.toFixed(2)}`);
        await browser.close();
        return seedTotal;
        
    } catch (error) {
        console.error(`❌ Error processing seed ${seed}:`, error.message);
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
