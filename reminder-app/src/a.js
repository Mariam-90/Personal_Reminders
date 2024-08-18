import React, { forwardRef, useImperativeHandle, useRef } from 'react';

const AudioPlayer = forwardRef(({ username }, ref) => {
  const audioRef = useRef(null);

  useImperativeHandle(ref, () => ({
    playAudio: async (audioPath, isCustom = false) => {
      if (audioRef.current) {
        try {
          if (isCustom) {
            console.log(`Fetching custom audio for user: ${username}`);
            const response = await fetch(`http://localhost:5001/api/users/${username}/audio`);
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            const audioBlob = await response.blob();
            const customAudioPath = URL.createObjectURL(audioBlob);

            console.log(`Trying to play custom audio from path: ${customAudioPath}`);
            audioRef.current.src = customAudioPath;
          } else {
            console.log(`Trying to play system audio from path: ${audioPath}`);
            audioRef.current.src = audioPath;
          }

          const playPromise = audioRef.current.play();
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
          console.error('Error occurred while playing audio:', error);
        }
      } else {
        console.error('Audio element not found.');
      }
    }
  }));

  return <audio ref={audioRef} />;
});

export default AudioPlayer;
