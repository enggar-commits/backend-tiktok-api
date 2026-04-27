module.exports = async (req, res) => {
    // Membuka gerbang CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ status: "error", message: "Metode tidak diizinkan" });

    const targetUrl = req.body.url;
    if (!targetUrl) return res.status(400).json({ status: "error", message: "URL kosong" });

    let debugLog = "Tidak ada respon dari server.";

    try {
        const cleanUrl = targetUrl.split('?')[0];
        let videoUrlAsli = null;

        // Kita langsung interogasi RapidAPI (Jalur Privat Anda)
        try {
            const rapidApiKey = "6c46502debmshbc49b6994b7a613p160159jsna8424ea66fa6";
            const rapidApiHost = "instagram-reels-downloader-api.p.rapidapi.com";
            const rapidApiUrl = `https://${rapidApiHost}/download?url=${encodeURIComponent(cleanUrl)}`;

            const rapidResponse = await fetch(rapidApiUrl, {
                method: 'GET',
                headers: {
                    'x-rapidapi-key': rapidApiKey,
                    'x-rapidapi-host': rapidApiHost
                }
            });

            // Tangkap data mentahnya
            const rapidData = await rapidResponse.json();

            // Simpan data mentah ini sebagai barang bukti
            debugLog = JSON.stringify(rapidData);

            // Coba ekstrak link video dengan aturan yang lebih longgar
            if (rapidData.video_url) videoUrlAsli = rapidData.video_url;
            else if (rapidData.data && rapidData.data.video_url) videoUrlAsli = rapidData.data.video_url;
            else {
                JSON.stringify(rapidData, (key, value) => {
                    // Instagram sering menyembunyikan link di server 'scontent' tanpa akhiran .mp4
                    if (!videoUrlAsli && typeof value === 'string' && value.startsWith('http') && (value.includes('.mp4') || value.includes('scontent'))) {
                        videoUrlAsli = value;
                    }
                    return value;
                });
            }
        } catch (err) {
            debugLog = "Error Sistem RapidAPI: " + err.message;
        }

        // Keputusan Akhir
        if (videoUrlAsli) {
            res.status(200).json({ status: "success", url_video: videoUrlAsli });
        } else {
            // TAMPILKAN BUKTI KE LAYAR HTML ANDA
            res.status(400).json({
                status: "error",
                message: `DEBUG: ${debugLog.substring(0, 180)}...`
            });
        }

    } catch (error) {
        res.status(500).json({ status: "error", message: "Server Vercel gangguan." });
    }
};