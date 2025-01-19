import {chromium} from 'playwright'
import yargs from 'yargs'
import {hideBin} from 'yargs/helpers'

let logId = '-'

const getProductFromPage = async (url: string): Promise<any> => {
  log(`getProductFromPage`)
  const browser = await chromium.launch({
    args: [
      // '--no-sandbox',
      // '--disable-dev-shm-usage',
      // '--disable-gpu',
      // '--single-process',
      // '--disable-setuid-sandbox',
      // '--proxy-server=https://proxy-server.scraperapi.com:8001',
    ],
    headless: false,
  })

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
    javaScriptEnabled: true,
    // httpCredentials: {
    //   username: 'scraperapi',
    //   password: 'c1c9977f13cfd664732e2302ef6ebb7b'
    // },
  });

  // Set the navigator.webdriver to false
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false,
    });
  });

  const page = await context.newPage();
  await page.setExtraHTTPHeaders({
    'Referer': 'http://www.asics.com',
    'Origin': 'http://www.asics.com',
  });
  // await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36');
  await page.goto(url, {
    waitUntil: 'networkidle', // Wait until network is idle to ensure the page is fully loaded
    timeout: 180000
  });

  // const wholePageText = await page.evaluate(() => document.body.innerText);
  // console.log(`getProductFromPage - wholePageText: ${wholePageText}`)

  const productName = await page.evaluate(() => document.querySelector<HTMLElement>('.pdp-top__product-name')?.innerText.trim())
  const color = await page.evaluate(() => document.querySelector<HTMLElement>('.variants__header--light[data-automation="color"]')?.innerText.trim())
  const imageUrls = await page.evaluate(() => Array.from(document.querySelectorAll<HTMLImageElement>('img.primary-image'))
    .map(i => i.dataset.src || i.src)
    .filter(s => s)
    .map(s => s.replace('sfcc-product', 'zoom')))

  log(`getProductFromPage - -------------`)
  log(`getProductFromPage - url:     `, url)
  log(`getProductFromPage - names:   `, productName)
  log(`getProductFromPage - images:  `, imageUrls.length);
  log(`getProductFromPage - color:   `, color);
  log(`getProductFromPage - -------------`)

  // Close the browser
  await browser.close();

  return {
    name: productName,
    color: color,
    photos: imageUrls
  }
}

const getProductFromPageScraperApi = async (key: string, url: string) => {
  const response = await fetch(`https://api.scraperapi.com/?api_key=${key}&url=${url}`)
  log(`getProductFromPageScraperApi - response: `, response)
}

const getArgs = async () => {
  return yargs(hideBin(process.argv))
    .option('url', {type: 'string', demandOption: true, description: 'Url of the sneaker page'})
    .option('log-id', {type: 'string', demandOption: true, description: 'Id of the logs for the search purposes'})
    .help()
    .argv;
}

const log = (message: string, object?: any) => {
  if (object) {
    console.log(logId, message, object)
  } else {
    console.log(logId, message)
  }
}

const main = async () => {
  try {
    log(`main`)
    log(`main - getting args...`)
    const args = await getArgs()
    logId = args.logId
    const url = args.url
    log(`main - logId: `, logId)
    log(`main - url:   `, url)

    log(`main - getting product...`)
    const product = await getProductFromPage(url)
    log(`main - product`, product)
  } catch (e) {
    log(`main - error: ${e}`)
  }
}

main()
