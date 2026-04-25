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
        // ==========================================
        // ALGORITMA PEMBERSIH URL (ANTI-PELACAK)
        // Membuang kode seperti ?igsh=... agar API tidak bingung
        // ==========================================
        let cleanUrl = targetUrl;
        try {
            const urlObj = new URL(targetUrl);
            cleanUrl = urlObj.origin + urlObj.pathname; // Hanya mengambil https://www.instagram.com/reel/ID/
        } catch (e) {
            console.log("Format URL tidak standar, menggunakan URL asli.");
        }

        console.log(`Memproses link IG Bersih: ${cleanUrl}`);

        const apiKey = "6c46502debmshbc49b6994b7a613p160159jsna8424ea66fa6";
        const apiHost = "instagram-reels-downloader-api.p.rapidapi.com";

        const apiUrl = `https://${apiHost}/download?url=${encodeURIComponent(cleanUrl)}`;

        const fetchResponse = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': apiKey,
                'x-rapidapi-host': apiHost
            }
        });

        const apiData = await fetchResponse.json();

        // ALGORITMA PENCARI VIDEO PINTAR
        let videoUrlAsli = null;

        if (apiData.data && apiData.data.video_url) videoUrlAsli = apiData.data.video_url;
        else if (apiData.data && apiData.data.videoUrl) videoUrlAsli = apiData.data.videoUrl;
        else if (apiData.video_url) videoUrlAsli = apiData.video_url;
        else if (apiData.videoUrl) videoUrlAsli = apiData.videoUrl;
        else if (apiData.data && apiData.data.download_url) videoUrlAsli = apiData.data.download_url;

        if (!videoUrlAsli) {
            JSON.stringify(apiData, (key, value) => {
                if (!videoUrlAsli && typeof value === 'string' && value.includes('.mp4')) {
                    videoUrlAsli = value;
                }
                return value;
            });
        }

        if (videoUrlAsli) {
            res.status(200).json({
                status: "success",
                url_video: videoUrlAsli
            });
        } else {
            console.log("Format gagal dilacak:", apiData);
            res.status(400).json({ status: "error", message: "Video tidak ditemukan. Pastikan akun tidak di-private." });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Gagal menghubungi server Instagram." });
    }
};