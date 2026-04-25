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
        // Membersihkan link dari parameter pelacak
        const cleanUrl = targetUrl.split('?')[0];
        console.log(`Memulai perburuan video: ${cleanUrl}`);

        // DAFTAR 4 SERVER PENEMBUS INSTAGRAM (Sistem Cadangan)
        const apis = [
            `https://api.siputzx.my.id/api/d/igdl?url=${encodeURIComponent(cleanUrl)}`,
            `https://aemt.me/download/igdl?url=${encodeURIComponent(cleanUrl)}`,
            `https://bk9.fun/download/instagram?url=${encodeURIComponent(cleanUrl)}`,
            `https://api.ryzendesu.vip/api/downloader/igdl?url=${encodeURIComponent(cleanUrl)}`
        ];

        let videoUrlAsli = null;

        // Mesin akan mencoba server satu per satu
        for (let i = 0; i < apis.length; i++) {
            try {
                console.log(`[+] Mencoba Server ${i + 1}...`);
                const response = await fetch(apis[i]);
                const data = await response.json();

                // Mencari letak link MP4 dari tumpukan data server
                let tempUrl = null;
                if (data && data.data && data.data[0] && data.data[0].url) tempUrl = data.data[0].url;
                else if (data && data.url) tempUrl = data.url;
                else {
                    // Sapu bersih cari link mp4
                    JSON.stringify(data, (key, value) => {
                        if (!tempUrl && typeof value === 'string' && value.startsWith('http') && value.includes('.mp4')) {
                            tempUrl = value;
                        }
                        return value;
                    });
                }

                if (tempUrl) {
                    videoUrlAsli = tempUrl;
                    console.log(`✅ Berhasil ditembus oleh Server ${i + 1}!`);
                    break; // Berhenti mencari jika video sudah ketemu
                }
            } catch (err) {
                console.log(`❌ Server ${i + 1} Gagal/Down. Beralih ke server berikutnya...`);
                // Biarkan error, loop akan otomatis lanjut ke server berikutnya
            }
        }

        // Hasil Akhir
        if (videoUrlAsli) {
            res.status(200).json({
                status: "success",
                url_video: videoUrlAsli
            });
        } else {
            res.status(400).json({
                status: "error",
                message: "Semua server API saat ini sedang sibuk/down. Coba lagi dalam beberapa menit."
            });
        }

    } catch (error) {
        console.error("Kesalahan sistem utama:", error);
        res.status(500).json({ status: "error", message: "Sistem pusat Vercel mengalami gangguan." });
    }
};