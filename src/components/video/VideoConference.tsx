import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useSupabase';

interface VideoConferenceProps {
  roomId: string;
  studyGroupId: string;
  onLeave: () => void;
}

export default function VideoConference({ roomId, studyGroupId, onLeave }: VideoConferenceProps) {
  const { user } = useAuth();
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

  useEffect(() => {
    initializeMedia();
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Failed to access media devices:', error);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoOn;
        setIsVideoOn(!isVideoOn);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioOn;
        setIsAudioOn(!isAudioOn);
      }
    }
  };

  const startRecording = async () => {
    if (!localStream) return;
    
    try {
      const recorder = new MediaRecorder(localStream);
      const chunks: Blob[] = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        await saveRecording(blob);
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordedChunks(chunks);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };
  
  const saveRecording = async (blob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('file', blob, `meeting-${roomId}-${Date.now()}.webm`);
      formData.append('upload_preset', 'meeting_recordings');
      
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/your_cloud_name/video/upload`,
        { method: 'POST', body: formData }
      );
      
      const result = await response.json();
      
      // Save recording info to database
      await fetch('/api/meetings/recordings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meeting_id: roomId,
          recording_url: result.secure_url,
          duration: result.duration
        })
      });
    } catch (error) {
      console.error('Failed to save recording:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-bold">Study Group Video Call</h2>
          <span className="bg-red-500 px-2 py-1 rounded text-sm">🔴 LIVE</span>
          <span className="text-sm">{participants.length + 1} participants</span>
        </div>
        <button
          onClick={onLeave}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
        >
          Leave Call
        </button>
      </div>

      <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div className="relative bg-gray-800 rounded-lg overflow-hidden">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
            You {!isVideoOn && '(Video Off)'}
          </div>
        </div>

        {participants.map((participant, index) => (
          <div key={participant.id} className="relative bg-gray-800 rounded-lg overflow-hidden">
            <div className="w-full h-full flex items-center justify-center text-white text-6xl">
              🎓
            </div>
            <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
              {participant.name}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 p-4 flex items-center justify-center space-x-4">
        <button
          onClick={toggleAudio}
          className={`p-3 rounded-full ${isAudioOn ? 'bg-green-600' : 'bg-red-600'} text-white`}
        >
          {isAudioOn ? '🎤' : '🔇'}
        </button>
        
        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full ${isVideoOn ? 'bg-green-600' : 'bg-red-600'} text-white`}
        >
          {isVideoOn ? '📹' : '📵'}
        </button>
        
        <button className="p-3 rounded-full bg-gray-600 text-white">
          🖥️
        </button>
        
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`p-3 rounded-full ${isRecording ? 'bg-red-600' : 'bg-gray-600'} text-white`}
        >
          {isRecording ? '⏹️' : '🔴'}
        </button>
      </div>
    </div>
  );
}