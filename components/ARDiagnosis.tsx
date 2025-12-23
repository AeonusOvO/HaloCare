import React, { useRef, useEffect, useState } from 'react';
import { Camera, RefreshCw, AlertCircle, ScanEye, Zap, Mic, MicOff, ChevronRight, Check, Info, FileText, Activity, Ear, MessageSquare, Upload, Utensils, Moon, HandMetal, HeartPulse, Sparkles, Loader2, AlertTriangle, RotateCcw, ChevronLeft, Clock, Trash2, Calendar } from 'lucide-react';
import { callQwen, analyzeImageWithQwenVL, analyzeAudioWithQwenOmni, generateFinalDiagnosis } from '../services/qwenService';
import { api } from '../services/api';
import { Message } from '../types';

// Steps of the TCM Diagnosis Flow
enum DiagnosisStep {
  INTRO = 0,
  WANG = 1,        // Observation (Face/Tongue)
  WEN_AUDIO = 2,   // Listening/Smelling (Voice/Odor)
  WEN_INQUIRY = 3, // Inquiry (10 Questions)
  QIE = 4,         // Palpation (Pulse)
  ANALYSIS = 5,
  REPORT = 6
}

type WangType = 'face' | 'tongue';

// Structured Report Interface
interface DiagnosisReport {
  diagnosis: string;
  pathology: string;
  suggestions: {
    diet: string;
    lifestyle: string;
    acupoints: string;
  };
}

interface HistoryItem {
  id: string;
  date: string; // ISO string
  diagnosis: string;
  fullReport: DiagnosisReport;
  images: { face: string | null; tongue: string | null };
}

// Helper to resize image
const resizeImage = (dataUrl: string, maxWidth: number = 800): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.8)); // 0.8 quality jpeg
    };
  });
};

// Helper for slide transition
const SlideTransition: React.FC<{
  children: React.ReactNode;
  position: 'left' | 'right' | 'center';
}> = ({ children, position }) => {
  let translateClass = 'translate-x-0';
  if (position === 'left') translateClass = '-translate-x-full';
  if (position === 'right') translateClass = 'translate-x-full';

  return (
    <div
      className={`absolute inset-0 transition-transform duration-500 ease-in-out transform ${translateClass}`}
    >
      {children}
    </div>
  );
};

