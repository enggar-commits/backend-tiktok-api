module.exports = async (req, res) => {
    // Membuka gerbang CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ status: "error", message: "Metode tidak diizinkan" });

    const targetUrl = req.body.url;
    if (!targetUrl) return res.status(400).json({ status: "error", message: "URL kosong" });

    try {
        // Membersihkan link dari kode pelacak
        const cleanUrl = targetUrl.split('?')[0];

        // Data dari API "Reels Downloader - Insta..." yang baru Anda pilih
        const rapidApiKey = "6c46502debmshbc49b6994b7a613p160159jsna8424ea66fa6";
        const rapidApiHost = "instagram-downloader-download-instagram-videos-stories.p.rapidapi.com";
        const rapidApiUrl = `https://${rapidApiHost}/unified/url?url=${encodeURIComponent(cleanUrl)}`;

        const rapidResponse = await fetch(rapidApiUrl, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': rapidApiKey,
                'x-rapidapi-host': rapidApiHost,
                // Tambahan User-Agent agar tidak dicurigai
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const rapidData = await rapidResponse.json();
        let videoUrlAsli = null;

        // Mesin Ekstraktor Otomatis (Mencari link .mp4 di tumpukan data baru)
        JSON.stringify(rapidData, (key, value) => {
            if (!videoUrlAsli && typeof value === 'string' && value.startsWith('http') && value.includes('.mp4')) {
                videoUrlAsli = value;
            }
            return value;
        });

        // Hasil Akhir
        if (videoUrlAsli) {
            res.status(200).json({
                status: "success",
                url_video: videoUrlAsli
            });
        } else {
            // Jika gagal, tampilkan pesan asli dari API barunya agar kita tahu masalahnya
            res.status(400).json({
                status: "error",
                message: `Video tidak ditemukan. Respon API: ${JSON.stringify(rapidData).substring(0, 150)}...`
            });
        }

    } catch (error) {
        res.status(500).json({ status: "error", message: "Gagal menyambung ke server RapidAPI: " + error.message });
    }
};