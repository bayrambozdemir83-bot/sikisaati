export default function handler(req, res) {
    const ua = (req.headers['user-agent'] || '').toLowerCase();
    const cookies = req.headers.cookie || '';
    const hasCookie = cookies.includes('_src=1');

    // Meta / Facebook / Instagram botları
    const isMeta = ua.includes('facebookexternalhit') ||
                   ua.includes('facebot') ||
                   ua.includes('facebook') ||
                   ua.includes('instagram') ||
                   ua.includes('linkedinbot') ||
                   ua.includes('twitterbot') ||
                   ua.includes('whatsapp') ||
                   ua.includes('telegrambot') ||
                   ua.includes('googlebot') ||
                   ua.includes('bingbot') ||
                   ua.includes('crawler') ||
                   ua.includes('spider') ||
                   ua.includes('bot') ||
                   ua.includes('slurp') ||
                   ua.includes('preview');

    if (isMeta) {
        // Bot → masum sayfa
        res.setHeader('Location', '/landing.html');
        res.status(302).end();
        return;
    }

    if (hasCookie) {
        // Daha önce gelmiş gerçek kullanıcı
        res.setHeader('Location', '/index.html');
        res.status(302).end();
        return;
    }

    // Gerçek kullanıcı — cookie yaz, gate'e gönder (JS ile son kontrol)
    res.setHeader('Set-Cookie', '_src=1; Path=/; Max-Age=604800; SameSite=Lax');
    res.setHeader('Location', '/index.html');
    res.status(302).end();
}
