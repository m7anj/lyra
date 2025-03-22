import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Music } from 'lucide-react';

const VoiceRecorder = ({ onSearchComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioBlobRef = useRef(null);

  const startRecording = async () => {
    try {
      // Reset states
      setError('');
      audioChunksRef.current = [];
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          channelCount: 1
        } 
      });
      
      const options = { mimeType: 'audio/webm' };
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioBlobRef.current = audioBlob;
        sendForTranscription();
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start(100); // Collect data every 100ms
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
    
    setIsProcessing(true);
    
    try {
      // Create form data to send to the server
      const formData = new FormData();
      formData.append('audio', audioBlobRef.current);
      
      // Send the audio to the server for transcription and song matching
      const response = await axios.post('http://localhost:5000/api/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Format the song data for the results component
      if (response.data.song) {
        const songData = response.data.song;
        const spotifyData = songData.spotify || {};
        const formattedResults = [
          {
            id: songData.id || 1,
            title: songData.title || '',
            artist: songData.primary_artist?.name || spotifyData.artists?.[0]?.name || '',
            album: spotifyData.album?.name || '',
            year: spotifyData.album?.release_date?.substring(0, 4) || '',
            coverArt: spotifyData.album?.images?.[0]?.url || songData.header_image_url || 'https://via.placeholder.com/200',
            transcription: response.data.transcription || '',
            spotify_id: spotifyData.id || '',
            preview_url: spotifyData.preview_url || '',
            external_url: spotifyData.external_url || songData.url || ''
          }
        ];
        
        // Pass the results to the parent component
        onSearchComplete(formattedResults);
      } else if (response.data.error) {
        setError(response.data.error);
      }
    } catch (err) {
      console.error('Error processing audio:', err);
      setError(err.response?.data?.error || 'Failed to process audio');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        className={`record-button relative w-24 h-24 rounded-full flex items-center justify-center shadow-soft transition-all ${
          isRecording 
            ? 'bg-destructive animate-pulse' 
            : isProcessing 
            ? 'bg-lyra-orange' 
            : 'bg-gradient-to-r from-lyra-pink to-lyra-orange button-hover'
        }`}
      >
        {isRecording ? (
          <div className="w-6 h-6 rounded bg-white animate-pulse"></div>
        ) : isProcessing ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <Music className="w-8 h-8 text-white" />
        )}
      </button>
      
      <p className="mt-6 text-lg font-medium animate-fade-in">
        {isRecording 
          ? "Listening..." 
          : isProcessing 
          ? "Finding your song..." 
          : "Tap to sing or say lyrics"}
      </p>
      
      <p className="mt-2 text-sm text-muted-foreground max-w-xs text-center animate-fade-in">
        {isRecording 
          ? "Sing or say the lyrics you remember" 
          : isProcessing 
          ? "Searching music databases" 
          : "Find any song by singing a portion or saying the lyrics you remember"}
      </p>
      
      {error && (
        <div className="mt-4 text-destructive text-sm bg-destructive/10 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;