const ARDiagnosis: React.FC<{ userId?: string }> = ({ userId }) => {
  // Debug log to verify version
  useEffect(() => {
    console.log("ARDiagnosis Component Loaded - Version: Fix-v5-SmartTransition");
  }, []);

  // ... (Camera & Stream State, Data State, Result State, History State remain unchanged)
  // Camera & Stream State
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permissionError, setPermissionError] = useState(false);
  const [cameraErrorMsg, setCameraErrorMsg] = useState('');

  // Diagnosis Flow State
  const [step, setStep] = useState<DiagnosisStep>(DiagnosisStep.INTRO);
  const [wangType, setWangType] = useState<WangType>('face');
  
  // Data State
  const [images, setImages] = useState<{ face: string | null, tongue: string | null }>({ face: null, tongue: null });
  const [wenAudioText, setWenAudioText] = useState(''); // User manual description
  const [audioBase64, setAudioBase64] = useState<string | null>(null); // Recorded audio
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false); // Legacy flag for speech recognition visual
  
  // Intermediate Analysis Results
  const [wangResult, setWangResult] = useState<string>('');
  const [wenResult, setWenResult] = useState<string>('');
  const [stepStatus, setStepStatus] = useState<{
    wang: 'idle' | 'loading' | 'success' | 'error',
    wen: 'idle' | 'loading' | 'success' | 'error'
  }>({ wang: 'idle', wen: 'idle' });

  const [inquiryData, setInquiryData] = useState({
    hanRe: '', // Cold/Hot
    han: '',   // Sweat
    touShen: '', // Head/Body
    bian: '',  // Stool/Urine
    yinShi: '', // Diet
    xiong: '', // Chest
    ke: '', // Thirst
    other: '' // Other
  });
  const [qieData, setQieData] = useState(''); // Pulse input (optional)
  
  // Result State
  const [report, setReport] = useState<{content: string, reasoning: string, parsed?: DiagnosisReport} | null>(null);
  const [realtimeReasoning, setRealtimeReasoning] = useState(''); // For streaming display
  const [realtimeContent, setRealtimeContent] = useState(''); // For streaming display
  const [isConnected, setIsConnected] = useState(false); // To track if API has responded
  const [error, setError] = useState<string | null>(null); // Track errors
  
  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isIntroShifted, setIsIntroShifted] = useState(false);

  // Transition Helper Logic
  const getSlidePosition = (targetStep: DiagnosisStep) => {
      // Group Analysis and Report as effectively the same step for transition purposes
      const normalize = (s: DiagnosisStep) => (s === DiagnosisStep.REPORT ? DiagnosisStep.ANALYSIS : s);
      
      const normTarget = normalize(targetStep);
      const normCurrent = normalize(step);

      if (normTarget === normCurrent) return 'center';
      return normTarget < normCurrent ? 'left' : 'right';
  };
  
  const changeStep = (newStep: DiagnosisStep) => {
      setStep(newStep);
  };
  useEffect(() => {
    const loadHistory = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        setIsLoadingHistory(true);
        try {
            const data = await api.getDiagnosisHistory(token);
            setHistory(data);
        } catch (e) {
            console.error("Failed to load history", e);
        } finally {
            setIsLoadingHistory(false);
        }
    };
    if (step === DiagnosisStep.INTRO) {
        loadHistory();
    }
  }, [step]);

  // Handle Intro Animation based on History
  useEffect(() => {
      if (!userId) return;
      const storageKey = `ar_intro_animated_${userId}`;
      const hasAnimated = localStorage.getItem(storageKey);

      if (history.length > 0) {
          if (hasAnimated) {
              // Already animated, shift immediately
              setIsIntroShifted(true);
          } else {
              // Not animated yet, start centered then animate up
              setIsIntroShifted(false);
              // Delay slightly to ensure render, then animate
              const timer = setTimeout(() => {
                  setIsIntroShifted(true);
                  localStorage.setItem(storageKey, 'true');
              }, 800);
              return () => clearTimeout(timer);
          }
      } else {
          // No history, stay centered
          setIsIntroShifted(false);
      }
  }, [history.length, userId]);

  // Save to history helper
  const saveToHistory = async (parsedReport: DiagnosisReport) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      diagnosis: parsedReport.diagnosis,
      fullReport: parsedReport,
      images: images // Save images for reference
    };
    
    // Optimistic update
    setHistory([newItem, ...history]);
    
    const token = localStorage.getItem('token');
    if (token) {
        try {
            await api.saveDiagnosis(token, newItem);
        } catch(e) {
            console.error("Failed to save history to server", e);
        }
    }
  };

  const deleteHistory = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('确定要删除这条诊断记录吗？')) {
      const updatedHistory = history.filter(item => item.id !== id);
      setHistory(updatedHistory);
      
      const token = localStorage.getItem('token');
      if (token) {
          try {
              await api.deleteDiagnosis(token, id);
          } catch(e) {
              console.error("Failed to delete history", e);
          }
      }
    }
  };

  const viewHistoryItem = (item: HistoryItem) => {
    setReport({ content: '', reasoning: '', parsed: item.fullReport });
    setImages(item.images);
    changeStep(DiagnosisStep.REPORT);
  };

  // ... (Camera Logic, Voice Input Logic, Analysis Logic remain largely unchanged, but using changeStep instead of setStep)
  // --- Camera Logic ---
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    let isCancelled = false;

    const startCamera = async () => {
      // 1. Check for Secure Context (HTTPS)
      if (!window.isSecureContext) {
        if (!isCancelled) {
            setPermissionError(true);
            setCameraErrorMsg('摄像头需要HTTPS安全连接，当前环境不安全。');
        }
        return;
      }

      // 2. Check Browser Support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (!isCancelled) {
            setPermissionError(true);
            setCameraErrorMsg('您的浏览器不支持摄像头调用。');
        }
        return;
      }

      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false 
        });
        
        if (isCancelled) {
            mediaStream.getTracks().forEach(track => track.stop());
            return;
        }

        activeStream = mediaStream;
        setStream(mediaStream);
        setPermissionError(false);
        setCameraErrorMsg('');
      } catch (err: any) {
        if (isCancelled) return;
        console.error("Camera error:", err);
        setPermissionError(true);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            setCameraErrorMsg('摄像头权限被拒绝，请允许访问。');
        } else if (err.name === 'NotFoundError') {
            setCameraErrorMsg('未检测到摄像头设备。');
        } else {
            setCameraErrorMsg('摄像头启动失败：' + (err.message || '未知错误'));
        }
      }
    };
    
    if (step === DiagnosisStep.WANG && !stream) startCamera();
    
    return () => {
      isCancelled = true;
      if (activeStream) {
          activeStream.getTracks().forEach(track => track.stop());
      }
      // Clear stream state when leaving the step or unmounting
      setStream(null);
    };
  }, [step]);

  useEffect(() => {
    // Ensure video plays when stream is available
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(e => console.error("Video play failed:", e));
    }
  }, [stream, step]);

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Check if video is ready
    if (video.videoWidth === 0 || video.videoHeight === 0) {
        alert("摄像头画面尚未准备好，请稍后重试");
        return;
    }

    const context = canvas.getContext('2d');
    if (!context) return;
    
    // Scale down for faster upload (max 800px width)
    const scale = Math.min(1, 800 / video.videoWidth);
    canvas.width = video.videoWidth * scale;
    canvas.height = video.videoHeight * scale;
    
    // Mirror the capture to match the mirrored preview
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setImages(prev => ({ ...prev, [wangType]: dataUrl }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simple validation
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        alert("请上传图片或视频文件");
        return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const result = event.target?.result as string;
      // Compress uploaded image too
      const compressed = await resizeImage(result);
      setImages(prev => ({ ...prev, [wangType]: compressed }));
    };
    reader.readAsDataURL(file);
  };

  const triggerFileUpload = () => {
      fileInputRef.current?.click();
  };

  // --- Voice Input Logic (Web Speech API + MediaRecorder) ---
  const toggleSpeechToText = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'zh-CN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setWenAudioText(prev => prev + (prev ? ' ' : '') + transcript);
      };
      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        alert("语音识别启动失败，请使用键盘输入。");
      };
      recognition.start();
    } else {
      alert("您的浏览器不支持语音输入，请手动输入。");
    }
  };

  const startRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];
        
        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                audioChunksRef.current.push(e.data);
            }
        };
        
        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = () => {
                const base64String = (reader.result as string).split(',')[1];
                setAudioBase64(base64String);
            };
            stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorder.start();
        setIsRecording(true);
    } catch (err) {
        alert("无法启动录音: " + err);
    }
  };

  const stopRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
      }
  };

  const toggleRecording = () => {
      if (isRecording) {
          stopRecording();
      } else {
          startRecording();
      }
  };

  // --- Analysis Logic ---
  const startAnalysis = async () => {
    changeStep(DiagnosisStep.ANALYSIS);
    setRealtimeReasoning('');
    setRealtimeContent('');
    setIsConnected(false);
    setError(null);
    
    try {
      let finalContent = '';
      let finalReasoning = '';
      
      // Ensure we have results or at least wait a bit if they are loading?
      // For now we pass the current state.
      
      const res = await generateFinalDiagnosis(
        wangResult || "（系统提示：望诊分析尚未生成，可能由于网络原因或处理延迟）",
        wenResult || "（系统提示：闻诊分析尚未生成）",
        wenAudioText,
        inquiryData,
        qieData,
        (content, reasoning) => {
          finalContent = content;
          finalReasoning = reasoning;
          setRealtimeContent(content);
          setRealtimeReasoning(reasoning);
        },
        () => setIsConnected(true)
      );
      
      // Double check in case stream loop returned early
      finalContent = res.content || finalContent;
      finalReasoning = res.reasoning || finalReasoning;

      let parsedData: DiagnosisReport | undefined;
      try {
          const cleanJson = finalContent.replace(/```json/g, '').replace(/```/g, '').trim();
          parsedData = JSON.parse(cleanJson);
      } catch (e) {
          console.warn("Failed to parse JSON response, falling back to raw text", e);
      }

      setReport({ content: finalContent, reasoning: finalReasoning, parsed: parsedData });
      if (parsedData) {
          saveToHistory(parsedData);
      }
      changeStep(DiagnosisStep.REPORT);
    } catch (error: any) {
      console.error(error);
      // Instead of resetting to QIE immediately, we show the error state
      setError(error.message || '请求失败，请检查网络连接');
    }
  };

  // --- Navigation Helper ---
  const goBack = () => {
    switch (step) {
      case DiagnosisStep.WANG: changeStep(DiagnosisStep.INTRO); break;
      case DiagnosisStep.WEN_AUDIO: changeStep(DiagnosisStep.WANG); break;
      case DiagnosisStep.WEN_INQUIRY: changeStep(DiagnosisStep.WEN_AUDIO); break;
      case DiagnosisStep.QIE: changeStep(DiagnosisStep.WEN_INQUIRY); break;
      case DiagnosisStep.ANALYSIS: changeStep(DiagnosisStep.QIE); break;
      case DiagnosisStep.REPORT: changeStep(DiagnosisStep.INTRO); break;
      default: changeStep(DiagnosisStep.INTRO);
    }
  };

  // --- Renders ---

  const renderIntro = () => (
    <div className="flex-1 flex flex-col bg-stone-900 text-white overflow-hidden h-full">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className={`flex flex-col items-center transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isIntroShifted ? 'mt-10 mb-0' : 'mt-[25vh] mb-[25vh]'}`}>
            <div className="mb-6 p-6 bg-emerald-900/30 rounded-full border border-emerald-500/30">
                <ScanEye size={64} className="text-emerald-400" />
            </div>
            <h2 className="text-3xl font-serif font-bold mb-4">望闻问切 · 智能辨证</h2>
            <p className="text-stone-400 max-w-md mb-8 leading-relaxed text-center">
                系统将引导您完成中医四诊流程。<br/>
                利用大模型视觉能力分析面色与舌象，结合问诊信息，为您生成精准的健康报告。
            </p>
            <button 
                onClick={() => {
                    // Reset all data for new diagnosis
                    setImages({ face: null, tongue: null });
                    setWenAudioText('');
                    setInquiryData({ hanRe: '', han: '', touShen: '', bian: '', yinShi: '', xiong: '', ke: '', other: '' });
                    setQieData('');
                    setStream(null); // Ensure stream is reset
                    changeStep(DiagnosisStep.WANG);
                }}
                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-full font-bold text-lg shadow-lg shadow-emerald-900/50 transition-all flex items-center gap-2"
            >
                开始新诊断 <ChevronRight />
            </button>
        </div>

        {/* History Section */}
        {(history.length > 0 || isLoadingHistory) && (
            <div className={`max-w-md mx-auto mt-12 border-t border-stone-800 pt-8 transition-all duration-1000 ease-out delay-500 ${isIntroShifted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
                <h3 className="text-lg font-bold text-stone-400 mb-4 flex items-center gap-2">
                    <Clock size={18}/> 历史记录
                </h3>
                <div className="space-y-3">
                    {isLoadingHistory ? (
                        // Skeleton Loading State
                        [1, 2, 3].map((i) => (
                             <div key={i} className="bg-stone-800/30 border border-stone-700/50 p-4 rounded-xl flex items-center justify-between animate-pulse">
                                <div className="flex items-center gap-4 w-full">
                                    <div className="w-10 h-10 bg-stone-700/50 rounded-lg flex-shrink-0"></div>
                                    <div className="space-y-2 flex-1">
                                        <div className="w-3/4 h-4 bg-stone-700/50 rounded"></div>
                                        <div className="w-1/2 h-3 bg-stone-700/30 rounded"></div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        history.map(item => (
                            <div 
                                key={item.id}
                                onClick={() => viewHistoryItem(item)}
                                className="bg-stone-800/50 hover:bg-stone-800 border border-stone-700 p-4 rounded-xl cursor-pointer transition-all flex items-center justify-between group animate-fade-in"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-stone-700 rounded-lg">
                                        <FileText size={20} className="text-emerald-500"/>
                                    </div>
                                    <div>
                                        <p className="font-bold text-stone-200">{item.diagnosis}</p>
                                        <p className="text-xs text-stone-500 flex items-center gap-1 mt-1">
                                            <Calendar size={10}/>
                                            {new Date(item.date).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    onClick={(e) => deleteHistory(item.id, e)}
                                    className="p-2 text-stone-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={16}/>
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        )}
      </div>
    </div>
  );

  const renderWang = () => (
    <div className="flex-1 flex flex-col bg-black relative h-full">
      {/* Header with Back Button */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
        <button onClick={goBack} className="text-white p-2 bg-black/20 rounded-full backdrop-blur hover:bg-black/40">
           <ChevronLeft size={24}/>
        </button>
        <span className="text-white/80 font-bold tracking-wider text-sm">步骤 1/4：望诊</span>
        <div className="w-10"></div> {/* Spacer */}
      </div>

      {/* Camera View */}
      <div className="relative flex-1 overflow-hidden bg-stone-900">
        {!permissionError ? (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]" 
          />
        ) : (
           /* Fallback when no camera */
          <div className="flex flex-col h-full items-center justify-center text-stone-500 p-6 text-center">
             <AlertCircle className="mb-4 text-red-500" size={48}/> 
             <p className="text-lg font-bold mb-2 text-stone-300">无法启动摄像头</p>
             <p className="text-sm text-stone-400 max-w-xs mb-4">{cameraErrorMsg || '未检测到摄像头或权限被拒绝'}</p>
             <p className="text-sm bg-stone-800 px-4 py-2 rounded-lg">请点击下方 <Upload size={14} className="inline mx-1"/> 按钮上传照片</p>
          </div>
        )}
        
        {/* Overlays */}
        {!permissionError && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {wangType === 'face' ? (
                <div className="w-64 h-80 border-2 border-emerald-400/50 rounded-[40%] shadow-[0_0_50px_rgba(16,185,129,0.2)] relative animate-pulse">
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 text-emerald-300 bg-black/50 px-3 py-1 rounded text-xs">请将面部对准框内</div>
                    <div className="absolute w-full h-[1px] bg-emerald-400/20 top-[40%]"></div>
                </div>
            ) : (
                <div className="w-40 h-48 border-2 border-pink-400/50 rounded-b-full rounded-t-3xl shadow-[0_0_50px_rgba(244,114,182,0.2)] relative mt-12 animate-pulse">
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-pink-300 bg-black/50 px-3 py-1 rounded text-xs whitespace-nowrap">请伸出舌头，放松舌体</div>
                </div>
            )}
            </div>
        )}

        {/* Capture Controls */}
        <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-6 z-10 pointer-events-auto">
          <div className="flex bg-black/40 backdrop-blur rounded-full p-1 border border-white/10">
            <button 
              onClick={() => setWangType('face')}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-colors ${wangType === 'face' ? 'bg-emerald-600 text-white' : 'text-stone-300 hover:text-white'}`}
            >
              望面色
            </button>
            <button 
              onClick={() => setWangType('tongue')}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-colors ${wangType === 'tongue' ? 'bg-pink-600 text-white' : 'text-stone-300 hover:text-white'}`}
            >
              望舌象
            </button>
          </div>
          
          <div className="flex items-center gap-8">
             <input 
                type="file" 
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
             />
             
             {/* Upload Button */}
             <button 
               onClick={triggerFileUpload}
               className="w-14 h-14 rounded-full bg-stone-800 border border-stone-600 flex items-center justify-center hover:bg-stone-700 active:scale-95 transition-all text-stone-300"
               title="上传照片"
             >
               <Upload size={24} />
             </button>

             {/* Capture Button - Only if no error */}
             {!permissionError && (
                 <button 
                    onClick={captureImage}
                    className="w-20 h-20 rounded-full border-4 border-white/80 bg-white/20 hover:bg-white/40 active:scale-95 transition-all flex items-center justify-center"
                 >
                 <Camera size={32} className="text-white" />
                 </button>
             )}

             <div className="w-14 h-14" /> 
          </div>
          
          <p className="text-xs text-stone-400 bg-black/50 px-3 py-1 rounded-full">
            {permissionError ? '请上传照片进行诊断' : '点击拍照或上传照片'}
          </p>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="h-24 bg-stone-900 border-t border-stone-800 flex items-center justify-between px-6 z-20">
        <div className="flex gap-4">
          <div 
            onClick={() => setWangType('face')}
            className={`relative w-16 h-16 rounded-lg border overflow-hidden cursor-pointer transition-colors ${wangType === 'face' ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-stone-700 bg-stone-800'}`}
          >
             {images.face ? <img src={images.face} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-stone-600 text-xs">面部</div>}
             {images.face && <div className="absolute bottom-0 right-0 bg-emerald-500 text-white p-0.5"><Check size={10}/></div>}
          </div>
          <div 
            onClick={() => setWangType('tongue')}
            className={`relative w-16 h-16 rounded-lg border overflow-hidden cursor-pointer transition-colors ${wangType === 'tongue' ? 'border-pink-500 ring-2 ring-pink-500/30' : 'border-stone-700 bg-stone-800'}`}
          >
             {images.tongue ? <img src={images.tongue} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-stone-600 text-xs">舌象</div>}
             {images.tongue && <div className="absolute bottom-0 right-0 bg-emerald-500 text-white p-0.5"><Check size={10}/></div>}
          </div>
        </div>
        <button 
          onClick={() => {
              // Strict validation logic
              if (!images.face) {
                  alert("请先拍摄或上传面部照片");
                  setWangType('face');
                  return;
              }
              if (!images.tongue) {
                  alert("请拍摄或上传舌象照片");
                  setWangType('tongue');
                  return;
              }
              
              changeStep(DiagnosisStep.WEN_AUDIO);
              
              // Trigger background Wang Analysis
              if (stepStatus.wang === 'idle' || stepStatus.wang === 'error') {
                  setStepStatus(prev => ({ ...prev, wang: 'loading' }));
                  analyzeImageWithQwenVL(images.face, images.tongue)
                    .then(res => {
                        setWangResult(res.content);
                        setStepStatus(prev => ({ ...prev, wang: 'success' }));
                    })
                    .catch(e => {
                        console.error("Wang Analysis Failed", e);
                        setStepStatus(prev => ({ ...prev, wang: 'error' }));
                    });
              }
          }}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
        >
          下一步 <ChevronRight size={16}/>
        </button>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );

  const renderWenAudio = () => (
    <div className="flex-1 flex flex-col bg-stone-50 text-stone-800 p-6 overflow-y-auto h-full">
      <div className="max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between mb-2">
            <button onClick={goBack} className="text-stone-500 hover:text-stone-800 p-1">
                <ChevronLeft size={24}/>
            </button>
            <span className="text-xs text-stone-400 font-bold uppercase">步骤 2/4</span>
            <div className="w-6"></div>
        </div>
        
        <h3 className="text-2xl font-serif font-bold text-emerald-900 mb-2 flex items-center gap-2">
           <Ear className="text-emerald-600"/> 闻诊 · 听声息
        </h3>
        <p className="text-stone-500 mb-8 text-sm">请录制一段您的说话声音（如读一段文字）和几次咳嗽声，供AI分析语调与气息。</p>

        {/* Audio Recording Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 mb-6">
            <label className="block font-bold text-stone-700 mb-3 flex justify-between">
                <span>录音采集 (Qwen-Omni 分析)</span>
                {audioBase64 && <span className="text-emerald-600 text-xs flex items-center gap-1"><Check size={12}/> 已录制</span>}
            </label>
            <div className="flex flex-col items-center justify-center p-8 bg-stone-50 rounded-xl border-2 border-dashed border-stone-300">
                <button 
                    onClick={toggleRecording}
                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)] scale-110' : (audioBase64 ? 'bg-emerald-500' : 'bg-stone-800')}`}
                >
                    {isRecording ? <div className="w-8 h-8 bg-white rounded"></div> : <Mic size={32} className="text-white"/>}
                </button>
                <p className="mt-4 text-sm text-stone-500 font-medium">
                    {isRecording ? '正在录音... 点击停止' : (audioBase64 ? '录音完成，可点击重录' : '点击开始录音')}
                </p>
            </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
           <label className="block font-bold text-stone-700 mb-3">补充描述 (主观感受)</label>
           <div className="relative">
             <textarea 
                value={wenAudioText}
                onChange={e => setWenAudioText(e.target.value)}
                placeholder="例如：最近说话声音比较小，感觉气短。咳嗽声音很重，有痰鸣声。早起口苦口臭..."
                className="w-full p-4 pb-12 bg-stone-50 border border-stone-300 rounded-xl min-h-[120px] focus:ring-2 focus:ring-emerald-500 outline-none"
             />
             <button 
               onClick={toggleSpeechToText}
               className={`absolute bottom-4 right-4 p-2 rounded-full transition-all ${isListening ? 'bg-red-500 animate-pulse text-white' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
               title="语音转文字"
             >
               {isListening ? <MicOff size={20}/> : <MessageSquare size={20}/>}
             </button>
           </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button 
            onClick={goBack}
            className="px-6 py-3 rounded-full font-bold text-stone-500 hover:bg-stone-200 transition-all"
          >
            上一步
          </button>
          <button 
            onClick={() => {
                changeStep(DiagnosisStep.WEN_INQUIRY);
                
                // Trigger background Wen Analysis
                if (audioBase64) {
                    if (stepStatus.wen === 'idle' || stepStatus.wen === 'error') {
                        setStepStatus(prev => ({ ...prev, wen: 'loading' }));
                        analyzeAudioWithQwenOmni(audioBase64, wenAudioText)
                            .then(res => {
                                setWenResult(res.content);
                                setStepStatus(prev => ({ ...prev, wen: 'success' }));
                            })
                            .catch(e => {
                                console.error("Wen Analysis Failed", e);
                                setStepStatus(prev => ({ ...prev, wen: 'error' }));
                            });
                    }
                } else {
                    setWenResult('用户未录制音频，仅提供了文字描述。');
                    setStepStatus(prev => ({ ...prev, wen: 'success' }));
                }
            }}
            className="bg-emerald-800 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-emerald-900 transition-all flex items-center gap-2"
          >
            下一步 <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderWenInquiry = () => (
    <div className="flex-1 flex flex-col bg-stone-50 text-stone-800 p-6 overflow-y-auto h-full">
      <div className="max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between mb-2">
            <button onClick={goBack} className="text-stone-500 hover:text-stone-800 p-1">
                <ChevronLeft size={24}/>
            </button>
            <span className="text-xs text-stone-400 font-bold uppercase">步骤 3/4</span>
            <div className="w-6"></div>
        </div>

        <h3 className="text-2xl font-serif font-bold text-emerald-900 mb-2 flex items-center gap-2">
           <MessageSquare className="text-emerald-600"/> 问诊 · 十问歌
        </h3>
        <p className="text-stone-500 mb-6 text-sm">“一问寒热二问汗，三问头身四问便...”。请根据您的实际感受简要回答。</p>

        <div className="space-y-4">
           {[
             { id: 'hanRe', label: '1. 寒热', placeholder: '怕冷还是怕热？有无发烧？' },
             { id: 'han', label: '2. 汗液', placeholder: '平时出汗多吗？白天还是晚上出汗？' },
             { id: 'touShen', label: '3. 头身', placeholder: '头痛吗？身体沉重或酸痛吗？' },
             { id: 'bian', label: '4. 二便', placeholder: '大便干结还是溏稀？小便颜色？' },
             { id: 'yinShi', label: '5. 饮食', placeholder: '胃口如何？喜欢吃热还是吃凉？' },
             { id: 'xiong', label: '6. 胸腹', placeholder: '胸闷气短吗？腹部胀痛吗？' },
             { id: 'ke', label: '7. 渴/听', placeholder: '口渴吗？有无耳鸣？' },
             { id: 'other', label: '补充信息', placeholder: '既往病史或其他不适...' },
           ].map((item) => (
             <div key={item.id} className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
                <label className="block text-sm font-bold text-emerald-800 mb-1">{item.label}</label>
                <input 
                  value={(inquiryData as any)[item.id]}
                  onChange={e => setInquiryData({...inquiryData, [item.id]: e.target.value})}
                  placeholder={item.placeholder}
                  className="w-full text-sm p-2 border-b border-stone-200 focus:border-emerald-500 outline-none transition-colors"
                />
             </div>
           ))}
        </div>

        <div className="mt-8 flex justify-end pb-8 gap-4">
          <button 
            onClick={goBack}
            className="px-6 py-3 rounded-full font-bold text-stone-500 hover:bg-stone-200 transition-all"
          >
            上一步
          </button>
          <button 
            onClick={() => changeStep(DiagnosisStep.QIE)}
            className="bg-emerald-800 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-emerald-900 transition-all flex items-center gap-2"
          >
            下一步 <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderQie = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-stone-900 text-white text-center h-full">
      <div className="w-full max-w-2xl flex items-center justify-between mb-8">
        <button onClick={goBack} className="text-stone-400 hover:text-white p-2 bg-stone-800 rounded-full">
            <ChevronLeft size={20}/>
        </button>
        <span className="text-xs text-stone-500 font-bold uppercase">步骤 4/4</span>
        <div className="w-10"></div>
      </div>

      <div className="mb-6 p-6 bg-stone-800 rounded-full">
        <Activity size={64} className="text-stone-500" />
      </div>
      <h2 className="text-2xl font-serif font-bold mb-4">切诊 · 脉象</h2>
      <div className="bg-stone-800/50 p-6 rounded-2xl max-w-md mb-8 border border-stone-700">
        <p className="text-stone-300 text-sm leading-relaxed mb-4 flex items-start gap-2 text-left">
          <Info className="flex-shrink-0 text-emerald-500 mt-0.5" size={16}/>
          <span>
            中医脉诊需要医者指端触觉感知脉搏的“位、数、形、势”。由于线上诊疗的物理限制，目前无法进行真实的切诊。
          </span>
        </p>
        <p className="text-stone-400 text-sm text-left">
          如果您之前有过医生的脉诊记录（如：脉浮紧、脉细数），请在下方填写，这将有助于大模型更精准的判断。
        </p>
        <input 
          value={qieData}
          onChange={e => setQieData(e.target.value)}
          placeholder="例如：脉细数，按之无力 (选填)"
          className="w-full mt-4 p-3 bg-black/30 border border-stone-600 rounded-lg text-white placeholder-stone-600 focus:border-emerald-500 outline-none"
        />
      </div>

      <button 
        onClick={startAnalysis}
        className="px-10 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-full font-bold text-lg shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center gap-2"
      >
        <Zap size={20} className="fill-current"/> 生成四诊合参报告
      </button>
    </div>
  );

  const renderReport = () => (
    <div className="flex-1 flex flex-col overflow-hidden bg-stone-950 text-white h-full">
      <div className="bg-stone-900 p-4 flex items-center justify-between shadow-md z-10 border-b border-stone-800">
        <div className="flex items-center gap-3">
            <button onClick={() => changeStep(DiagnosisStep.INTRO)} className="p-1 hover:bg-stone-800 rounded-full">
                <ChevronLeft size={20} className="text-stone-400"/>
            </button>
            <h2 className="text-xl font-serif font-bold text-emerald-400 flex items-center gap-2">
            <FileText /> 诊断报告
            </h2>
        </div>
        <button onClick={() => changeStep(DiagnosisStep.INTRO)} className="text-sm text-stone-400 hover:text-white flex items-center gap-1 transition-colors">
           <RefreshCw size={14}/> 返回首页
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
         {step === DiagnosisStep.ANALYSIS ? (
           <div className="flex flex-col h-full max-w-3xl mx-auto space-y-6 pt-10">
             
             {error ? (
                // Error State UI
                <div className="flex flex-col items-center justify-center bg-red-900/20 border border-red-500/50 p-8 rounded-2xl animate-fade-in max-w-md mx-auto mt-10">
                   <AlertTriangle size={48} className="text-red-500 mb-4" />
                   <h3 className="text-xl font-bold text-red-400 mb-2">诊断分析中断</h3>
                   <p className="text-stone-300 text-center mb-6">{error}</p>
                   <div className="flex gap-4">
                     <button 
                        onClick={() => changeStep(DiagnosisStep.QIE)}
                        className="px-6 py-2 bg-stone-800 hover:bg-stone-700 rounded-full text-white transition-colors"
                     >
                       返回上一步
                     </button>
                     <button 
                        onClick={startAnalysis}
                        className="px-6 py-2 bg-red-600 hover:bg-red-500 rounded-full text-white font-bold flex items-center gap-2 transition-colors"
                     >
                       <RotateCcw size={16}/> 重试
                     </button>
                   </div>
                </div>
             ) : (
                // Loading / Streaming State
                <>
                <div className="flex flex-col items-center justify-center space-y-6 mb-8">
                    <div className="relative">
                    <div className="w-16 h-16 border-4 border-emerald-900 rounded-full"></div>
                    <div className="w-16 h-16 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
                    </div>
                    <div className="text-center">
                    <p className="text-xl font-bold text-emerald-100 mb-2">正在进行多模态辨证...</p>
                    <p className="text-sm text-stone-500">Qwen-VL 大模型正在分析您的面色、舌象与问诊数据</p>
                    </div>
                </div>
                
                <div className="flex-1 bg-stone-900/80 rounded-xl border border-stone-800 p-6 overflow-hidden flex flex-col shadow-inner">
                    <div className="flex items-center gap-2 text-emerald-500 mb-4 border-b border-stone-800 pb-2">
                    <Sparkles size={16} className={realtimeReasoning ? "animate-pulse" : ""}/> 
                    <span className="text-sm font-bold uppercase tracking-wider">
                        {realtimeReasoning ? "AI 思考过程" : (
                            realtimeContent ? "正在生成诊断报告..." : 
                            (isConnected ? "已连接，大模型思考中..." : "连接云端计算中...")
                        )}
                    </span>
                    </div>
                    <div className="flex-1 overflow-y-auto font-mono text-sm text-stone-400 leading-relaxed space-y-2 pr-2 custom-scrollbar">
                    {realtimeReasoning ? (
                        <p className="whitespace-pre-wrap">{realtimeReasoning}</p>
                    ) : (
                        <div className="flex flex-col gap-2">
                        {realtimeContent && (
                            <div className="p-3 bg-stone-800/50 rounded-lg border border-stone-700/50">
                                <p className="text-stone-300 font-sans opacity-75 text-xs mb-1">预览内容:</p>
                                <p className="text-stone-400 line-clamp-3">{realtimeContent.slice(0, 200)}...</p>
                            </div>
                        )}
                        <p className="text-stone-600 italic flex items-center gap-2">
                            <Loader2 size={14} className="animate-spin"/>
                            {realtimeContent 
                                ? "深度推理完成，正在输出详细报告..."
                                : (isConnected ? "Qwen-VL 正在分析图像特征..." : "正在建立安全连接 (压缩上传中)...")}
                        </p>
                        </div>
                    )}
                    {(realtimeReasoning || realtimeContent) && <div className="w-2 h-4 bg-emerald-500 animate-pulse inline-block ml-1"></div>}
                    </div>
                </div>
                </>
             )}
           </div>
         ) : (
           <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
              {/* Context Summary */}
              <div className="flex gap-4 overflow-x-auto pb-4 border-b border-stone-800 scrollbar-hide">
                 {images.face && (
                    <div className="flex-shrink-0 relative group">
                        <img src={images.face} className="h-20 w-20 object-cover rounded-lg border border-stone-700"/>
                        <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1 rounded">面诊</span>
                    </div>
                 )}
                 {images.tongue && (
                    <div className="flex-shrink-0 relative group">
                        <img src={images.tongue} className="h-20 w-20 object-cover rounded-lg border border-stone-700"/>
                        <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1 rounded">舌诊</span>
                    </div>
                 )}
                 {wenAudioText && (
                    <div className="h-20 w-48 bg-stone-900 rounded-lg p-3 text-xs text-stone-400 overflow-hidden border border-stone-800">
                        <span className="font-bold text-stone-300 block mb-1">主诉概要:</span>
                        <p className="line-clamp-2">{wenAudioText}</p>
                    </div>
                 )}
              </div>

              {report?.parsed ? (
                  <>
                    {/* Diagnosis Card */}
                    <div className="bg-gradient-to-br from-emerald-900/50 to-stone-900 border border-emerald-800/50 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-xl">
                        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                            <Activity size={200} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2 text-emerald-400 text-sm font-bold uppercase tracking-wider">
                                <Zap size={16}/> 核心辨证
                            </div>
                            <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
                                {report.parsed.diagnosis}
                            </h1>
                            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-stone-200 leading-relaxed">
                                <span className="text-emerald-400 font-bold mr-2">病机分析:</span>
                                {report.parsed.pathology}
                            </div>
                        </div>
                    </div>

                    {/* Reasoning Accordion (Optional) */}
                    {report.reasoning && (
                        <details className="group bg-stone-900 rounded-xl border border-stone-800 overflow-hidden">
                            <summary className="p-4 cursor-pointer flex items-center justify-between text-stone-400 hover:text-stone-300">
                                <span className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold"><Zap size={14}/> 查看AI推演过程</span>
                                <ChevronRight size={16} className="transform group-open:rotate-90 transition-transform"/>
                            </summary>
                            <div className="p-4 pt-0 text-stone-500 text-sm italic leading-relaxed border-t border-stone-800/50">
                                {report.reasoning}
                            </div>
                        </details>
                    )}

                    {/* Suggestions Grid */}
                    <div className="grid md:grid-cols-3 gap-4">
                        {/* Diet */}
                        <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl hover:border-emerald-800/50 transition-colors">
                            <div className="w-10 h-10 bg-amber-900/30 rounded-full flex items-center justify-center text-amber-500 mb-4">
                                <Utensils size={20}/>
                            </div>
                            <h3 className="text-lg font-bold text-stone-200 mb-2">饮食调理</h3>
                            <p className="text-stone-400 text-sm leading-relaxed">
                                {report.parsed.suggestions.diet}
                            </p>
                        </div>

                        {/* Lifestyle */}
                        <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl hover:border-indigo-800/50 transition-colors">
                            <div className="w-10 h-10 bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-400 mb-4">
                                <Moon size={20}/>
                            </div>
                            <h3 className="text-lg font-bold text-stone-200 mb-2">作息与运动</h3>
                            <p className="text-stone-400 text-sm leading-relaxed">
                                {report.parsed.suggestions.lifestyle}
                            </p>
                        </div>

                        {/* Acupoints */}
                        <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl hover:border-rose-800/50 transition-colors">
                            <div className="w-10 h-10 bg-rose-900/30 rounded-full flex items-center justify-center text-rose-400 mb-4">
                                <HandMetal size={20}/>
                            </div>
                            <h3 className="text-lg font-bold text-stone-200 mb-2">穴位按摩</h3>
                            <p className="text-stone-400 text-sm leading-relaxed">
                                {report.parsed.suggestions.acupoints}
                            </p>
                        </div>
                    </div>
                  </>
              ) : (
                  // Fallback for non-JSON or error
                  <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800">
                    <h3 className="text-red-400 font-bold mb-4">解析异常</h3>
                     <div className="prose prose-invert prose-lg max-w-none">
                        <div className="whitespace-pre-wrap leading-relaxed">
                          {report?.content}
                        </div>
                     </div>
                  </div>
              )}
           </div>
         )}
      </div>
    </div>
  );

  return (
    <div className="flex-1 relative overflow-hidden bg-stone-950 h-full">
      <SlideTransition position={getSlidePosition(DiagnosisStep.INTRO)}>
        {renderIntro()}
      </SlideTransition>
      <SlideTransition position={getSlidePosition(DiagnosisStep.WANG)}>
        {renderWang()}
      </SlideTransition>
      <SlideTransition position={getSlidePosition(DiagnosisStep.WEN_AUDIO)}>
        {renderWenAudio()}
      </SlideTransition>
      <SlideTransition position={getSlidePosition(DiagnosisStep.WEN_INQUIRY)}>
        {renderWenInquiry()}
      </SlideTransition>
      <SlideTransition position={getSlidePosition(DiagnosisStep.QIE)}>
        {renderQie()}
      </SlideTransition>
      {/* Group Analysis and Report together */}
      <SlideTransition position={getSlidePosition(DiagnosisStep.ANALYSIS)}>
        {renderReport()}
      </SlideTransition>
    </div>
  );
};

export default ARDiagnosis;