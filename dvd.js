const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// İndirilen videolar için geçici bir klasör
const downloadDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir);
}

// Video indirme isteğini işleme
app.post('/download', (req, res) => {
    const videoUrl = req.body.url;
    if (!videoUrl) {
        return res.status(400).send('Video URL is required');
    }

    const fileName = `video_${Date.now()}.mp4`;
    const outputPath = path.join(downloadDir, fileName);

    // `yt-dlp` komutunu çalıştırma
    const command = `yt-dlp -o "${outputPath}" ${videoUrl}`;
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error downloading video: ${error.message}`);
            return res.status(500).send('Failed to download video');
        }

        console.log(`Video downloaded: ${outputPath}`);
        res.download(outputPath, fileName, (err) => {
            if (err) {
                console.error(`Error sending file: ${err.message}`);
            }

            // Dosyayı kullanıcıya gönderdikten sonra sil
            fs.unlink(outputPath, (err) => {
                if (err) {
                    console.error(`Error deleting file: ${err.message}`);
                }
            });
        });
    });
});

// Sunucu başlatma
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
