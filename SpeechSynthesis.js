(function () {
  "use strict";

  var sdk = require("microsoft-cognitiveservices-speech-sdk");
  var readline = require("readline");

  var audioFile = "YourAudioFile.wav";
  // This example requires environment variables named "SPEECH_KEY" and "SPEECH_REGION"
  const speechConfig = sdk.SpeechConfig.fromSubscription(
    process.env.SPEECH_KEY,
    process.env.SPEECH_REGION
  );
  const audioConfig = sdk.AudioConfig.fromAudioFileOutput(audioFile);

  // The language of the voice that speaks.
  speechConfig.speechSynthesisVoiceName = "es-AR-ElenaNeural";

  // Create the speech synthesizer.
  var synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
    encoding: "utf-8", // Especificar la codificación de caracteres
  });

  rl.question("Ingresa el texto que queres que lea >\n> ", function (text) {
    rl.close();
    // Start the synthesizer and wait for a result.
    synthesizer.speakTextAsync(
      text,
      function (result) {
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          console.log("Termine!");
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
    console.log("Hablando a: " + audioFile);
  });
})();
