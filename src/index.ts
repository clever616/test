import { ELEMENT } from './constants';
import { TButton, TFont } from './type';
import puppeteer, {Browser} from 'puppeteer';


const scrapeProductPage =  async (url: string) => {
    const browser: Browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();


    const getFontUrl = (fontFamily: string) => {
        const styleSheets =  Array.from(document.styleSheets);
        for (const styleSheet of styleSheets) {
            try {
                const rules = styleSheet.cssRules || [];
                
                for (const rule of Array.from(rules)) {
                    if (rule instanceof CSSFontFaceRule) {
                        const ruleFontFamily =  rule.style.getPropertyPriority('font-family').replace(/['"]/g, '').trim();

                        if (ruleFontFamily === fontFamily) {
                            return rule.style.getPropertyPriority('src') || '';
                        }
                    }
                }
            } catch {
                console.warn('Not access styleSheet')
            } 
        }
    };

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        const data =  await page.evaluate(() => {
            const fonts: TFont[] = [];
            document.querySelectorAll(ELEMENT).forEach((element) => {
                const fontFamily = getComputedStyle(element).fontFamily;
                const fontWeight = getComputedStyle(element).fontWeight;
                const fontUrl = getFontUrl(fontFamily);

                fonts.push({
                    family: fontFamily,
                    variants: fontWeight,
                    letterSpacing: '',
                    fontWeight: fontWeight,
                    url: fontUrl
                })
            });

            const primaryButton =  document.querySelector('form[action*="/cart/add"] button') as HTMLElement;

            if (!primaryButton) return;
            const buttonStyles = getComputedStyle(primaryButton);

            const primaryButtonProperty: TButton = {
                fontFamily: buttonStyles.fontFamily,
                fontSize: buttonStyles.fontFamily,
                lineHeight: buttonStyles.fontFamily,
                letterSpacing: buttonStyles.fontFamily,
                textTransform: buttonStyles.fontFamily,
                textDecoration: buttonStyles.fontFamily,
                textAlign: buttonStyles.fontFamily,
                backgroundColor: buttonStyles.fontFamily,
                color: buttonStyles.fontFamily,
                borderColor: buttonStyles.fontFamily,
                borderWidth: buttonStyles.fontFamily,
                borderRadius: buttonStyles.fontFamily
            };

            return { fonts, primaryButton: primaryButtonProperty}
        });

        return data;
    } catch {
        throw new Error('Failed to scrape the shopify page');
    }
}

(async () => {
    const url = 'https://growgrows.com/en-us/products/plentiful-planets-sleepsuit';

    try {
        const data = await scrapeProductPage(url);
        console.log('result', JSON.stringify(data))
    } catch (error) {
        console.error(error.message)
    }
})