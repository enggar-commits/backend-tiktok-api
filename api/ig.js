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
        console.log(`Memproses link IG via mesin Cobalt: ${targetUrl}`);

        // Menggunakan mesin Cobalt API yang jauh lebih tangguh (tanpa perlu API Key)
        const response = await fetch('https://api.cobalt.tools/api/json', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: targetUrl
            })
        });

        const data = await response.json();

        // Cobalt langsung memberikan URL video mentah yang sudah matang
        if (data && data.url) {
            res.status(200).json({
                status: "success",
                url_video: data.url
            });
        } else {
            console.log("Respon kegagalan dari Cobalt:", data);
            res.status(400).json({ status: "error", message: "Sistem gagal mengekstrak video ini. Mungkin dibatasi oleh Instagram." });
        }

    } catch (error) {
        console.error("Error jaringan mesin:", error);
        res.status(500).json({ status: "error", message: "Mesin utama sedang gangguan." });
    }
};