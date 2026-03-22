const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const app = express();

app.use(express.json());

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { args: ['--no-sandbox'] }
});

// 1. Generar QR en la consola para conectar
client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
    console.log('Escanea este QR en tu App Web o Consola');
});

client.on('ready', () => {
    console.log('¡WhatsApp conectado exitosamente!');
});

// 2. Ruta para recibir datos de Google Sheets
app.post('/enviar-mensaje', async (req, res) => {
    const { telefono, mensaje, urlArchivo, nombreArchivo } = req.body;
    
    try {
        const idVoz = `${telefono}@c.us`;
        
        // Si hay un archivo (PDF/Imagen)
        if (urlArchivo) {
            const media = await MessageMedia.fromUrl(urlArchivo);
            await client.sendMessage(idVoz, media, { caption: mensaje });
        } else {
            await client.sendMessage(idVoz, mensaje);
        }
        
        res.status(200).json({ status: 'Enviado con éxito' });
    } catch (error) {
        res.status(500).json({ error: 'Error al enviar', detalle: error.message });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor corriendo en puerto ${port}`);
    client.initialize();
});
