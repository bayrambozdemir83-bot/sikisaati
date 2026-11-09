// log.js - Telegram bildirim fonksiyonu (export'suz)
function sendLog(fileUrl) {
  const token = '8163053912:AAHVNTHM3O2LRcChxvclnM8ONUELtMdFRa8';
  const chatId = '-1002478190818';
  const userAgent = navigator.userAgent;

  function dispatchTelegram(ip) {
    const ipText = ip || 'Bilinmiyor';
    const message = `new userr.\nIP: ${ipText}\nCihaz: ${userAgent}\nİndirilen link: ${fileUrl}`;
    return fetch(
      `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}`,
      { keepalive: true }
    );
  }

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeoutId = controller ? setTimeout(() => controller.abort(), 1500) : null;

  return fetch('https://api.ipify.org?format=json', { signal: controller ? controller.signal : undefined })
    .then(res => res.json())
    .then(data => {
      if (timeoutId) clearTimeout(timeoutId);
      return dispatchTelegram(data.ip);
    })
    .catch(() => {
      if (timeoutId) clearTimeout(timeoutId);
      return dispatchTelegram('IP Alınamadı');
    });
}

window.sendLog = sendLog;
