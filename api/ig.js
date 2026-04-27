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
        console.log(`Memulai operasi Hybrid untuk: ${cleanUrl}`);

        let videoUrlAsli = null;
        const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

        // ==========================================
        // TAHAP 1: MENCOBA JALUR API GRATIS TERBARU
        // ==========================================
        const freeApis = [
            `https://api.joshweb.click/api/ig?url=${encodeURIComponent(cleanUrl)}`,
            `https://api.vreden.web.id/api/igdownload?url=${encodeURIComponent(cleanUrl)}`
        ];

        for (let i = 0; i < freeApis.length; i++) {
            try {
                console.log(`[+] Mengetuk Jalur Gratis ${i + 1}...`);
                const response = await fetch(freeApis[i], {
                    method: 'GET',
                    headers: { 'User-Agent': userAgent }
                });

                if (response.ok) {
                    const data = await response.json();
                    let tempUrl = null;

                    // Ekstraktor Ekstrim
                    JSON.stringify(data, (key, value) => {
                        if (!tempUrl && typeof value === 'string' && value.startsWith('http') && value.includes('.mp4')) {
                            tempUrl = value;
                        }
                        return value;
                    });

                    if (tempUrl) {
                        videoUrlAsli = tempUrl;
                        console.log(`✅ Tembus di Jalur Gratis ${i + 1}!`);
                        break;
                    }
                }
            } catch (err) {
                console.log(`❌ Jalur Gratis ${i + 1} Gagal.`);
            }
        }

        // ==========================================
        // TAHAP 2: JALUR PRIVAT (RAPIDAPI) SEBAGAI CADANGAN
        // ==========================================
        if (!videoUrlAsli) {
            console.log(`⚠️ Semua jalur gratis gagal. Mengaktifkan RapidAPI...`);
            try {
                // Menggunakan Kunci Rahasia yang Anda dapatkan sebelumnya
                const rapidApiKey = "6c46502debmshbc49b6994b7a613p160159jsna8424ea66fa6";
                const rapidApiHost = "instagram-reels-downloader-api.p.rapidapi.com";
                const rapidApiUrl = `https://${rapidApiHost}/download?url=${encodeURIComponent(cleanUrl)}`;

                const rapidResponse = await fetch(rapidApiUrl, {
                    method: 'GET',
                    headers: {
                        'x-rapidapi-key': rapidApiKey,
                        'x-rapidapi-host': rapidApiHost,
                        'User-Agent': userAgent
                    }
                });

                if (rapidResponse.ok) {
                    const rapidData = await rapidResponse.json();

                    // Ekstraktor untuk RapidAPI
                    JSON.stringify(rapidData, (key, value) => {
                        if (!videoUrlAsli && typeof value === 'string' && value.startsWith('http') && value.includes('.mp4')) {
                            videoUrlAsli = value;
                        }
                        return value;
                    });

                    if (videoUrlAsli) {
                        console.log(`✅ Tembus menggunakan RapidAPI!`);
                    }
                }
            } catch (err) {
                console.log(`❌ RapidAPI juga gagal atau kuota habis.`);
            }
        }

        // ==========================================
        // HASIL AKHIR
        // ==========================================
        if (videoUrlAsli) {
            res.status(200).json({
                status: "success",
                url_video: videoUrlAsli
            });
        } else {
            res.status(400).json({
                status: "error",
                message: "Keamanan Instagram memblokir tarikan ini. Pastikan link adalah Reels publik, atau coba lagi besok."
            });
        }

    } catch (error) {
        console.error("Kesalahan fatal Vercel:", error);
        res.status(500).json({ status: "error", message: "Sistem pusat mengalami gangguan." });
    }
};