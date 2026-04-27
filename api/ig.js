module.exports = async (req, res) => {
    // Membuka gerbang CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ status: "error", message: "Metode tidak diizinkan" });
    }

    const targetUrl = req.body.url;
    if (!targetUrl) {
        return res.status(400).json({ status: "error", message: "URL IG tidak boleh kosong" });
    }

    try {
        const cleanUrl = targetUrl.split('?')[0];
        console.log(`Memulai perburuan dengan penyamaran: ${cleanUrl}`);

        // Daftar Server API Publik
        const apis = [
            `https://api.vreden.web.id/api/igdownload?url=${encodeURIComponent(cleanUrl)}`,
            `https://widipe.com/download/igdl?url=${encodeURIComponent(cleanUrl)}`,
            `https://api.siputzx.my.id/api/d/igdl?url=${encodeURIComponent(cleanUrl)}`,
            `https://api.ryzendesu.vip/api/downloader/igdl?url=${encodeURIComponent(cleanUrl)}`
        ];

        let videoUrlAsli = null;

        for (let i = 0; i < apis.length; i++) {
            try {
                console.log(`[+] Mengetuk Server ${i + 1} dengan topeng Chrome...`);

                // INI KUNCI RAHASIANYA: Menyamar sebagai manusia (Google Chrome Windows)
                const response = await fetch(apis[i], {
                    method: 'GET',
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                        'Accept': 'application/json, text/plain, */*'
                    }
                });

                if (!response.ok) throw new Error(`Ditolak oleh server (Status: ${response.status})`);

                const rawText = await response.text();
                const data = JSON.parse(rawText);

                // Mencari letak link MP4
                let tempUrl = null;
                if (data && data.data && data.data[0] && data.data[0].url) tempUrl = data.data[0].url;
                else if (data && data.data && data.data.url) tempUrl = data.data.url;
                else if (data && data.url) tempUrl = data.url;
                else {
                    JSON.stringify(data, (key, value) => {
                        if (!tempUrl && typeof value === 'string' && value.startsWith('http') && value.includes('.mp4')) {
                            tempUrl = value;
                        }
                        return value;
                    });
                }

                if (tempUrl) {
                    videoUrlAsli = tempUrl;
                    console.log(`✅ Tembus di Server ${i + 1}!`);
                    break; // Selesai, langsung keluar dari loop
                }
            } catch (err) {
                console.log(`❌ Server ${i + 1} Gagal (${err.message}). Lanjut ke server berikutnya...`);
            }
        }

        if (videoUrlAsli) {
            res.status(200).json({
                status: "success",
                url_video: videoUrlAsli
            });
        } else {
            res.status(400).json({
                status: "error",
                message: "Keamanan Instagram memblokir tarikan ini. Pastikan link adalah Reels publik."
            });
        }

    } catch (error) {
        console.error("Kesalahan fatal Vercel:", error);
        res.status(500).json({ status: "error", message: "Sistem pusat mengalami gangguan." });
    }
};