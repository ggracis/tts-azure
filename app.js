const http = require("http");
const fs = require("fs");
const sdk = require("microsoft-cognitiveservices-speech-sdk");
const MAX_CHARS_PER_FRAGMENT = 5000;
const ffmpeg = require("fluent-ffmpeg");

async function generateAudioFiles(text, speechConfig) {
  let startIndex = 0;
  let fragmentIndex = 1;
  const audioFiles = [];

  while (startIndex < text.length) {
    const fragment = text.substr(startIndex, MAX_CHARS_PER_FRAGMENT);
    const audioFile = `audio-${fragmentIndex}.wav`;
    const audioConfig = sdk.AudioConfig.fromAudioFileOutput(audioFile);

    let synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

    await new Promise((resolve, reject) => {
      synthesizer.speakTextAsync(
        fragment,
        function (result) {
          if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            console.log(`Audio ${audioFile} generado`);
            resolve();
          } else {
            console.error(
              "Audio cancelado, " +
                result.errorDetails +
                "\n Configuraste bien las variables de entorno?"
            );
            reject();
          }
          synthesizer.close();
          synthesizer = null;
        },
        function (err) {
          console.trace("err - " + err);
          synthesizer.close();
          synthesizer = null;
          reject();
        }
      );
    });

    audioFiles.push(audioFile);
    startIndex += MAX_CHARS_PER_FRAGMENT;
    fragmentIndex++;
  }

  return audioFiles;
}

function mergeAndConvertAudioFiles(audioFiles) {
  return new Promise((resolve, reject) => {
    const command = ffmpeg();
    for (const audioFile of audioFiles) {
      command.input(audioFile);
    }
    command
      .mergeToFile("audio-combinado.wav", "./")
      .on("error", function (err) {
        console.log("Error al unir los archivos .wav: " + err.message);
        reject(err);
      })
      .on("end", function () {
        console.log("Archivos .wav unidos correctamente");

        ffmpeg("audio-combinado.wav")
          .toFormat("mp3")
          .save("audio-final.mp3")
          .on("error", function (err) {
            console.log(
              "Error al convertir el archivo .wav en .mp3: " + err.message
            );
            reject(err);
          })
          .on("end", function () {
            console.log("Archivo .mp3 generado correctamente");
            resolve("audio-final.mp3");
          });
      });
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/") {
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
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    const url = require("url");
    const querystring = require("querystring");
    req.on("end", async () => {
      const bodyParams = querystring.parse(body);
      const text = bodyParams.text;
      console.log("Texto recibido:", text);

      const speechConfig = sdk.SpeechConfig.fromSubscription(
        process.env.SPEECH_KEY,
        process.env.SPEECH_REGION
      );
      speechConfig.speechSynthesisVoiceName = "es-AR-ElenaNeural";

      const audioFiles = await generateAudioFiles(text, speechConfig);
      const finalAudioFile = await mergeAndConvertAudioFiles(audioFiles);

      const file = fs.createReadStream(finalAudioFile);
      res.writeHead(200, {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": "attachment; filename=" + finalAudioFile,
      });
      file.pipe(res);
    });
  } else {
    res.writeHead(404);
    res.end("Página no encontrada");
  }
});

server.listen(3000, () => {
  console.log("El servidor está escuchando en el puerto 3000");
});
