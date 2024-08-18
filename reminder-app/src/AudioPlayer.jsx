import React, { forwardRef, useImperativeHandle } from 'react';
import axios from 'axios';

const AudioPlayer = forwardRef(({ username }, ref) => {
  useImperativeHandle(ref, () => ({
    playAudio: async (audioFileName, isPredefined = false) => {
      let audioPath;

      try {
        if (isPredefined) {
          console.log(`Playing predefined audio: ${audioFileName}`);
          audioPath = `${process.env.PUBLIC_URL}/${audioFileName}`;
        } else {
          console.log(`Fetching custom audio for user: ${username}`);
          const response = await axios.get(`http://localhost:5001/api/users/${username}/audio`, { responseType: 'arraybuffer' });
          const audioBlob = new Blob([response.data], { type: response.headers['content-type'] });
          audioPath = URL.createObjectURL(audioBlob);
        }

        // Log the audio path
        console.log(`Trying to play audio from path: ${audioPath}`);

        const audio = new Audio(audioPath);

        // Handle autoplay restrictions
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Audio played successfully");
            })
            .catch((error) => {
              console.error("Audio play failed due to browser restrictions:", error);
            });
        }
      } catch (error) {
        console.error('Failed to fetch and play user audio:', error);
      }
    }
  }));

  return null;
});

export default AudioPlayer;
