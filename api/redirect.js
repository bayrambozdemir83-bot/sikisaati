export default function handler(req, res) {
    const { r, fbclid, utm_source, gclid } = req.query;
    const validTokens = ['tg', 'fb', 'ig', 'tt'];
    const cookies = req.headers.cookie || '';
    const hasCookie = cookies.includes('_src=1');

    const hasAdParam = fbclid || gclid || utm_source;
    const hasToken = r && validTokens.includes(r);

    if (hasToken || hasAdParam) {
        res.setHeader('Set-Cookie', '_src=1; Path=/; Max-Age=604800; SameSite=Lax');
        res.setHeader('Location', '/index.html');
        res.status(302).end();
    } else if (hasCookie) {
        res.setHeader('Location', '/index.html');
        res.status(302).end();
    } else {
        res.setHeader('Location', '/gate.html');
        res.status(302).end();
    }
}
