# Text to Speech con Microsoft Cognitive Services y Node.js

¡Hola! Si estás interesado en utilizar el script que desarrollé para generar
archivos de audio a partir de texto utilizando la API de Microsoft Cognitive
Services, aquí te dejo una guía rápida para que puedas utilizarlo en tu propio
proyecto.

## Requisitos previos

Antes de comenzar, asegúrate de tener instalado Node.js en tu computadora.
También necesitarás una suscripción a Microsoft Cognitive Services para poder
utilizar la API de síntesis de voz.

## Instalación

1. Clona este repositorio en tu computadora.
2. Abre una terminal en la carpeta del proyecto y ejecuta el comando
   `npm install` para instalar las dependencias necesarias.

## Configuración

1. Crea un archivo `.env` en la raíz del proyecto y agrega las siguientes
   variables de entorno:

```
SPEECH_KEY=<tu clave de suscripción a Microsoft Cognitive Services>
SPEECH_REGION=<la región de tu suscripción>
```

2. En el archivo `index.js`, puedes modificar la voz utilizada para la síntesis
   de voz cambiando el valor de `speechConfig.speechSynthesisVoiceName`.

3. Instalar ffmpeg en tu computadora. Puedes descargarlo desde su
   [sitio oficial](https://ffmpeg.org/download.html). Y agregarlo a las
   variables de entorno de tu sistema. Puedes seguir
   [esta guía](https://www.thewindowsclub.com/how-to-install-ffmpeg-on-windows-10)
   para hacerlo.

## Uso

1. Ejecuta el comando `node index.js` en la terminal para iniciar el servidor.
2. Abre tu navegador y navega a `http://localhost:3000`.
3. Ingresa el texto que deseas convertir a audio y haz clic en "Generar audio".
4. El archivo de audio generado se descargará automáticamente en tu computadora.

## Contribuciones

Si deseas contribuir a este proyecto, ¡eres bienvenido! Siéntete libre de hacer
un fork del repositorio y enviar un pull request con tus cambios.
