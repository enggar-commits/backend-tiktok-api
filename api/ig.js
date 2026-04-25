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
        // 1. Membersihkan link dari parameter pelacak (?igsh=...)
        const cleanUrl = targetUrl.split('?')[0];
        console.log(`Menembus IG dengan link bersih: ${cleanUrl}`);

        // 2. Menggunakan API Publik Indonesia (Spesialis Bot)
        const apiUrl = `https://api.ryzendesu.vip/api/downloader/igdl?url=${encodeURIComponent(cleanUrl)}`;

        const fetchResponse = await fetch(apiUrl);
        const data = await fetchResponse.json();

        let videoUrlAsli = null;

        // 3. Membongkar brankas data dari Ryzen API
        if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
            // Ryzen biasanya menaruh link .mp4 mentah di dalam array 'data'
            videoUrlAsli = data.data[0].url;
        } else if (data && data.url) {
            videoUrlAsli = data.url;
        }

        if (videoUrlAsli) {
            res.status(200).json({
                status: "success",
                url_video: videoUrlAsli
            });
        } else {
            console.log("Respon kegagalan API Lokal:", data);
            res.status(400).json({ status: "error", message: "Gagal menembus keamanan Instagram untuk video ini." });
        }

    } catch (error) {
        console.error("Error jaringan mesin:", error);
        res.status(500).json({ status: "error", message: "Server penghubung sedang sibuk/gangguan." });
    }
};