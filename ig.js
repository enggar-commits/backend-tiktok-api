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

        // --- SIMULASI SEMENTARA ---
        // Nanti di sini kita akan menaruh kode API RapidAPI untuk Instagram

        // Jeda 1.5 detik seolah-olah sedang mengambil data dari Instagram
        await new Promise(resolve => setTimeout(resolve, 1500));

        res.status(200).json({
            status: "success",
            // Video simulasi kelinci animasi seperti kemarin
            url_video: "https://www.w3schools.com/html/mov_bbb.mp4"
        });

    } catch (error) {
        res.status(500).json({ status: "error", message: "Gagal menghubungi server." });
    }
};