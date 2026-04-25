module.exports = async (req, res) => {
    // Membuka jalur komunikasi (CORS) bawaan Vercel
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Menangani izin awal dari browser
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Memastikan hanya menerima perintah POST dari form HTML Anda
    if (req.method !== 'POST') {
        return res.status(405).json({ status: "error", message: "Metode tidak diizinkan" });
    }

    const targetUrl = req.body.url;
    if (!targetUrl) {
        return res.status(400).json({ status: "error", message: "URL tidak boleh kosong" });
    }

    try {
        // Menghubungi API TikWM secara rahasia di belakang layar
        const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(targetUrl)}!`;
        const fetchResponse = await fetch(apiUrl);
        const apiData = await fetchResponse.json();

        if (apiData.code === 0) {
            res.status(200).json({
                status: "success",
                url_video_no_watermark: apiData.data.play,
                url_audio: apiData.data.music
            });
        } else {
            res.status(400).json({ status: "error", message: "Video tidak ditemukan, diprivate, atau link salah." });
        }
    } catch (error) {
        res.status(500).json({ status: "error", message: "Gagal menghubungi server pusat." });
    }
};