const express = require('express');
const { exec } = require('child_process');
const app = express();

app.use(express.json());

app.post('/payload', (req, res) => {
  const payload = req.body;
  console.log('Solicitud recibida:', payload);

  // Ejecuta git pull para cualquier evento push
  console.log('Evento push detectado. Ejecutando git pull...');
  exec('cd /home/ubuntu/SarpanBot && git pull', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error ejecutando git pull: ${error}`);
      return res.sendStatus(500);
    }
    console.log(`git pull ejecutado con éxito. stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
    res.sendStatus(200);
  });
});

app.listen(3000, () => {
  console.log('Servidor escuchando en el puerto 3000');
});

// Webhook Test3