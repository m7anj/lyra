import React, { useState, useRef } from 'react';

const VoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
        audioChunksRef.current = [];
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone', err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  return (
    <div>
      <h1>Voice Recorder</h1>
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      {audioURL && (
        <div>
          <h2>Recording</h2>
          <audio controls src={audioURL}></audio>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;