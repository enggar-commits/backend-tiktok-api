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
        console.log(`Memproses link IG: ${targetUrl}`);

        // Data langsung diambil dari screenshot RapidAPI Anda
        const apiKey = "6c46502debmshbc49b6994b7a613p160159jsna8424ea66fa6";
        const apiHost = "instagram-reels-downloader-api.p.rapidapi.com";

        // URL sesuai dengan format di screenshot (menggunakan /download?url=)
        const apiUrl = `https://${apiHost}/download?url=${encodeURIComponent(targetUrl)}`;

        const fetchResponse = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': apiKey,
                'x-rapidapi-host': apiHost
            }
        });

        const apiData = await fetchResponse.json();

        // Mencari letak link video mp4 di dalam balasan API
        let videoUrlAsli = null;

        if (apiData.video_url) {
            videoUrlAsli = apiData.video_url;
        } else if (apiData.data && apiData.data.video_url) {
            videoUrlAsli = apiData.data.video_url;
        } else if (apiData.url) {
            videoUrlAsli = apiData.url;
        } else if (apiData.data && apiData.data.url) {
            videoUrlAsli = apiData.data.url;
        } else if (Array.isArray(apiData) && apiData[0].url) {
            videoUrlAsli = apiData[0].url;
        }

        if (videoUrlAsli) {
            res.status(200).json({
                status: "success",
                url_video: videoUrlAsli
            });
        } else {
            console.log("Format data dari API tidak dikenali:", apiData);
            res.status(400).json({ status: "error", message: "Video tidak ditemukan, akun di-private, atau format salah." });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Gagal menghubungi server Instagram." });
    }
};