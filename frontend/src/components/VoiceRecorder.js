import React, { useState, useRef } from 'react';
import axios from 'axios';

const VoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [transcription, setTranscription] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState('');
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioBlobRef = useRef(null);

  const startRecording = async () => {
    try {
      // Reset states
      setAudioURL('');
      setTranscription('');
      setError('');
      audioChunksRef.current = [];
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        audioBlobRef.current = audioBlob;
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone', err);
      setError('Failed to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendForTranscription = async () => {
    if (!audioBlobRef.current) {
      setError('No recording available to transcribe');
      return;
    }
    
    setIsTranscribing(true);
    
    try {
      // Create form data to send to the server
      const formData = new FormData();
      formData.append('audio', audioBlobRef.current);
      
      // Send the audio to the server for transcription
      const response = await axios.post('http://localhost:5000/api/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setTranscription(response.data.transcription);
    } catch (err) {
      console.error('Error transcribing audio:', err);
      setError(err.response?.data?.error || 'Failed to transcribe audio');
    } finally {
      setIsTranscribing(false);
    }
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
          <button 
            onClick={sendForTranscription} 
            disabled={isTranscribing}
          >
            {isTranscribing ? 'Transcribing...' : 'Transcribe Audio'}
          </button>
        </div>
      )}
      
      {transcription && (
        <div>
          <h2>Transcription</h2>
          <p>{transcription}</p>
        </div>
      )}
      
      {error && (
        <div style={{ color: 'red' }}>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;