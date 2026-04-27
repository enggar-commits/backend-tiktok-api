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
        console.log(`Memulai perburuan di server segar: ${cleanUrl}`);

        // DAFTAR SERVER API TERBARU (Update)
        // Menggunakan kombinasi server yang jarang dilacak oleh Instagram
        const apis = [
            `https://api.agatz.my.id/api/igdl?url=${encodeURIComponent(cleanUrl)}`,
            `https://api.nyxs.pw/dl/ig?url=${encodeURIComponent(cleanUrl)}`,
            `https://bk9.fun/download/instagram?url=${encodeURIComponent(cleanUrl)}`,
            `https://delirius-apiofc.vercel.app/download/igdl?url=${encodeURIComponent(cleanUrl)}`
        ];

        let videoUrlAsli = null;

        for (let i = 0; i < apis.length; i++) {
            try {
                console.log(`[+] Mengetuk Server ${i + 1}...`);

                const response = await fetch(apis[i], {
                    method: 'GET',
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
                    }
                });

                // Jika server merespon dengan error (misal 403/500), lewati langsung
                if (!response.ok) continue;

                const data = await response.json();

                // Algoritma Sapu Bersih (Mencari file berakhiran .mp4 di seluruh tumpukan data)
                let tempUrl = null;
                JSON.stringify(data, (key, value) => {
                    if (!tempUrl && typeof value === 'string' && value.startsWith('http') && value.includes('.mp4')) {
                        tempUrl = value;
                    }
                    return value;
                });

                if (tempUrl) {
                    videoUrlAsli = tempUrl;
                    console.log(`✅ Tembus di Server ${i + 1}!`);
                    break;
                }
            } catch (err) {
                console.log(`❌ Server ${i + 1} Error/Timeout. Melompat ke server selanjutnya...`);
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
                message: "Semua jalur gratis diblokir sementara oleh Instagram. Coba beberapa jam lagi."
            });
        }

    } catch (error) {
        console.error("Kesalahan fatal Vercel:", error);
        res.status(500).json({ status: "error", message: "Sistem pusat mengalami gangguan." });
    }
};