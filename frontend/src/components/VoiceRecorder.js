import React, { useState, useRef } from 'react';
import axios from 'axios';
import SongMatch from './SongMatch';
import './SongMatch.css';

const VoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [transcription, setTranscription] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState('');
  const [showSongMatch, setShowSongMatch] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioBlobRef = useRef(null);

  const startRecording = async () => {
    try {
      // Reset states
      setAudioURL('');
      setTranscription('');
      setError('');
      setShowSongMatch(false);
      audioChunksRef.current = [];
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioBlobRef.current = audioBlob;
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
        
        // Stop all tracks in the stream to free up the microphone
        stream.getTracks().forEach(track => track.stop());
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
    setShowSongMatch(false);
    
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
      // Show the SongMatch component after successful transcription
      setShowSongMatch(true);
    } catch (err) {
      console.error('Error transcribing audio:', err);
      setError(err.response?.data?.error || 'Failed to transcribe audio');
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="voice-recorder-container">
      <h1>Song Finder</h1>
      <p className="instruction">Record yourself singing or saying lyrics to find a song</p>
      
      <button 
        className={`record-button ${isRecording ? 'recording' : ''}`}
        onClick={isRecording ? stopRecording : startRecording}
      >
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      
      {audioURL && (
        <div className="recording-container">
          <h2>Your Recording</h2>
          <audio controls src={audioURL} className="audio-player"></audio>
          <button 
            className="transcribe-button"
            onClick={sendForTranscription} 
            disabled={isTranscribing}
          >
            {isTranscribing ? 'Transcribing...' : 'Find Song From Recording'}
          </button>
        </div>
      )}
      
      {transcription && (
        <div className="transcription-container">
          <h2>Transcribed Lyrics</h2>
          <p className="transcription-text">"{transcription}"</p>
        </div>
      )}
      
      {error && (
        <div className="error-container">
          <p>{error}</p>
        </div>
      )}
      
      {showSongMatch && transcription && (
        <SongMatch lyrics={transcription} />
      )}
    </div>
  );
};

export default VoiceRecorder;