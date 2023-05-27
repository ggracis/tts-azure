const http = require("http");
const fs = require("fs");
const sdk = require("microsoft-cognitiveservices-speech-sdk");
const MAX_CHARS_PER_FRAGMENT = 5000;

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/") {
    // Serve the HTML file
    fs.readFile("index.html", (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end("Error al cargar el archivo HTML");
      } else {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(data);
      }
    });
  } else if (req.method === "POST" && req.url === "/procesar-texto") {
    // Process the text and return the result
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    const url = require("url");
    const querystring = require("querystring");
    req.on("end", () => {
      const bodyParams = querystring.parse(body);
      const text = bodyParams.text;
      console.log("Texto recibido:", text);

      const speechConfig = sdk.SpeechConfig.fromSubscription(
        process.env.SPEECH_KEY,
        process.env.SPEECH_REGION
      );
      speechConfig.speechSynthesisVoiceName = "es-AR-ElenaNeural";

      let startIndex = 0;
      let fragmentIndex = 1;

      while (startIndex < text.length) {
        const fragment = text.substr(startIndex, MAX_CHARS_PER_FRAGMENT);
        const audioFile = `audio-${fragmentIndex}.wav`;
        const audioConfig = sdk.AudioConfig.fromAudioFileOutput(audioFile);

        let synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

        synthesizer.speakTextAsync(
          fragment,
          function (result) {
            if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
              console.log(`Audio ${audioFile} generado`);
            } else {
              console.error(
                "Audio cancelado, " +
                  result.errorDetails +
                  "\n Configuraste bien las variables de entorno?"
              );
            }
            synthesizer.close();
            synthesizer = null;
          },
          function (err) {
            console.trace("err - " + err);
            synthesizer.close();
            synthesizer = null;
          }
        );

        startIndex += MAX_CHARS_PER_FRAGMENT;
        fragmentIndex++;
      }

      const ffmpeg = require("ffmpeg");

      // Unir los archivos .wav
      const command = new ffmpeg();
      for (let i = 1; i < fragmentIndex; i++) {
        command.input(`audio-${i}.wav`);
      }
      command
        .mergeToFile("audio-combinado.wav", "./")
        .on("error", function (err) {
          console.log("Error al unir los archivos .wav: " + err.message);
        })
        .on("end", function () {
          console.log("Archivos .wav unidos correctamente");
          // Convertir el archivo .wav en .mp3
          ffmpeg("audio-combinado.wav")
            .toFormat("mp3")
            .save("audio-final.mp3")
            .on("error", function (err) {
              console.log(
                "Error al convertir el archivo .wav en .mp3: " + err.message
              );
            })
            .on("end", function () {
              const file = fs.createReadStream("audio-final.mp3");
              res.writeHead(200, {
                "Content-Type": "audio/mpeg",
                "Content-Disposition": "attachment; filename=audio-final.mp3",
              });
              file.pipe(res);
              console.log("Archivo .mp3 generado correctamente");
            });
        });
    });
  } else {
    // Serve a 404 page for all other requests
    res.writeHead(404);
    res.end("Página no encontrada");
  }
});

server.listen(3000, () => {
  console.log("El servidor está escuchando en el puerto 3000");
});
