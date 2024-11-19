const express = require('express');
const { exec } = require('child_process');
const app = express();

app.use(express.json());

app.post('/payload', (req, res) => {
  const payload = req.body;

  // Verifica que el evento sea un push
  if (payload.ref === 'refs/heads/main') { // Cambia 'main' por la rama que usas
    exec('cd /home/ubuntu/SarpanBot && git pull', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error ejecutando git pull: ${error}`);
        return res.sendStatus(500);
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
      res.sendStatus(200);
    });
  } else {
    res.sendStatus(200);
  }
});

app.listen(3000, () => {
  console.log('Servidor escuchando en el puerto 3000');
});