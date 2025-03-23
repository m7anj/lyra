import React, { useState, useRef } from 'react';
import { Music } from 'lucide-react';

import { API_URL } from '@/config';

const RecordButton = ({ onSearchComplete }: { onSearchComplete: (results: any[]) => void }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        
        // Stop all tracks from the stream to release the microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Auto-stop recording after 10 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
          setIsProcessing(true);
        }
      }, 10000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Unable to access microphone. Please check your browser permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      // Step 1: Send audio to the backend for transcription
      const formData = new FormData();
      formData.append('audio', audioBlob);
      
      const transcriptionResponse = await fetch(`${API_URL}/api/transcribe`, {
        method: 'POST',
        body: formData,
      });
      
      if (!transcriptionResponse.ok) {
        throw new Error('Failed to transcribe audio');
      }

      const transcriptionData = await transcriptionResponse.json();
      const lyrics = transcriptionData.transcription;

      if (!lyrics) {
        throw new Error('No transcription found');
      }

      console.log('Transcribed lyrics:', lyrics);

      // Step 2: Search for the song using the transcribed lyrics
      const songSearchResponse = await fetch(`${API_URL}/api/search-song`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lyrics }),
      });

      if (!songSearchResponse.ok) {
        throw new Error('Failed to find matching songs');
      }

      const songData = await songSearchResponse.json();
      
      // Step 3: Get Spotify information for the song
      const spotifyResponse = await fetch(`${API_URL}/api/search-spotify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          title: songData.title, 
          artist: songData.primary_artist.name 
        }),
      });

      let spotifyData = null;
      
      if (spotifyResponse.ok) {
        spotifyData = await spotifyResponse.json();
      }
      
      // Format the results for the UI
      const results = [
        {
          id: songData.id,
          title: songData.title,
          artist: songData.primary_artist.name,
          album: spotifyData?.album || "Unknown Album",
          year: spotifyData?.release_date?.substring(0, 4) || "Unknown Year",
          coverArt: spotifyData?.albumArt || songData.song_art_image_url,
          spotifyId: spotifyData?.trackId,
          spotifyUrl: spotifyData?.trackUrl
        }
      ];
      
      console.log("Spotify track data:", spotifyData); // Debug Spotify data
      
      // Add similar songs if available
      if (songData.similar_songs && songData.similar_songs.length > 0) {
        const similarSongs = songData.similar_songs.slice(0, 2).map((song: any) => ({
          id: song.id,
          title: song.title,
          artist: song.primary_artist.name,
          album: "Unknown Album",
          year: "Unknown Year",
          coverArt: song.song_art_image_url || "https://via.placeholder.com/200",
        }));
        
        results.push(...similarSongs);
      }
      
      onSearchComplete(results);
    } catch (err: any) {
      console.error('Error processing audio:', err);
      setError(err.message || 'An error occurred while processing your recording');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleRecord = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleRecord}
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
        <p className="mt-4 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};

export default RecordButton;