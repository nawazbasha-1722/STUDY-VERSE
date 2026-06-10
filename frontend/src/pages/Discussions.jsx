import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Plus,
  Compass,
  MessageSquare,
  Key,
  Mic,
  MicOff,
  Video,
  PenTool,
  Trash,
  X,
  Loader2,
  Lock,
  Sparkles,
  Send,
  User,
  MonitorPlay,
} from 'lucide-react';

const VideoPlayer = ({ stream, muted = false }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={muted}
      className="w-full h-full object-contain rounded-2xl bg-black"
    />
  );
};

const MockScreenShareView = ({ userName }) => {
  const [slideIndex, setSlideIndex] = useState(0);

  const mockSlides = [
    {
      title: "Slide 1: OSI Model Architecture",
      content: [
        "Layer 7: Application - HTTP, FTP, SMTP",
        "Layer 6: Presentation - SSL, SSH, IMAP",
        "Layer 5: Session - NetBIOS, Sockets",
        "Layer 4: Transport - TCP, UDP",
        "Layer 3: Network - IP, ICMP",
        "Layer 2: Data Link - Ethernet, PPP",
        "Layer 1: Physical - Cables, Hubs"
      ],
      desc: "Standard 7-layer networking architecture framework."
    },
    {
      title: "Slide 2: TCP Three-Way Handshake",
      content: [
        "1. Client -- [SYN] (Seq=x) --> Server",
        "2. Server -- [SYN-ACK] (Seq=y, Ack=x+1) --> Client",
        "3. Client -- [ACK] (Seq=x+1, Ack=y+1) --> Server",
        "Connection Established. Ready for data transmission."
      ],
      desc: "Reliable packet exchange flow setup."
    },
    {
      title: "Slide 3: WebRTC Connection Flow",
      content: [
        "1. Peer A generates Offer SDP and registers ICE candidates",
        "2. Signal Server routes Peer A Offer to Peer B",
        "3. Peer B accepts Offer, generates Answer SDP",
        "4. Signal Server routes Peer B Answer to Peer A",
        "5. Peer-to-peer connection is opened for audio/video stream"
      ],
      desc: "Real-time communication framework bypassing intermediary media hubs."
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % mockSlides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const slide = mockSlides[slideIndex];

  return (
    <div className="w-full h-full flex flex-col justify-between p-6 bg-gradient-to-tr from-[#13182b] to-[#0f1424] text-white">
      <div className="flex justify-between items-start border-b border-white/5 pb-3">
        <div>
          <h4 className="text-purple-400 text-xs uppercase font-bold tracking-wider">Live Presentation Stream</h4>
          <h3 className="font-bold text-sm text-gray-200 mt-0.5">{slide.title}</h3>
        </div>
        <span className="text-[10px] bg-[#161b30] border border-white/5 text-gray-400 px-2 py-0.5 rounded-full">
          Slide {slideIndex + 1} of {mockSlides.length}
        </span>
      </div>

      <div className="flex-1 my-4 bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col justify-center space-y-2.5">
        {slide.content.map((line, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs font-mono text-gray-300">
            <span className="text-purple-500 font-bold shrink-0">&gt;</span>
            <span>{line}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-white/5 pt-3 flex justify-between items-center text-[10px] text-gray-500">
        <span>Concept outline: {slide.desc}</span>
        <span className="italic">Presenter: {userName}</span>
      </div>
    </div>
  );
};

const Discussions = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null); // Active joined room details
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Socket reference
  const socketRef = useRef(null);

  // Forms
  const [joinCode, setJoinCode] = useState('');
  const [createForm, setCreateForm] = useState({ name: '', topic: '', description: '', maxMembers: 10 });
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  // Active room chat & whiteboard state
  const [messages, setMessages] = useState([]);
  const [typedMessage, setTypedMessage] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#aa3bff');
  const [lineWidth, setLineWidth] = useState(3);
  const canvasRef = useRef(null);
  const contextRef = useRef(null);

  // end session summary state
  const [summaryReport, setSummaryReport] = useState(null);
  const [endingSession, setEndingSession] = useState(false);

  // Screen Share states & references
  const [activeTab, setActiveTab] = useState('whiteboard'); // 'whiteboard' or 'screenshare'
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [sharingUser, setSharingUser] = useState(null); // { socketId, userId, name }

  const peerConnectionsRef = useRef({}); // Map of socketId -> RTCPeerConnection
  const localStreamRef = useRef(null);
  const iceCandidatesQueueRef = useRef({}); // Map of socketId -> [RTCIceCandidate]

  const userRef = useRef(user);
  const activeRoomIdRef = useRef(null);
  const isSharingScreenRef = useRef(false);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    isSharingScreenRef.current = isSharingScreen;
  }, [isSharingScreen]);

  useEffect(() => {
    if (activeRoom) {
      if (activeRoomIdRef.current && activeRoomIdRef.current !== activeRoom._id) {
        socketRef.current?.emit('leave_room', activeRoomIdRef.current);
      }
      activeRoomIdRef.current = activeRoom._id;
    } else {
      if (activeRoomIdRef.current) {
        socketRef.current?.emit('leave_room', activeRoomIdRef.current);
        activeRoomIdRef.current = null;
      }
    }
  }, [activeRoom]);

  const fetchRooms = async () => {
    try {
      const res = await API.get('/discussions');
      if (res.data?.success) {
        setRooms(res.data.rooms || []);
      }
    } catch (err) {
      setError('Failed to fetch discussion rooms.');
    } finally {
      setLoading(false);
    }
  };

  const cleanupScreenShare = () => {
    Object.keys(peerConnectionsRef.current).forEach((id) => {
      try {
        peerConnectionsRef.current[id].close();
      } catch (e) {}
    });
    peerConnectionsRef.current = {};
    iceCandidatesQueueRef.current = {};
    setRemoteStream(null);
    setSharingUser(null);
  };

  const stopScreenShare = () => {
    if (localStreamRef.current) {
      try {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      } catch (e) {}
      localStreamRef.current = null;
    }
    setLocalStream(null);
    setIsSharingScreen(false);
    setSharingUser(null);

    const targetRoomId = activeRoom?._id || activeRoomIdRef.current;
    if (socketRef.current && targetRoomId) {
      socketRef.current.emit('stop_screen', {
        roomId: targetRoomId,
        name: userRef.current?.name || 'User'
      });
    }

    Object.keys(peerConnectionsRef.current).forEach((id) => {
      try {
        peerConnectionsRef.current[id].close();
      } catch (e) {}
    });
    peerConnectionsRef.current = {};
    iceCandidatesQueueRef.current = {};
  };

  const startScreenShare = async () => {
    try {
      cleanupScreenShare();
      
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: false
      });

      localStreamRef.current = stream;
      setLocalStream(stream);
      setIsSharingScreen(true);
      setSharingUser({ socketId: socketRef.current?.id, name: user.name });
      setActiveTab('screenshare');

      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };

      if (socketRef.current && activeRoom) {
        socketRef.current.emit('join_screen', {
          roomId: activeRoom._id,
          userId: user.id,
          name: user.name
        });
      }
    } catch (err) {
      console.warn("Display Media capture failed, falling back to mock screen share:", err);
      setIsSharingScreen(true);
      setSharingUser({ socketId: socketRef.current?.id || 'mock-id', name: user.name });
      setActiveTab('screenshare');
      
      if (socketRef.current && activeRoom) {
        socketRef.current.emit('join_screen', {
          roomId: activeRoom._id,
          userId: user.id,
          name: user.name
        });
      }
    }
  };

  useEffect(() => {
    fetchRooms();

    // Initialize socket connection
    const baseApi = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const socketUrl = baseApi.replace('/api', ''); // Get http://localhost:5000
    socketRef.current = io(socketUrl, {
      withCredentials: true,
    });

    socketRef.current.on('receive_message', (data) => {
      if (activeRoomIdRef.current && data.roomId !== activeRoomIdRef.current) return;
      setMessages((prev) => [...prev, data]);
    });

    socketRef.current.on('draw_line', (data) => {
      if (activeRoomIdRef.current && data.roomId !== activeRoomIdRef.current) return;
      drawOnCanvasReceived(data);
    });

    socketRef.current.on('clear_whiteboard', (roomId) => {
      if (activeRoomIdRef.current && roomId !== activeRoomIdRef.current) return;
      clearCanvasLocal();
    });

    socketRef.current.on('user_joined_room', (data) => {
      if (activeRoomIdRef.current && data.roomId !== activeRoomIdRef.current) return;
      // If we are sharing screen, notify the new room member
      if ((localStreamRef.current || isSharingScreenRef.current) && socketRef.current) {
        socketRef.current.emit('screen_signal', {
          to: data.socketId,
          signal: { 
            type: 'share_advertisement', 
            name: userRef.current?.name || 'User', 
            userId: userRef.current?.id || userRef.current?._id 
          }
        });
      }
    });

    socketRef.current.on('user_joined_screen', (data) => {
      if (activeRoomIdRef.current && data.roomId !== activeRoomIdRef.current) return;
      if (socketRef.current && data.socketId !== socketRef.current.id) {
        setSharingUser(data);
        setActiveTab('screenshare');

        // Viewer sends a request to the sharer to initiate peer connection
        socketRef.current.emit('screen_signal', {
          to: data.socketId,
          signal: { type: 'request' }
        });
      }
    });

    socketRef.current.on('screen_signal', async (signalData) => {
      const { from, signal } = signalData;

      try {
        if (signal.type === 'share_advertisement') {
          // A user is already sharing screen. Setup info and send request.
          setSharingUser({ socketId: from, name: signal.name, userId: signal.userId });
          setActiveTab('screenshare');

          if (socketRef.current) {
            socketRef.current.emit('screen_signal', {
              to: from,
              signal: { type: 'request' }
            });
          }
          return;
        }

        let pc = peerConnectionsRef.current[from];

        if (!pc && (signal.type === 'request' || signal.sdp)) {
          pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
          });
          peerConnectionsRef.current[from] = pc;

          pc.onicecandidate = (event) => {
            if (event.candidate && socketRef.current) {
              socketRef.current.emit('screen_signal', {
                to: from,
                signal: { candidate: event.candidate }
              });
            }
          };

          pc.ontrack = (event) => {
            if (event.streams && event.streams[0]) {
              setRemoteStream(event.streams[0]);
            }
          };

          if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => {
              pc.addTrack(track, localStreamRef.current);
            });
          }
        }

        if (signal.type === 'request') {
          if (pc) {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socketRef.current.emit('screen_signal', {
              to: from,
              signal: { sdp: pc.localDescription }
            });
          }
        } else if (signal.sdp) {
          if (pc) {
            if (signal.sdp.type === 'offer') {
              await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              socketRef.current.emit('screen_signal', {
                to: from,
                signal: { sdp: pc.localDescription }
              });

              // Process queued candidates
              if (iceCandidatesQueueRef.current[from]) {
                for (const candidate of iceCandidatesQueueRef.current[from]) {
                  try {
                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                  } catch (e) {
                    console.error("Failed to add queued candidate:", e);
                  }
                }
                delete iceCandidatesQueueRef.current[from];
              }
            } else if (signal.sdp.type === 'answer') {
              await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));

              // Process queued candidates
              if (iceCandidatesQueueRef.current[from]) {
                for (const candidate of iceCandidatesQueueRef.current[from]) {
                  try {
                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                  } catch (e) {
                    console.error("Failed to add queued candidate:", e);
                  }
                }
                delete iceCandidatesQueueRef.current[from];
              }
            }
          }
        } else if (signal.candidate) {
          if (pc && pc.remoteDescription) {
            await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
          } else {
            if (!iceCandidatesQueueRef.current[from]) {
              iceCandidatesQueueRef.current[from] = [];
            }
            iceCandidatesQueueRef.current[from].push(signal.candidate);
          }
        }
      } catch (err) {
        console.error("Signaling coordination error:", err);
      }
    });

    socketRef.current.on('user_stopped_screen', (data) => {
      if (activeRoomIdRef.current && data.roomId !== activeRoomIdRef.current) return;
      cleanupScreenShare();
      setActiveTab('whiteboard');
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Configure whiteboard canvas when room opens
  useEffect(() => {
    if (activeRoom && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = 600 * 2; // For high resolution
      canvas.height = 350 * 2;
      canvas.style.width = '600px';
      canvas.style.height = '350px';

      const ctx = canvas.getContext('2d');
      ctx.scale(2, 2);
      ctx.lineCap = 'round';
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      contextRef.current = ctx;

      // Draw historical strokes if any
      activeRoom.whiteboardData?.forEach((stroke) => {
        drawOnCanvasReceived(stroke);
      });
    }
  }, [activeRoom]);

  // Clean up screen sharing on activeRoom exit/changes
  useEffect(() => {
    if (!activeRoom) {
      stopScreenShare();
      cleanupScreenShare();
      setActiveTab('whiteboard');
    }
  }, [activeRoom]);

  // Create Room
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setError('');

    try {
      const res = await API.post('/discussions', createForm);
      if (res.data?.success) {
        setRooms([res.data.room, ...rooms]);
        setCreateOpen(false);
        setCreateForm({ name: '', topic: '', description: '', maxMembers: 10 });
        handleJoinRoom(res.data.room);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating room');
    } finally {
      setCreateLoading(false);
    }
  };

  // Join Room by Code
  const handleJoinByCode = async (e) => {
    e.preventDefault();
    if (!joinCode) return;
    setError('');

    try {
      const res = await API.post('/discussions/join', { roomCode: joinCode });
      if (res.data?.success) {
        handleJoinRoom(res.data.room);
        setJoinCode('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join room');
    }
  };

  // Setup local joined room state
  const handleJoinRoom = (room) => {
    setActiveRoom(room);
    setMessages(room.messages || []);
    setSummaryReport(null);
    if (socketRef.current) {
      socketRef.current.emit('join_room', room._id);
    }
  };

  // Send Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!typedMessage || !activeRoom) return;

    const msgText = typedMessage;
    setTypedMessage('');

    const chatData = {
      roomId: activeRoom._id,
      sender: user.id,
      senderName: user.name,
      message: msgText,
      timestamp: new Date(),
    };

    // Optimistic local update & socket broadcast
    setMessages((prev) => [...prev, chatData]);
    if (socketRef.current) {
      socketRef.current.emit('send_message', chatData);
    }

    try {
      await API.post(`/discussions/${activeRoom._id}/message`, { message: msgText });
    } catch (err) {
      console.error('Failed to log message in DB', err);
    }
  };

  // --- Canvas Drawing Logic ---
  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();

    const drawData = {
      roomId: activeRoom._id,
      x: offsetX,
      y: offsetY,
      color,
      lineWidth,
      isStart: false,
    };

    if (socketRef.current) {
      socketRef.current.emit('draw_line', drawData);
    }
  };

  const stopDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);

    // Save whiteboard state to DB periodically
    if (activeRoom && canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL();
      API.post(`/discussions/${activeRoom._id}/whiteboard`, { stroke: { dataUrl } }).catch((err) =>
        console.error('Failed to save whiteboard state in DB', err)
      );
    }
  };

  const drawOnCanvasReceived = (data) => {
    if (!contextRef.current) return;
    const ctx = contextRef.current;
    const prevColor = ctx.strokeStyle;
    const prevWidth = ctx.lineWidth;

    ctx.strokeStyle = data.color;
    ctx.lineWidth = data.lineWidth;

    // If dataUrl coordinate batch
    if (data.dataUrl) {
      const img = new Image();
      img.src = data.dataUrl;
      img.onload = () => {
        ctx.clearRect(0, 0, 600, 350);
        ctx.drawImage(img, 0, 0, 600, 350);
      };
    } else {
      ctx.lineTo(data.x, data.y);
      ctx.stroke();
    }

    ctx.strokeStyle = prevColor;
    ctx.lineWidth = prevWidth;
  };

  const clearCanvasLocal = () => {
    if (!contextRef.current || !canvasRef.current) return;
    contextRef.current.clearRect(0, 0, 600, 350);
  };

  const handleClearCanvas = () => {
    clearCanvasLocal();
    if (socketRef.current && activeRoom) {
      socketRef.current.emit('clear_whiteboard', activeRoom._id);
    }
  };

  // Close Session (Creator)
  const handleEndSession = async () => {
    setEndingSession(true);
    setError('');

    try {
      const res = await API.post(`/discussions/${activeRoom._id}/end`);
      if (res.data?.success) {
        setSummaryReport(res.data.room.aiSummary);
        setActiveRoom(null);
        fetchRooms(); // refresh listing
      }
    } catch (err) {
      setError('Failed to finalize and summarize session.');
    } finally {
      setEndingSession(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto relative">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Collaboration Rooms</h1>
          <p className="text-gray-400 text-sm mt-1">
            Exchange whiteboard concepts and chats in real-time, managed by AI moderator summaries.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Main room view or join menu */}
      {!activeRoom ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Join and Create Workspace */}
          <div className="space-y-6">
            {/* Join Room Code card */}
            <div className="bg-[#0f1424] border border-white/5 p-6 rounded-3xl space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-purple-400" />
                <span>Join by Code</span>
              </h3>
              <form onSubmit={handleJoinByCode} className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Enter Code (e.g. F2A4B1)"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="flex-1 bg-[#161b30] border border-white/5 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none uppercase"
                />
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2 px-6 rounded-xl text-sm cursor-pointer"
                >
                  Join
                </button>
              </form>
            </div>

            {/* Create Room card */}
            <div className="bg-[#0f1424] border border-white/5 p-6 rounded-3xl text-center space-y-4">
              <Compass className="w-12 h-12 text-purple-400 mx-auto" />
              <div>
                <h3 className="font-bold text-white">Start New Discussion</h3>
                <p className="text-xs text-gray-500 mt-1">Host study streams with peers.</p>
              </div>
              <button
                onClick={() => setCreateOpen(true)}
                className="w-full bg-[#161b30] hover:bg-[#1e2444] text-white border border-white/5 py-3 rounded-2xl text-sm font-semibold transition-colors cursor-pointer"
              >
                Configure Room Drawer
              </button>
            </div>

            {/* Summary report showing from last ended session */}
            {summaryReport && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#0f1424] border border-white/5 rounded-3xl p-6 space-y-6 text-sm"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5.5 h-5.5 text-yellow-400" />
                  <h4 className="font-bold text-white text-base">AI Moderator Audit Report</h4>
                </div>

                <div className="bg-[#161b30] p-4 rounded-2xl text-center">
                  <p className="text-2xl font-bold text-purple-400">{summaryReport.performanceScore} / 100</p>
                  <p className="text-xs text-gray-500 font-bold uppercase mt-1">Discussion Quality Score</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h5 className="font-bold text-purple-400 text-xs uppercase mb-1">Key Points</h5>
                    <ul className="list-disc pl-4 text-xs text-gray-400 space-y-1">
                      {summaryReport.keyPoints.map((kp, idx) => <li key={idx}>{kp}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-bold text-indigo-400 text-xs uppercase mb-1">Decisions</h5>
                    <ul className="list-disc pl-4 text-xs text-gray-400 space-y-1">
                      {summaryReport.decisions.map((d, idx) => <li key={idx}>{d}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-bold text-pink-400 text-xs uppercase mb-1">Audits Feedback</h5>
                    <p className="text-xs text-gray-400 leading-relaxed italic">"{summaryReport.feedback}"</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Active room listings */}
          <div className="lg:col-span-2 bg-[#0f1424] border border-white/5 rounded-3xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">Active Coordination Streams</h3>

            {rooms.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-12">No active rooms found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rooms.map((room) => (
                  <div
                    key={room._id}
                    className="bg-[#161b30] border border-white/5 p-5 rounded-2xl flex flex-col justify-between hover:border-purple-500/10 transition-all"
                  >
                    <div>
                      <span className="text-[10px] bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Topic: {room.topic}
                      </span>
                      <h4 className="font-bold text-white mt-2 mb-1">{room.name}</h4>
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {room.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/3 mt-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        <span>Code: {room.roomCode}</span>
                      </span>
                      <button
                        onClick={() => handleJoinRoom(room)}
                        className="bg-[#161b30] hover:bg-[#1e2444] border border-white/5 py-1.5 px-3 rounded-lg font-semibold text-white cursor-pointer"
                      >
                        Join Room
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Inside Active Joined Room Panel Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel: Whiteboard */}
          <div className="lg:col-span-2 bg-[#0f1424] border border-white/5 rounded-3xl p-6 space-y-4 flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/5">
              <div className="space-y-1.5">
                <h3 className="font-bold text-white text-lg">{activeRoom.name}</h3>
                {/* Tab selectors */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('whiteboard')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 ${
                      activeTab === 'whiteboard'
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-900/20'
                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    🎨 Whiteboard
                  </button>
                  <button
                    onClick={() => setActiveTab('screenshare')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 flex items-center gap-1.5 ${
                      activeTab === 'screenshare'
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-900/20'
                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    🖥️ Screen Share
                    {sharingUser && (
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                    )}
                  </button>
                </div>
              </div>

              {/* End/Leave controls */}
              <div className="flex items-center gap-2">
                {activeTab === 'whiteboard' && (
                  <button
                    onClick={handleClearCanvas}
                    className="bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 text-red-400 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                  >
                    Clear Canvas
                  </button>
                )}
                {activeTab === 'screenshare' && !sharingUser && (
                  <button
                    onClick={startScreenShare}
                    className="bg-purple-500/10 hover:bg-purple-500/15 border border-purple-500/20 text-purple-400 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <MonitorPlay className="w-3.5 h-3.5" />
                    <span>Share Screen</span>
                  </button>
                )}
                {activeTab === 'screenshare' && isSharingScreen && (
                  <button
                    onClick={stopScreenShare}
                    className="bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 text-red-400 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                  >
                    Stop Share
                  </button>
                )}
                {activeRoom.creator === user.id || activeRoom.creator?._id === user.id ? (
                  <button
                    onClick={handleEndSession}
                    disabled={endingSession}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-all"
                  >
                    {endingSession ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'End Session'}
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveRoom(null)}
                    className="bg-[#161b30] hover:bg-white/5 border border-white/5 text-gray-400 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                  >
                    Leave Room
                  </button>
                )}
              </div>
            </div>

            {activeTab === 'whiteboard' ? (
              <>
                {/* Canvas Body container */}
                <div className="bg-[#0d1222] border border-white/5 rounded-2xl overflow-hidden relative w-full h-[350px] flex items-center justify-center">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="cursor-crosshair w-full h-full max-w-[600px] max-h-[350px]"
                  />
                </div>

                {/* Draw controls */}
                <div className="flex items-center gap-4 text-xs pt-2">
                  <div className="flex items-center gap-2">
                    <PenTool className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-400 font-medium">Color:</span>
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => {
                        setColor(e.target.value);
                        contextRef.current.strokeStyle = e.target.value;
                      }}
                      className="w-6 h-6 rounded border border-white/10 cursor-pointer bg-transparent"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 font-medium">Size:</span>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={lineWidth}
                      onChange={(e) => {
                        setLineWidth(e.target.value);
                        contextRef.current.lineWidth = e.target.value;
                      }}
                      className="w-20 cursor-pointer accent-purple-500"
                    />
                  </div>
                </div>
              </>
            ) : (
              /* Screen Share View */
              <div className="space-y-4 flex flex-col flex-1 pt-2">
                <div className="bg-[#0d1222] border border-white/5 rounded-2xl overflow-hidden relative w-full h-[350px] flex items-center justify-center">
                  {sharingUser ? (
                    <div className="relative w-full h-full">
                      {isSharingScreen && localStream ? (
                        <VideoPlayer stream={localStream} muted={true} />
                      ) : !isSharingScreen && remoteStream ? (
                        <VideoPlayer stream={remoteStream} />
                      ) : (
                        /* Premium Interactive Mock Stream View if stream is null/simulation */
                        <MockScreenShareView userName={sharingUser.name} />
                      )}

                      {/* Header overlay for the video */}
                      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/5 flex items-center gap-2 text-[10px]">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        <span className="text-white font-medium">
                          {isSharingScreen ? "You are sharing screen" : `${sharingUser.name} is sharing screen`}
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* Inactive Screen Share */
                    <div className="text-center p-8 space-y-4 max-w-sm">
                      <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/20 rounded-3xl flex items-center justify-center mx-auto text-purple-400 animate-pulse">
                        <MonitorPlay className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-base">No Active Screen Share</h4>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                          Start screen sharing to present diagrams, presentations, code structures, or websites.
                        </p>
                      </div>
                      <button
                        onClick={startScreenShare}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-2.5 px-6 rounded-xl text-white font-semibold text-xs shadow-md transition-all shrink-0 cursor-pointer"
                      >
                        Share Your Screen
                      </button>
                    </div>
                  )}
                </div>

                {/* Sharing footer settings */}
                {sharingUser && (
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-gray-500">
                      Transport: <span className="text-purple-400 font-bold uppercase">WebRTC Media Stream</span>
                    </span>
                    {isSharingScreen && (
                      <button
                        onClick={stopScreenShare}
                        className="bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 text-red-400 px-4 py-1.5 rounded-xl font-bold cursor-pointer transition-all"
                      >
                        Stop Sharing Screen
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Panel: Chat dialogue */}
          <div className="bg-[#0f1424] border border-white/5 rounded-3xl p-6 h-[500px] flex flex-col justify-between shadow-lg">
            <div>
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-400" />
                <span>Stream Chat</span>
              </h3>
            </div>

            {/* Chats list */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-4 text-xs">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.sender === user.id ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] text-gray-500 mb-0.5 px-1">{msg.senderName}</span>
                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl leading-relaxed ${
                      msg.sender === user.id
                        ? 'bg-purple-600 text-white rounded-tr-none'
                        : 'bg-[#161b30] text-gray-200 border border-white/5 rounded-tl-none'
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="flex gap-2 pt-3 border-t border-white/5">
              <input
                type="text"
                required
                placeholder="Type message..."
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                className="flex-1 bg-[#161b30] border border-white/5 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-500 text-white p-2.5 rounded-xl transition-colors cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create Room Modal Drawer Drawer */}
      <AnimatePresence>
        {createOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCreateOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            ></motion.div>

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0f1424] border border-white/5 rounded-3xl p-8 max-w-md w-full z-10 space-y-6 shadow-2xl relative"
            >
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Plus className="w-6 h-6 text-purple-400" />
                <span>Create Study Room</span>
              </h2>

              <form onSubmit={handleCreateRoom} className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-xs font-semibold mb-2">Room Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Unit 2 CN Exam Review"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="w-full bg-[#161b30] border border-white/5 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-xs font-semibold mb-2">Topic</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Computer Networks"
                    value={createForm.topic}
                    onChange={(e) => setCreateForm({ ...createForm, topic: e.target.value })}
                    className="w-full bg-[#161b30] border border-white/5 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-xs font-semibold mb-2">Description</label>
                  <textarea
                    placeholder="Brief agenda..."
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    rows="2"
                    className="w-full bg-[#161b30] border border-white/5 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none resize-none"
                  />
                </div>

                <div className="flex gap-4 pt-4 justify-end">
                  <button
                    type="button"
                    onClick={() => setCreateOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-white/5 text-gray-400 hover:text-white transition-colors text-sm cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-2.5 px-6 rounded-xl text-white font-semibold text-sm transition-all flex items-center gap-1.5 cursor-pointer shadow-lg"
                  >
                    {createLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>Publish Room</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Discussions;
