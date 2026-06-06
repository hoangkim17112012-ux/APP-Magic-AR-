import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Palette,
  Sparkles,
  BookOpen,
  Volume2,
  VolumeX,
  Smile,
  ChevronRight,
  Camera,
  Trash2,
  Eraser,
  Undo2,
  CheckCircle,
  X,
  Play,
  HelpCircle,
  Award,
  Video,
  VideoOff,
  UserPlus,
  GraduationCap
} from "lucide-react";
import { SavedArtwork, StudentSubmission, TabType, TemplateType } from "./types";
import Gallery3D from "./components/Gallery3D";

// Playful backgrounds for kids' sea drawings
interface OceanScene {
  id: string;
  name: string;
  emoji: string;
  url: string;
  description: string;
}

const oceanScenes: OceanScene[] = [
  {
    id: "underwater_coral",
    name: "Lòng Đại Dương 🐠",
    emoji: "🐳",
    url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80",
    description: "Khung cảnh sâu thẳm lung linh tia nắng rọi qua dòng nước xanh ngọc tuyệt đẹp",
  },
  {
    id: "sunset_ocean",
    name: "Vùng Biển Xanh 🌊",
    emoji: "🏝️",
    url: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1200&q=80",
    description: "Nước biển xanh ngắt lấp lánh hòa cùng bầu trời rực sáng thơ mộng",
  },
  {
    id: "coral_reef_magic",
    name: "San Hô Đại Dương 🪸",
    emoji: "🪸",
    url: "https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&w=1200&q=80",
    description: "Rạn san hô đầy màu sắc rực rỡ kì ảo lấp lánh dưới đáy đại dương nhiệm màu",
  },
];

const recommendedScenes: Record<TemplateType, string> = {
  whale: "underwater_coral",
  dolphin: "sunset_ocean",
  goldfish: "coral_reef_magic",
  shark: "underwater_coral",
  turtle: "coral_reef_magic",
  octopus: "coral_reef_magic",
};

// Playful colors for kids
const kidColors = [
  { hex: "#ef4444", name: "Đỏ Mặt Trời ☀️" },
  { hex: "#f97316", name: "Cam Ấm Áp 🍊" },
  { hex: "#facc15", name: "Vàng Rực Rỡ 🌻" },
  { hex: "#22c55e", name: "Xanh Lá Cây 🌳" },
  { hex: "#3b82f6", name: "Xanh Da Trời 🐳" },
  { hex: "#a855f7", name: "Tím Thủy Tiên 🍇" },
  { hex: "#ec4899", name: "Hồng Kẹo Gấu 🍬" },
  { hex: "#000000", name: "Đen Phép Thuật 🎩" }
];

const stemFacts = [
  "Bé có biết Cá Voi Xanh là loài động vật lớn nhất từng sống trên Trái Đất, lớn hơn cả những loài khủng long khổng lồ ngày xưa không?",
  "Cá Heo cực kỳ thông minh và có thể gọi nhau bằng những 'tiếng huýt' riêng biệt giống như tên gọi của con người vậy!",
  "Tốc độ bơi tối đa của Rùa Biển có thể lên tới 35 km/h, giúp các bạn rùa dễ dàng vượt hàng ngàn cây số đại dương bao la!",
  "Bạch Tuộc có tới 3 trái tim ấm áp và đặc biệt hơn cả là dòng máu của các bạn ấy lại mang sắc xanh lam vô cùng kỳ thú!"
];

const initialSubmissions: StudentSubmission[] = [
  {
    id: "sub-1",
    name: "Nguyễn Lâm",
    className: "Lớp 3A",
    artworkType: "Cá Heo",
    timeAgo: "10 phút trước",
    sampleImg: "dolphin",
    analyzed: false,
  },
  {
    id: "sub-2",
    name: "Mai Hoa",
    className: "Lớp 3A",
    artworkType: "Rùa Biển",
    timeAgo: "1 giờ trước",
    sampleImg: "turtle",
    analyzed: false,
  },
  {
    id: "sub-3",
    name: "Tuấn Hải",
    className: "Lớp 3B",
    artworkType: "Cá Voi Xanh",
    timeAgo: "3 giờ trước",
    sampleImg: "whale",
    analyzed: false,
  }
];

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("color-scan");
  
  // Game & Reward stats
  const [stars, setStars] = useState(120);
  const [activeBadge, setActiveBadge] = useState("Họa Sĩ Nhí 🎨");
  const [stemFactIdx, setStemFactIdx] = useState(0);
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);

  // Canvas drawing state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>("whale");
  const [brushColor, setBrushColor] = useState("#ef4444");
  const [brushSize, setBrushSize] = useState(8);
  const [isEraser, setIsEraser] = useState(false);
  const drawingStateRef = useRef({ isDrawing: false, lastX: 0, lastY: 0 });
  const [canvasUrl, setCanvasUrl] = useState<string>("");

  // AR view simulation & Real hardware video
  const [isRealCameraOn, setIsRealCameraOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isARMusicOn, setIsARMusicOn] = useState(false);
  const [arSpeechText, setArSpeechText] = useState("Chào bạn nhỏ! Cùng bắt đầu tô vẽ và quét tranh nhé!");
  const [savedArtworks, setSavedArtworks] = useState<SavedArtwork[]>([]);

  // AR Live scanning states (Vietnampedagogy interactive upgrades)
  const [arScanning, setArScanning] = useState<boolean>(false);
  const [arScanProgress, setArScanProgress] = useState<number>(0);
  const [arScanSuccess, setArScanSuccess] = useState<boolean>(false);
  const [arProjecting, setArProjecting] = useState<boolean>(false);
  const [arActiveFilter, setArActiveFilter] = useState<string>("none");
  const [selectedOceanScene, setSelectedOceanScene] = useState<string>("underwater_coral");
  const [arMotionSpeed, setArMotionSpeed] = useState<number>(3);
  const [arSparkleCount, setArSparkleCount] = useState<number>(15);

  // Sound effects Web Audio API
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioIntervalRef = useRef<any>(null); // For background music synth loop

  // Color Mixer mini game State
  const [mixerA, setMixerA] = useState<string | null>(null);
  const [mixerB, setMixerB] = useState<string | null>(null);
  const [targetMixColor, setTargetMixColor] = useState({ name: "Màu Cam", components: ["red", "yellow"], hex: "#f97316" });
  const [mixFeedback, setMixFeedback] = useState<string | null>(null);
  const [mixSuccess, setMixSuccess] = useState<boolean | null>(null);
  
  // Shadow recognition game States
  const [shadowTarget, setShadowTarget] = useState<TemplateType>("whale");
  const [shadowFeedback, setShadowFeedback] = useState<string | null>(null);
  const [shadowScore, setShadowScore] = useState<number>(0);

  // Exhibition Start Showroom state
  const [isStartedShowRoom, setIsStartedShowRoom] = useState<boolean>(false);

  // Classroom & AI Feedback
  const [students, setStudents] = useState<StudentSubmission[]>(initialSubmissions);
  const [aiEvaluation, setAiEvaluation] = useState("Vui lòng chọn hoặc nộp bài vẽ để Cô Điệp AI phân tích sư phạm!");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentTemplate, setNewStudentTemplate] = useState<TemplateType>("whale");

  // Modals
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [rewardBadgeName, setRewardBadgeName] = useState("");
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [guideTab, setGuideTab] = useState<"student-guide" | "parent-guide" | "teacher-guide">("student-guide");

  // Web Audio synth triggers
  const playWebSynth = (type: "click" | "success" | "fail" | "magic") => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === "click") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(350, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.12);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === "success") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(330, now);
        osc.frequency.setValueAtTime(440, now + 0.08);
        osc.frequency.setValueAtTime(554, now + 0.16);
        osc.frequency.setValueAtTime(660, now + 0.24);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === "fail") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(90, now + 0.25);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === "magic") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(1400, now + 0.45);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
      }
    } catch (e) {
      console.log("Audio synth error:", e);
    }
  };

  // Real-time mixing calculator
  const getMixedColorHex = (a: string | null, b: string | null) => {
    if (!a && !b) return "#18181b"; // darkness/zinc-900 border
    if (a && !b) {
      return a === "red" ? "#ef4444" : a === "yellow" ? "#facc15" : a === "blue" ? "#3b82f6" : "#ffffff";
    }
    if (!a && b) {
      return b === "red" ? "#ef4444" : b === "yellow" ? "#facc15" : b === "blue" ? "#3b82f6" : "#ffffff";
    }
    const arr = [a, b].sort();
    if (arr[0] === "blue" && arr[1] === "yellow") return "#22c55e"; // Green
    if (arr[0] === "red" && arr[1] === "yellow") return "#f97316"; // Orange
    if (arr[0] === "blue" && arr[1] === "red") return "#a855f7"; // Purple
    if (arr[0] === "red" && arr[1] === "white") return "#fbcfe8"; // Pink
    return "#52525b"; // Combined mud-grey
  };

  // Web Speech synthesis is completely disabled as requested by the user
  const speakPedagogicalText = (text: string) => {
    // Suppress any spoken narration
    return;
  };

  // Background audio synthesised looping scenery music
  const startBackgroundScenerySound = () => {
    if (!isARMusicOn) {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      let step = 0;
      const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00]; // Pentatonic scale

      audioIntervalRef.current = setInterval(() => {
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.type = "sine";
          // soft cozy arpeggio
          const currentNote = notes[step % notes.length];
          osc.frequency.setValueAtTime(currentNote, ctx.currentTime);
          
          gain.gain.setValueAtTime(0.03, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2);
          
          osc.start();
          osc.stop(ctx.currentTime + 1.2);
          step++;
        } catch (e) {
          console.warn(e);
        }
      }, 1500);

      setIsARMusicOn(true);
      speakPedagogicalText("Đã mở âm thanh đại dương mĩ thuật êm ái!");
    } else {
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
      }
      setIsARMusicOn(false);
      speakPedagogicalText("Đã tắt âm thanh nhạc nền.");
    }
  };

  // Clean background music interval on unmount & warm up voices list
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
    }
    return () => {
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
      }
    };
  }, []);

  // Set initial templates on canvas on mount, resize, or template selection change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Responsive Canvas dimensions
    const rect = canvas.parentNode ? (canvas.parentNode as HTMLElement).getBoundingClientRect() : { width: 500, height: 350 };
    canvas.width = rect.width || 500;
    canvas.height = rect.height || 350;

    drawOutline(selectedTemplate, ctx, canvas.width, canvas.height);
    updateThumbnail();
  }, [selectedTemplate]);

  // Redraw the outline on canvas
  const drawOutline = (template: TemplateType, ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "#94a3b8"; // Slate level of gray contour
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (template === "whale") {
      ctx.beginPath();
      // Blue Whale main body
      ctx.moveTo(w * 0.15, h * 0.55);
      ctx.bezierCurveTo(w * 0.25, h * 0.2, w * 0.7, h * 0.2, w * 0.75, h * 0.5);
      // Tail fluke
      ctx.lineTo(w * 0.9, h * 0.38);
      ctx.lineTo(w * 0.88, h * 0.52);
      ctx.lineTo(w * 0.9, h * 0.66);
      ctx.lineTo(w * 0.75, h * 0.55);
      // Underbelly
      ctx.bezierCurveTo(w * 0.45, h * 0.8, w * 0.22, h * 0.75, w * 0.15, h * 0.55);
      ctx.stroke();

      // Fountain spout
      ctx.beginPath();
      ctx.moveTo(w * 0.48, h * 0.27);
      ctx.quadraticCurveTo(w * 0.44, h * 0.1, w * 0.38, h * 0.12);
      ctx.moveTo(w * 0.48, h * 0.27);
      ctx.quadraticCurveTo(w * 0.52, h * 0.1, w * 0.58, h * 0.12);
      ctx.stroke();

      // Friendly large eye
      ctx.beginPath();
      ctx.arc(w * 0.28, h * 0.48, 8, 0, Math.PI * 2);
      // Broad cute smile
      ctx.moveTo(w * 0.2, h * 0.58);
      ctx.quadraticCurveTo(w * 0.26, h * 0.65, w * 0.32, h * 0.58);
      ctx.stroke();
    } else if (template === "dolphin") {
      ctx.beginPath();
      // Dolphin sleek active body (jumping arc)
      ctx.moveTo(w * 0.12, h * 0.6);
      ctx.bezierCurveTo(w * 0.28, h * 0.18, w * 0.7, h * 0.25, w * 0.82, h * 0.5);
      // Tail fork
      ctx.lineTo(w * 0.92, h * 0.58);
      ctx.lineTo(w * 0.84, h * 0.52);
      ctx.lineTo(w * 0.9, h * 0.44);
      // Belly back
      ctx.quadraticCurveTo(w * 0.52, h * 0.48, w * 0.12, h * 0.6);
      ctx.stroke();

      // Fin on back
      ctx.beginPath();
      ctx.moveTo(w * 0.46, h * 0.27);
      ctx.quadraticCurveTo(w * 0.52, h * 0.12, w * 0.58, h * 0.29);
      ctx.stroke();

      // Eye & Beak/Mouth detail
      ctx.beginPath();
      ctx.arc(w * 0.22, h * 0.44, 6, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(w * 0.12, h * 0.6);
      ctx.lineTo(w * 0.06, h * 0.55);
      ctx.lineTo(w * 0.14, h * 0.5);
      ctx.stroke();
    } else if (template === "goldfish") {
      ctx.beginPath();
      // Cute bubbly goldfish body
      ctx.moveTo(w * 0.18, h * 0.5);
      ctx.quadraticCurveTo(w * 0.42, h * 0.16, w * 0.68, h * 0.5);
      ctx.quadraticCurveTo(w * 0.42, h * 0.84, w * 0.18, h * 0.5);
      ctx.stroke();

      // Big fan tail fins
      ctx.beginPath();
      ctx.moveTo(w * 0.68, h * 0.5);
      ctx.bezierCurveTo(w * 0.86, h * 0.22, w * 0.92, h * 0.3, w * 0.88, h * 0.5);
      ctx.bezierCurveTo(w * 0.92, h * 0.7, w * 0.86, h * 0.78, w * 0.68, h * 0.5);
      ctx.stroke();

      // Gills and big googly eye
      ctx.beginPath();
      ctx.arc(w * 0.32, h * 0.44, 11, 0, Math.PI * 2);
      ctx.stroke();

      // Pouty lips
      ctx.beginPath();
      ctx.arc(w * 0.14, h * 0.5, 6, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
    } else if (template === "shark") {
      ctx.beginPath();
      // Shark sleek dynamic contour
      ctx.moveTo(w * 0.14, h * 0.52);
      ctx.quadraticCurveTo(w * 0.4, h * 0.22, w * 0.74, h * 0.46);
      // Large vertical tail fin
      ctx.lineTo(w * 0.86, h * 0.26);
      ctx.lineTo(w * 0.8, h * 0.48);
      ctx.lineTo(w * 0.86, h * 0.7);
      ctx.lineTo(w * 0.72, h * 0.54);
      // Belly line
      ctx.quadraticCurveTo(w * 0.4, h * 0.78, w * 0.14, h * 0.52);
      ctx.stroke();

      // Big dorsal fin on top
      ctx.beginPath();
      ctx.moveTo(w * 0.4, h * 0.31);
      ctx.quadraticCurveTo(w * 0.52, h * 0.1, w * 0.52, h * 0.36);
      ctx.stroke();

      // Gill lines
      ctx.beginPath();
      ctx.moveTo(w * 0.33, h * 0.42);
      ctx.lineTo(w * 0.33, h * 0.52);
      ctx.moveTo(w * 0.36, h * 0.43);
      ctx.lineTo(w * 0.36, h * 0.51);
      ctx.stroke();

      // Eyes
      ctx.beginPath();
      ctx.arc(w * 0.24, h * 0.43, 5, 0, Math.PI * 2);
      ctx.stroke();
    } else if (template === "turtle") {
      ctx.beginPath();
      // Sea Turtle main dome shell
      ctx.moveTo(w * 0.26, h * 0.5);
      ctx.quadraticCurveTo(w * 0.5, h * 0.18, w * 0.74, h * 0.5);
      ctx.closePath();
      ctx.stroke();

      // Head
      ctx.beginPath();
      ctx.moveTo(w * 0.26, h * 0.45);
      ctx.quadraticCurveTo(w * 0.1, h * 0.38, w * 0.12, h * 0.56);
      ctx.quadraticCurveTo(w * 0.18, h * 0.62, w * 0.26, h * 0.52);
      ctx.stroke();

      // Big swim flippers (Front)
      ctx.beginPath();
      ctx.moveTo(w * 0.32, h * 0.5);
      ctx.quadraticCurveTo(w * 0.22, h * 0.84, w * 0.36, h * 0.78);
      ctx.quadraticCurveTo(w * 0.4, h * 0.58, w * 0.44, h * 0.5);
      // Back flipper
      ctx.moveTo(w * 0.62, h * 0.5);
      ctx.quadraticCurveTo(w * 0.58, h * 0.72, w * 0.68, h * 0.68);
      ctx.quadraticCurveTo(w * 0.68, h * 0.52, w * 0.7, h * 0.5);
      ctx.stroke();

      // Shell pattern guidelines
      ctx.beginPath();
      ctx.moveTo(w * 0.36, h * 0.38);
      ctx.lineTo(w * 0.46, h * 0.38);
      ctx.moveTo(w * 0.54, h * 0.38);
      ctx.lineTo(w * 0.64, h * 0.38);
      ctx.stroke();
    } else if (template === "octopus") {
      ctx.beginPath();
      // Octopus round bulbous head/mantle
      ctx.arc(w * 0.5, h * 0.38, 30, Math.PI, 0);
      // Sides
      ctx.lineTo(w * 0.65, h * 0.5);
      ctx.quadraticCurveTo(w * 0.5, h * 0.52, w * 0.35, h * 0.5);
      ctx.closePath();
      ctx.stroke();

      // Friendly eyes
      ctx.beginPath();
      ctx.arc(w * 0.44, h * 0.42, 5, 0, Math.PI * 2);
      ctx.moveTo(w * 0.56, h * 0.42);
      ctx.arc(w * 0.56, h * 0.42, 5, 0, Math.PI * 2);
      // Cute smile
      ctx.moveTo(w * 0.47, h * 0.46);
      ctx.quadraticCurveTo(w * 0.5, h * 0.5, w * 0.53, h * 0.46);
      ctx.stroke();

      // Hanging curly tentacles (4 loops)
      ctx.beginPath();
      // Tentacle 1
      ctx.moveTo(w * 0.37, h * 0.49);
      ctx.bezierCurveTo(w * 0.28, h * 0.68, w * 0.44, h * 0.78, w * 0.34, h * 0.88);
      // Tentacle 2
      ctx.moveTo(w * 0.46, h * 0.51);
      ctx.bezierCurveTo(w * 0.44, h * 0.72, w * 0.5, h * 0.82, w * 0.47, h * 0.89);
      // Tentacle 3
      ctx.moveTo(w * 0.54, h * 0.51);
      ctx.bezierCurveTo(w * 0.56, h * 0.72, w * 0.5, h * 0.82, w * 0.53, h * 0.89);
      // Tentacle 4
      ctx.moveTo(w * 0.63, h * 0.49);
      ctx.bezierCurveTo(w * 0.72, h * 0.68, w * 0.56, h * 0.78, w * 0.66, h * 0.88);
      ctx.stroke();
    }
  };

  // Drawing event handlers using named Coordinates calculations
  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    canvasRef.current?.setPointerCapture(e.pointerId);
    const { x, y } = getCoordinates(e);
    drawingStateRef.current = { isDrawing: true, lastX: x, lastY: y };
    
    // Draw initial dot
    drawSeg(x, y, x, y);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingStateRef.current.isDrawing) return;
    const { x, y } = getCoordinates(e);
    drawSeg(drawingStateRef.current.lastX, drawingStateRef.current.lastY, x, y);
    drawingStateRef.current.lastX = x;
    drawingStateRef.current.lastY = y;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (drawingStateRef.current.isDrawing) {
      canvasRef.current?.releasePointerCapture(e.pointerId);
      drawingStateRef.current.isDrawing = false;
      updateThumbnail();
    }
  };

  const drawSeg = (x1: number, y1: number, x2: number, y2: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.save();
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (isEraser) {
      ctx.globalCompositeOperation = "destination-out";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = brushColor;
    }

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  };

  // Convert canvas drawing to base64 for state storage
  const updateThumbnail = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      setCanvasUrl(canvas.toDataURL());
    }
  };

  const clearCanvas = () => {
    playWebSynth("fail");
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawOutline(selectedTemplate, ctx, canvas.width, canvas.height);
    updateThumbnail();
  };

  const startArScanningSequence = () => {
    playWebSynth("magic");
    setArScanning(true);
    setArScanProgress(0);
    setArScanSuccess(false);
    setArProjecting(false);

    let progress = 0;
    // Fast scanning: complete in ~1.2s to satisfy "tôi muốn app quét nhanh hơn" (updates every 120ms)
    const interval = setInterval(() => {
      progress += 10;
      setArScanProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setArScanning(false);
        setArScanSuccess(true);
        playWebSynth("success");
      }
    }, 120);
  };

  // "PHÉP THUẬT QUÉT AR TRANH NÀY!" -> move canvas content to the AR viewer
  const runMagicArScanning = () => {
    updateThumbnail();
    setActiveTab("ar-studio");

    const templateIntroMap: Record<TemplateType, string> = {
      whale: "Cá voi xanh khổng lồ rực sáng sắc màu bé tô đang vẫy đuôi kiêm đại dương tự do!",
      dolphin: "Bạn cá heo thông minh nhào lộn tinh nghịch, vượt sóng sinh động trên màn ảnh nhỏ!",
      goldfish: "Chú cá vàng óng ánh bơi lượn uốn mình điệu đà tấp nập sủi bọt bóng phép thuật!",
      shark: "Cá mập dũng mãnh rực lửa oai vệ tuần tra rạn san hô, làm sống động căn phòng mĩ thuật!",
      turtle: "Bạn rùa biển hiền lành, chậm rãi bơi quanh phòng khéo léo mang chiếc mai lung linh!",
      octopus: "Bạn bạch tuộc tinh nghịch dùng xúc tu vẫy tay chào bé, tung màu nước nhiệm màu!",
    };

    setArSpeechText(templateIntroMap[selectedTemplate]);

    // Short cute praises in Vietnamese as requested by the user
    const shortPhrases = [
      "Bạn vẽ đẹp quá!",
      "Bạn là họa sĩ nhỏ của tôi!",
      "Ôi chao! Bạn tô màu đẹp vô cùng!",
      "Bức tranh sinh động quá đi thôi!",
      "Tuyệt quá! Bạn chính là họa sĩ tí hon của tôi!",
      "Bạn vẽ đáng yêu lắm nhé!"
    ];
    const randomPhrase = shortPhrases[Math.floor(Math.random() * shortPhrases.length)];
    speakPedagogicalText(randomPhrase);

    // Auto start the fast optical image analysis
    startArScanningSequence();
  };

  // Saved artwork catalog
  const saveArtworkToGallery = () => {
    if (!canvasUrl) return;
    playWebSynth("success");

    const newSaved: SavedArtwork = {
      dataUrl: canvasUrl,
      template: selectedTemplate,
      title: templateVietnameseNames[selectedTemplate],
      timestamp: new Date().toLocaleTimeString("vi-VN"),
    };

    setSavedArtworks((prev) => [newSaved, ...prev]);
    setStars((prev) => prev + 15);

    if (stars + 15 >= 140) {
      setRewardBadgeName("Phù Thủy Sắc Màu 🌈");
      setActiveBadge("Phù Thủy Sắc Màu 🌈");
      setShowRewardModal(true);
    } else {
      setRewardBadgeName("Kỳ Tài Hội Họa 🌟");
      setActiveBadge("Kỳ Tài Hội Họa 🌟");
      setShowRewardModal(true);
    }

    speakPedagogicalText("Tuyệt vời quá! Bé đã lưu tác phẩm này vào Triển lãm 3D rồi. Bé nhận được 15 Sao Thưởng lấp lánh vàng!");
  };

  // Simulated class additions
  const handleAddNewHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    playWebSynth("success");
    const newSub: StudentSubmission = {
      id: `sub-${Date.now()}`,
      name: newStudentName,
      className: "Lớp 3A",
      artworkType: templateVietnameseNames[newStudentTemplate],
      timeAgo: "Vừa mới nộp",
      sampleImg: newStudentTemplate,
      analyzed: false,
    };

    setStudents((prev) => [newSub, ...prev]);
    setNewStudentName("");
    speakPedagogicalText(`Đã đưa bài vẽ mĩ thuật của bạn học sinh lớp 3 ${newStudentName} lên lớp vẽ mĩ thuật rồi nhé!`);
  };

  // Real server-side Gemini powered AI commentary function!
  const triggerTeacherAISupervision = async (studentName: string, artworkType: string, customImageBase64?: string) => {
    playWebSynth("magic");
    setIsAiLoading(true);
    setAiEvaluation("Đang kết nối hệ thống giáo viên trí tuệ nhân tạo Cô Điệp AI để xem và phê nhận xét tranh vẽ... Bé chờ một chút xíu nhé!");

    try {
      const response = await fetch("/api/evaluate-drawing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: studentName,
          templateName: artworkType,
          imageBase64: customImageBase64 || canvasUrl,
        }),
      });

      const data = await response.json();
      if (data.result) {
        setAiEvaluation(data.result);
        speakPedagogicalText(data.result);
      } else {
        throw new Error("Missing content");
      }
    } catch (err) {
      console.error(err);
      const preComments = [
        `Cô Điệp AI khen ngợi bức tranh vẽ của ${studentName}! Sắc tố rực rỡ tươi sáng, bố cục rất hài hòa. Mong em tiếp tục giữ ngọn lửa sắc màu nhé!`,
        `Thầy nhận thấy màu sắc của em rất có nhịp điệu sinh động y như câu chuyện cổ tích mĩ thuật vậy đó!`
      ];
      const randomMsg = preComments[Math.floor(Math.random() * preComments.length)];
      setAiEvaluation(randomMsg);
      speakPedagogicalText(randomMsg);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Switch fact helper
  const changeStemFact = () => {
    playWebSynth("click");
    const nextIdx = (stemFactIdx + 1) % stemFacts.length;
    setStemFactIdx(nextIdx);
    speakPedagogicalText(stemFacts[nextIdx]);
  };

  // Real camera control toggle (with browser request constraints handles)
  const toggleRealCamera = async () => {
    playWebSynth("click");
    if (isRealCameraOn) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
      setIsRealCameraOn(false);
      speakPedagogicalText("Đã chuyển về mô phỏng nền ảo.");
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        setIsRealCameraOn(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        speakPedagogicalText("Camera thật đã mở! Hãy đặt bức tranh mĩ thuật thật của bé trước camera nhé!");
      } catch (err) {
        console.warn("Camera streaming fallback:", err);
        speakPedagogicalText("Thiết bị chưa cấp quyền camera thật hoặc không hỗ trợ máy ảnh. Cô Điệp sẽ giữ hình nền ảo diệu đáy biển cho bé nhé!");
      }
    }
  };

  // Color Mixer Logic
  const handleSelectMixerIngredient = (color: string) => {
    playWebSynth("click");
    setMixFeedback(null);
    setMixSuccess(null);
    if (!mixerA) {
      setMixerA(color);
    } else if (!mixerB) {
      setMixerB(color);
    } else {
      setMixerA(color);
      setMixerB(null);
    }
  };

  const checkMixResult = () => {
    if (!mixerA || !mixerB) {
      playWebSynth("fail");
      setMixFeedback("Bé ơi, hãy lựa chọn đủ 2 chất liệu màu sắc để pha chế nhé! 🧪");
      setMixSuccess(false);
      return;
    }

    const arr = [mixerA, mixerB].sort();
    let isCorrect = false;

    if (arr[0] === "blue" && arr[1] === "yellow") {
      if (targetMixColor.name === "Màu Xanh Lá") isCorrect = true;
    } else if (arr[0] === "red" && arr[1] === "yellow") {
      if (targetMixColor.name === "Màu Cam") isCorrect = true;
    } else if (arr[0] === "blue" && arr[1] === "red") {
      if (targetMixColor.name === "Màu Tím") isCorrect = true;
    } else if (arr[0] === "red" && arr[1] === "white") {
      if (targetMixColor.name === "Màu Hồng") isCorrect = true;
    }

    if (isCorrect) {
      playWebSynth("success");
      setStars((prev) => prev + 20);
      setRewardBadgeName("Kỹ Sư Phối Màu 🧪");
      setActiveBadge("Kỹ Sư Phối Màu 🧪");
      setShowRewardModal(true);
      setMixFeedback(`Hoan hô! Bé đã xuất sắc phối hợp thành công ${targetMixColor.name}! Thưởng cho bé +20 Sao lấp lánh! ⭐🍀`);
      setMixSuccess(true);

      // Roll new target color after a brief show
      const pool = [
        { name: "Màu Cam", components: ["red", "yellow"], hex: "#f97316" },
        { name: "Màu Xanh Lá", components: ["blue", "yellow"], hex: "#22c55e" },
        { name: "Màu Tím", components: ["blue", "red"], hex: "#a855f7" },
        { name: "Màu Hồng", components: ["red", "white"], hex: "#fbcfe8" },
      ];
      const nextTarget = pool.filter((item) => item.name !== targetMixColor.name)[
        Math.floor(Math.random() * (pool.length - 1))
      ];
      setTimeout(() => {
        setTargetMixColor(nextTarget);
        setMixerA(null);
        setMixerB(null);
        setMixFeedback(null);
        setMixSuccess(null);
      }, 4000);
    } else {
      playWebSynth("fail");
      setMixFeedback("Ối, chưa chính xác mất rồi! Bé hãy phối lại các màu khác hoặc bấm nút Xóa để thử lại nhé! 🧐");
      setMixSuccess(false);
    }
  };

  // Shape Shadow Silhouette Matching Game (Replaces old acoustic sound game)
  const handleShadowGuessSubmit = (guess: TemplateType) => {
    if (guess === shadowTarget) {
      playWebSynth("success");
      setStars((prev) => prev + 15);
      setShadowScore((prev) => prev + 1);
      const names: Record<TemplateType, string> = {
        whale: "Cá Voi Xanh Khổng Lồ 🐳",
        dolphin: "Cá Heo Thông Minh 🐬",
        goldfish: "Cá Vàng Đại Dương 🐠",
        shark: "Cá Mập Kì Vĩ 🦈",
        turtle: "Rùa Biển Cần Mẫn 🐢",
        octopus: "Bạch Tuộc Tinh Nghịch 🐙",
      };
      setShadowFeedback(`Chính xác rồi! Con thông minh quá! Đây đúng là chiếc bóng của "${names[shadowTarget]}". Thưởng bé +15 Sao! ⭐🎨`);
      
      const templates: TemplateType[] = ["whale", "dolphin", "goldfish", "shark", "turtle", "octopus"];
      const nextTarget = templates.filter((t) => t !== shadowTarget)[
        Math.floor(Math.random() * 5)
      ];
      setTimeout(() => {
        setShadowTarget(nextTarget);
         setShadowFeedback(null);
      }, 3500);
    } else {
      playWebSynth("fail");
      setShadowFeedback("Ối, chiếc bóng chưa khớp rồi bé ơi! Bé hãy quan sát kĩ các nét chi tiết cong/thẳng rồi chọn lại nhé! 🧐");
    }
  };

  const templateVietnameseNames: Record<TemplateType, string> = {
    whale: "Cá Voi Xanh Khổng Lồ 🐳",
    dolphin: "Cá Heo Thông Minh 🐬",
    goldfish: "Cá Vàng Đại Dương 🐠",
    shark: "Cá Mập Kì Vĩ 🦈",
    turtle: "Rùa Biển Cần Mẫn 🐢",
    octopus: "Bạch Tuộc Tinh Nghịch 🐙",
  };

  const getStyleThemeColor = (colorHex: string) => {
    return { backgroundColor: colorHex };
  };

  return (
    <div className="bg-zinc-950 text-zinc-100 min-h-screen font-sans flex flex-col selection:bg-indigo-500/35">
      
      {/* 1. Splash Welcome Overlay */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            id="splash-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 bg-zinc-950/95 z-50 flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm"
          >
            <div className="bg-zinc-900 border border-zinc-800 p-8 md:p-12 rounded-3xl shadow-2xl max-w-lg w-full relative overflow-hidden">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl" />

              <div className="bg-zinc-800 border border-zinc-700/50 p-5 rounded-full inline-block shadow-lg mb-6">
                <Sparkles className="text-white w-14 h-14 animate-pulse" />
              </div>

              <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-wide mb-2 drop-shadow-md">
                Magic Art
              </h1>
              <p className="text-indigo-400 font-extrabold text-xs md:text-sm uppercase tracking-widest mb-6">
                Mĩ Thuật Sống Động AR Việt Nam 🎨
              </p>

              <p className="text-zinc-300 text-sm md:text-base font-medium mb-8 leading-relaxed">
                Chào mừng bạn nhỏ đến với thế giới hội họa phép thuật diệu kỳ! Đưa những bức tranh tự vẽ chuyển động bay lượn lấp lánh ngay trên camera của bé!
              </p>

              <button
                id="btn-splash-start"
                onClick={() => {
                  setShowSplash(false);
                  playWebSynth("success");
                  speakPedagogicalText("Chào mừng các bạn nhỏ đến với vương quốc sắc màu mĩ thuật diệu kỳ Magic Art Việt Nam!");
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-505 text-white font-extrabold text-lg py-4 rounded-2xl shadow-xl shadow-indigo-500/10 border border-indigo-500 transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                BẮT ĐẦU PHÉP THUẬT ✨
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header component */}
      <header className="bg-zinc-900/90 backdrop-blur-md sticky top-0 z-40 border-b border-zinc-800 shadow-xl shadow-black/20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo Brand click targets to go back to palette */}
          <div
            id="logo"
            onClick={() => {
              playWebSynth("click");
              setActiveTab("color-scan");
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="bg-zinc-800 border border-zinc-700 p-2.5 rounded-2xl shadow-md rotate-[-3deg] group-hover:rotate-0 transition-transform duration-300">
              <Palette className="text-indigo-400 w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-extrabold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Magic Art Việt Nam
              </h1>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                Mĩ thuật sống động AR cho học sinh tiểu học
              </p>
            </div>
          </div>

          {/* Badge score cards */}
          <div className="flex items-center gap-2 md:gap-4 flex-wrap justify-center">
            {/* Guide Button */}
            <button
              id="btn-open-guide"
              onClick={() => {
                playWebSynth("click");
                setGuideTab("student-guide");
                setShowGuideModal(true);
                speakPedagogicalText("Bé muốn xem hướng dẫn học sinh, hay cô chú phụ huynh giáo viên cần mẹo bổ ích?");
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs px-3.5 py-2.5 rounded-2xl shadow-md flex items-center gap-1.5 transition-all border border-indigo-500 active:scale-95"
            >
              <BookOpen className="w-4 h-4" /> Hướng dẫn sử dụng 📖
            </button>

            {/* Stars display */}
            <div className="bg-zinc-800 border border-zinc-700 rounded-full px-4 py-1.5 flex items-center gap-2 shadow-sm">
              <span className="text-lg">⭐</span>
              <span id="star-count" className="font-extrabold text-zinc-150 text-sm">
                {stars}
              </span>
              <span className="text-zinc-600">|</span>
              <span
                id="badge-display"
                className="text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/15 px-2 py-0.5 rounded-full"
              >
                {activeBadge}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Navigation Rails */}
        <div className="bg-zinc-900/50 border-t border-zinc-800 overflow-x-auto">
          <div className="max-w-7xl mx-auto px-4 flex min-w-max gap-2 py-2.5">
            <button
              id="tab-btn-draw"
              onClick={() => setActiveTab("color-scan")}
              className={`px-4 py-2 rounded-xl text-sm font-extrabold transition flex items-center gap-1.5 ${
                activeTab === "color-scan"
                  ? "bg-indigo-600 text-white shadow-lg border border-indigo-500"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
              }`}
            >
              🎨 1. Tô Màu Sáng Tạo
            </button>
            <button
              id="tab-btn-ar"
              onClick={() => setActiveTab("ar-studio")}
              className={`px-4 py-2 rounded-xl text-sm font-extrabold transition flex items-center gap-1.5 ${
                activeTab === "ar-studio"
                  ? "bg-indigo-600 text-white shadow-lg border border-indigo-500"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
              }`}
            >
              🔮 2. Quét Tranh AR
            </button>
            <button
              id="tab-btn-games"
              onClick={() => setActiveTab("games")}
              className={`px-4 py-2 rounded-xl text-sm font-extrabold transition flex items-center gap-1.5 ${
                activeTab === "games"
                  ? "bg-indigo-600 text-white shadow-lg border border-indigo-500"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
              }`}
            >
              🧪 3. Trò Chơi Sắc Màu
            </button>
            <button
              id="tab-btn-gallery3d"
              onClick={() => setActiveTab("gallery3d")}
              className={`px-4 py-2 rounded-xl text-sm font-extrabold transition flex items-center gap-1.5 ${
                activeTab === "gallery3d"
                  ? "bg-indigo-600 text-white shadow-lg border border-indigo-500"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
              }`}
            >
              🖼️ 4. Triển Lãm 3D Ảo
            </button>
            <button
              id="tab-btn-teacher"
              onClick={() => setActiveTab("teacher-ai")}
              className={`px-4 py-2 rounded-xl text-sm font-extrabold transition flex items-center gap-1.5 ${
                activeTab === "teacher-ai"
                  ? "bg-indigo-600 text-white shadow-lg border border-indigo-500"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
              }`}
            >
              👩‍🏫 5. Lớp Học Cô Điệp AI
            </button>
          </div>
        </div>
      </header>

      {/* Main Sandbox */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-6">
        
        {/* TAB 1: Creative Painting Canvas */}
        {activeTab === "color-scan" && (
          <div id="section-color-scan" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Sidebar selection */}
            <div className="lg:col-span-3 bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-xl flex flex-col">
              <h3 className="font-extrabold text-zinc-200 text-sm mb-4 flex items-center gap-2 border-b border-zinc-800 pb-2">
                🌟 Chọn Mẫu Tô Vẽ
              </h3>
              <div className="flex flex-col gap-3">
                {(["whale", "dolphin", "goldfish", "shark", "turtle", "octopus"] as TemplateType[]).map((t) => (
                  <button
                    key={t}
                    id={`tpl-card-${t}`}
                    onClick={() => {
                      setSelectedTemplate(t);
                      setSelectedOceanScene(recommendedScenes[t] || "deep_blue_abyss");
                      playWebSynth("click");
                    }}
                    className={`p-4 rounded-2xl text-left border transition flex items-center gap-3 ${
                      selectedTemplate === t
                        ? "border-indigo-505 bg-indigo-500/10 text-white shadow-md shadow-indigo-505/5"
                        : "border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    }`}
                  >
                    <span className="text-3xl">
                      {t === "whale" && "🐳"}
                      {t === "dolphin" && "🐬"}
                      {t === "goldfish" && "🐠"}
                      {t === "shark" && "🦈"}
                      {t === "turtle" && "🐢"}
                      {t === "octopus" && "🐙"}
                    </span>
                    <div>
                      <span className="font-extrabold text-xs text-zinc-200 block">
                        {templateVietnameseNames[t]}
                      </span>
                      <span className="text-[10px] text-zinc-500 italic">Mẫu tranh đại dương</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Canvas screen inside column 6 */}
            <div className="lg:col-span-6 bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-2xl flex flex-col">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h3 className="font-extrabold text-zinc-200 text-sm flex items-center gap-2">
                  🎨 Cọ Xinh Kỳ Diệu{" "}
                  <span className="text-indigo-400">
                    ({templateVietnameseNames[selectedTemplate]})
                  </span>
                </h3>
                <button
                  id="btn-clear-canvas"
                  onClick={clearCanvas}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/15 font-extrabold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Vẽ lại từ đầu
                </button>
              </div>

              {/* Real canvas rendering bounds */}
              <div className="relative w-full aspect-video md:aspect-[4/3] bg-zinc-950 rounded-2xl border-2 border-dashed border-zinc-800 overflow-hidden cursor-crosshair">
                <canvas
                  id="coloring-canvas"
                  ref={canvasRef}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  className="w-full h-full block touch-none"
                />
              </div>

              {/* Color options and brush scales controls */}
              <div className="mt-4 bg-zinc-855/35 border border-zinc-800/80 p-5 rounded-2xl">
                <div className="flex items-center gap-3 justify-between flex-wrap">
                  {/* Brush diameters */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-400">Cỡ cọ:</span>
                    <button
                      id="brush-sm"
                      onClick={() => {
                        setBrushSize(4);
                        playWebSynth("click");
                      }}
                      className={`w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center transition border ${
                        brushSize === 4 ? "border-indigo-500 ring-2 ring-indigo-500/30" : "border-zinc-700"
                      }`}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-150" />
                    </button>
                    <button
                      id="brush-md"
                      onClick={() => {
                        setBrushSize(8);
                        playWebSynth("click");
                      }}
                      className={`w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center transition border ${
                        brushSize === 8 ? "border-indigo-500 ring-2 ring-indigo-500/30" : "border-zinc-700"
                      }`}
                    >
                      <div className="w-3 h-3 rounded-full bg-zinc-150" />
                    </button>
                    <button
                      id="brush-lg"
                      onClick={() => {
                        setBrushSize(16);
                        playWebSynth("click");
                      }}
                      className={`w-11 h-11 rounded-full bg-zinc-800 flex items-center justify-center transition border ${
                        brushSize === 16 ? "border-indigo-500 ring-2 ring-indigo-500/30" : "border-zinc-700"
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full bg-zinc-150" />
                    </button>
                  </div>

                  {/* Draw mode / eraser toggles */}
                  <div className="flex items-center gap-2">
                    <button
                      id="tool-draw"
                      onClick={() => setIsEraser(false)}
                      className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                        !isEraser ? "bg-indigo-600 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700/50"
                      }`}
                    >
                      ✏️ Cọ màu
                    </button>
                    <button
                      id="tool-eraser"
                      onClick={() => setIsEraser(true)}
                      className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                        isEraser ? "bg-indigo-600 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700/50"
                      }`}
                    >
                      <Eraser className="w-3.5 h-3.5" /> Tẩy xóa
                    </button>
                  </div>
                </div>

                {/* Palette color blocks */}
                <div className="mt-4 pt-4 border-t border-zinc-800">
                  <span className="text-xs font-bold text-zinc-400 block mb-2">Thùng Màu Ba Lô:</span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {kidColors.map((col) => (
                      <button
                        key={col.hex}
                        id={`palette-btn-${col.name}`}
                        onClick={() => {
                          setBrushColor(col.hex);
                          setIsEraser(false);
                          playWebSynth("click");
                        }}
                        style={getStyleThemeColor(col.hex)}
                        title={col.name}
                        className={`w-8 h-8 rounded-full flex-shrink-0 transition-transform active:scale-95 border-2 border-zinc-950 shadow-md relative ${
                          brushColor === col.hex && !isEraser ? "ring-4 ring-indigo-500 scale-110" : "hover:scale-105"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Scanner Activation trigger button */}
              <button
                id="btn-scan"
                onClick={runMagicArScanning}
                className="mt-5 w-full bg-indigo-600 hover:bg-indigo-550 text-white font-extrabold py-4 px-6 rounded-2xl shadow-lg shadow-indigo-500/10 transition-transform active:scale-98 text-base flex items-center justify-center gap-2 border border-indigo-500 cursor-pointer"
              >
                <Sparkles className="animate-bounce" /> PHÉP THUẬT QUÉT AR TRANH NÀY! ✨
              </button>
            </div>

            {/* STEM dialogue mascot right sidebar */}
            <div className="lg:col-span-3 space-y-4">
              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-3xl text-center shadow-md">
                <button
                  id="fact-badge"
                  className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider mb-2 inline-block"
                >
                  💡 Khám Phá Sắc Màu
                </button>
                <p id="stem-fact-text" className="text-xs text-zinc-400 leading-relaxed font-medium">
                  {stemFacts[stemFactIdx]}
                </p>
                <button
                  id="btn-change-fact"
                  onClick={changeStemFact}
                  className="mt-3 text-[10px] bg-zinc-800 border border-zinc-700 hover:bg-zinc-750 text-zinc-200 font-extrabold px-3 py-1.5 rounded-xl transition"
                >
                  Đọc thẻ khác 📖
                </button>
              </div>

              {/* Mascot Bubble */}
              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-3xl relative overflow-hidden shadow-md">
                <div className="flex items-start gap-2">
                  <span className="text-4xl animate-bounce">🦁</span>
                  <div>
                    <h4 className="font-extrabold text-orange-400 text-xs">Mascot Cọ Xinh</h4>
                    <p id="mascot-speech" className="text-[11px] text-zinc-400 mt-1 font-medium leading-relaxed">
                      Cậu vẽ đẹp quá bạn ơi! Hãy chọn màu Đỏ Mặt Trời hoặc Vàng Rực Rỡ tô sáng cho các bạn thú và chùa thiêng nhé!
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: AR Live Stream Simulation or Real Camera */}
        {activeTab === "ar-studio" && (
          <div id="section-ar-studio" className="max-w-6xl mx-auto bg-zinc-900 border border-zinc-c00 rounded-3xl shadow-2xl p-6 md:p-8">
            <div className="text-center mb-6">
              <h2 className="text-xl md:text-3xl font-extrabold text-zinc-100 flex items-center justify-center gap-2">
                🔮 Quét Thực Tế Tăng Cường AR & Tạo Video Hoạt Họa
              </h2>
              <p className="text-xs text-zinc-500 font-bold mt-1">
                Công nghệ thông minh giúp nhận diện tranh vẽ của bé và biến chúng thành video chuyển động đáng yêu trong các cảnh đại dương kì vĩ!
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Viewport Video Screen and Under-screen Projection Settings */}
              <div className="lg:col-span-7 space-y-4">
                {/* Video or background canvas viewport */}
                <div className="relative aspect-video w-full rounded-3xl bg-zinc-950 overflow-hidden border border-zinc-805 shadow-2xl">
                  
                  {/* Fallback scenery backgrounds */}
                  <div
                    id="fake-camera-backdrop"
                    style={{
                      backgroundImage: `url('${(oceanScenes.find(s => s.id === selectedOceanScene) || oceanScenes[0]).url}')`,
                      filter:
                        arActiveFilter === "ocean"
                          ? "hue-rotate(180deg) saturate(1.4)"
                          : arActiveFilter === "sunset"
                          ? "sepia(0.5) hue-rotate(-15deg) saturate(1.2)"
                          : arActiveFilter === "neon"
                          ? "invert(0.1) saturate(2) hue-rotate(90deg)"
                          : "none"
                    }}
                    className={`absolute inset-0 bg-cover bg-center transition-all duration-500 ${
                      isRealCameraOn ? "opacity-35" : "opacity-100"
                    }`}
                  />

                  {/* Hardware Video layer */}
                  <video
                    ref={videoRef}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                      isRealCameraOn ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                    style={{
                      filter:
                        arActiveFilter === "ocean"
                          ? "hue-rotate(180deg) saturate(1.4)"
                          : arActiveFilter === "sunset"
                          ? "sepia(0.5) hue-rotate(-15deg) saturate(1.2)"
                          : arActiveFilter === "neon"
                          ? "invert(0.1) saturate(2) hue-rotate(90deg)"
                          : "none"
                    }}
                    playsInline
                    muted
                  />

                  {/* STATE 1: arScanning (Computing Camera OCR/Image Analysis fast) */}
                  {arScanning && (
                    <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center">
                      <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
                        <div className="absolute inset-0 border-4 border-dashed border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        <div className="absolute inset-3 border-2 border-pink-500 rounded-full animate-ping" />
                        <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
                      </div>
                      
                      <span className="text-white text-lg font-black tracking-widest">{arScanProgress}%</span>
                      
                      <div className="w-64 bg-zinc-800 h-2 rounded-full overflow-hidden border border-zinc-700 mt-2.5">
                        <div className="bg-gradient-to-r from-pink-500 via-indigo-500 to-cyan-400 h-full transition-all duration-150" style={{ width: `${arScanProgress}%` }} />
                      </div>

                      <p className="text-zinc-300 text-xs font-black mt-4 animate-pulse uppercase">
                        {arScanProgress < 30 && "⚡ Đang khởi tạo camera thông minh..."}
                        {arScanProgress >= 30 && arScanProgress < 60 && "🌈 Đang phân tách dải màu bé vẽ..."}
                        {arScanProgress >= 60 && arScanProgress < 90 && "📐 Định dạng tọa độ đường viền nét vẽ..."}
                        {arScanProgress >= 90 && "🎬 Đang đóng gói hoạt cảnh video AR chuyển động..."}
                      </p>
                      <p className="text-[10px] text-zinc-500 font-bold mt-1">Hệ thống quét cải tiến - Siêu tốc độ!</p>
                    </div>
                  )}

                  {/* STATE 2: arScanSuccess but not yet projecting */}
                  {arScanSuccess && !arProjecting && (
                    <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center">
                      <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center shadow-lg text-3xl mb-4 animate-bounce">
                        ✓
                      </div>
                      <h3 className="text-emerald-400 text-base md:text-lg font-black">
                        QUÉT TRANH & ĐỊNH HÌNH THÀNH CÔNG!
                      </h3>
                      <p className="text-zinc-300 text-xs font-bold max-w-sm mt-1 leading-relaxed">
                        Hệ thống AI Cô Điệp đã biến tranh mẫu vẽ của bé thành dải chuyển động hoạt họa 3D riêng biệt. Hãy bấm nút dưới đây để xem phép màu!
                      </p>

                      <div className="mt-5">
                        <button
                          id="btn-confirm-start-projection"
                          onClick={() => {
                            playWebSynth("success");
                            setArProjecting(true);
                            speakPedagogicalText("Khởi chiếu video chuyển động nghệ thuật AR của con! Con xem bạn rùa bạn cá bơi lội sinh động chưa này!");
                          }}
                          className="bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition-all text-white font-black text-sm px-6 py-4 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.45)] flex items-center gap-2 border border-white/20 animate-pulse cursor-pointer"
                        >
                          <Play className="w-4 h-4 fill-current" /> XÁC NHẬN & XEM VIDEO CHUYỂN ĐỘNG AR 🚀
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STATE 3: arProjecting (Playing video with animated drawings) */}
                  {arProjecting && (
                    <>
                      {/* Generated floating sparkles / bubbles */}
                      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                        {Array.from({ length: arSparkleCount }).map((_, i) => (
                          <motion.div
                            key={`bubble-${i}`}
                            initial={{
                              x: Math.random() * 550,
                              y: 200,
                              opacity: Math.random() * 0.7 + 0.3,
                              scale: Math.random() * 1.2 + 0.4
                            }}
                            animate={{
                              y: -50,
                              x: Math.random() * 550,
                              opacity: [0, 0.8, 0]
                            }}
                            transition={{
                              duration: Math.random() * 4 + 3,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: Math.random() * 3
                            }}
                            className={`absolute rounded-full shadow-inner ${
                              ["whale", "dolphin", "shark"].includes(selectedTemplate)
                                ? "bg-cyan-300/30 border border-cyan-400/20"
                                : "bg-amber-300/30 border border-amber-400/20"
                            }`}
                            style={{
                              width: `${Math.random() * 16 + 8}px`,
                              height: `${Math.random() * 16 + 8}px`,
                            }}
                          />
                        ))}
                      </div>

                      {/* Active video layout controls/HUD */}
                      <div className="absolute bottom-12 left-4 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] font-mono text-emerald-400 flex items-center gap-1.5 z-20">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        <span>VIDEO PLAYING: {selectedTemplate.toUpperCase()} (MỚI HÓA PHÉP)</span>
                      </div>

                      <div className="absolute bottom-12 right-4 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] font-mono text-zinc-300 z-20">
                        00:08 / 00:10 (Lặp lại vĩnh viễn)
                      </div>

                      {/* Motion timeline loader animation at the bottom of video screen */}
                      <div className="absolute bottom-10 left-4 right-4 h-1 bg-zinc-800 rounded-full overflow-hidden z-20">
                        <div className="h-full bg-indigo-500 animate-[timeline_10s_linear_infinite]" />
                      </div>

                      <style>
                        {`
                          @keyframes timeline {
                            0% { width: 0%; }
                            100% { width: 100%; }
                          }
                        `}
                      </style>
                    </>
                  )}

                  {/* Animated Floating avatar overlays */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    {canvasUrl ? (
                      <motion.img
                        src={canvasUrl}
                        key={`${selectedTemplate}-${arMotionSpeed}`}
                        animate={arProjecting ? {
                          x: ["whale", "dolphin", "shark"].includes(selectedTemplate) ? [-130, 130, -130] : [-55, 55, -55],
                          y: [0, -25, 15, -15, 0],
                          rotate: ["whale", "dolphin", "shark"].includes(selectedTemplate) ? [0, 8, -8, 0] : [0, 4, -4, 0],
                          scale: [1, 1.15, 0.92, 1.05, 1],
                        } : {
                          y: [0, -6, 0],
                          rotate: [0, 2, -2, 0],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: arProjecting ? arMotionSpeed : 4,
                          ease: "easeInOut",
                        }}
                        className="w-44 h-44 md:w-56 md:h-56 object-contain drop-shadow-[0_0_20px_rgba(253,224,71,0.95)]"
                        alt="AR avatar overlay"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="text-white text-xs bg-black/60 px-4 py-2 rounded-xl">
                        Chưa vẽ tác phẩm nào. Hãy quay lại Tab 1 vẽ trước nhé!
                      </div>
                    )}
                  </div>

                  {/* Dotted target frame */}
                  {(!arProjecting && !arScanning) && (
                    <div className="absolute inset-6 border-2 border-dashed border-indigo-500/30 rounded-3xl pointer-events-none flex flex-col items-center justify-center z-20">
                      <div className="bg-indigo-600 border border-indigo-500 text-white text-[9px] md:text-sm font-black px-4 py-2 rounded-xl shadow-lg uppercase animate-pulse-slow text-center max-w-sm">
                        📸 HƯỚNG CAMERA VÀO TRANH VỄ ĐỂ QUÉT
                      </div>
                      <p className="text-[10px] text-zinc-400 font-bold mt-2">Bé có thể cầm giấy trước webcam hoặc dùng khung ảnh vẽ bên cạnh</p>
                    </div>
                  )}

                  {/* Scanning visual laser runnings */}
                  {arScanning && (
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-[0_0_8px_rgba(99,102,241,0.8)] pointer-events-none animate-[scan_1.5s_linear_infinite] z-20" />
                  )}

                  <style>
                    {`
                      @keyframes scan {
                        0% { top: 0%; }
                        50% { top: 100%; }
                        100% { top: 0%; }
                      }
                    `}
                  </style>

                  {/* Live status badge tags */}
                  <div className="absolute top-3 left-3 bg-indigo-600 border border-indigo-500 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full animate-pulse flex items-center gap-1.5 z-20">
                    <span className="w-1.5 h-1.5 rounded-full bg-white block animate-ping" />
                    <span>
                      {arProjecting ? "TRẠNG THÁI: VIDEO ĐANG CHIẾU 🎬" : arScanning ? "TRẠNG THÁI: ĐANG QUÉT SIÊU TỐC ⚡" : "TRẠNG THÁI: CHỜ QUÉT CAMERA"}
                    </span>
                  </div>

                  {/* Music mute toggler */}
                  <div className="absolute bottom-3 right-3 z-30 animate-pulse-slow">
                    <button
                      id="music-ar-btn"
                      onClick={startBackgroundScenerySound}
                      className="bg-zinc-900/90 hover:bg-zinc-800 text-zinc-100 text-xs p-2.5 border border-zinc-850 rounded-xl transition flex items-center gap-1.5"
                    >
                      {isARMusicOn ? <Volume2 className="text-indigo-400" /> : <VolumeX />}
                      <span className="hidden sm:inline font-extrabold">Âm sinh cảnh 🎵</span>
                    </button>
                  </div>
                </div>

                {/* Custom Interactive Speed & Filters Settings Bar for Projecting State */}
                {arProjecting && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4 grid grid-cols-2 gap-4"
                  >
                    <div>
                      <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1.5">🌈 Bộ lọc màu sắc video:</label>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { id: "none", name: "Gốc" },
                          { id: "ocean", name: "Đại Dương 🐬" },
                          { id: "sunset", name: "Hoàng Hôn 🌅" },
                          { id: "neon", name: "Kỳ Ảo 🌸" }
                        ].map((filt) => (
                          <button
                            key={filt.id}
                            onClick={() => {
                              playWebSynth("click");
                              setArActiveFilter(filt.id);
                            }}
                            className={`text-[10px] px-2.5 py-1.5 rounded-lg border font-black transition ${
                              arActiveFilter === filt.id
                                ? "bg-indigo-600 border-indigo-500 text-white shadow-md"
                                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                            }`}
                          >
                            {filt.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1.5">⚡ Tốc độ bơi / bay:</label>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { id: 6, name: "Thong thả" },
                          { id: 3, name: "Vừa phải" },
                          { id: 1.5, name: "Chạy nhanh ⚡" }
                        ].map((sp) => (
                          <button
                            key={sp.id}
                            onClick={() => {
                              playWebSynth("click");
                              setArMotionSpeed(sp.id);
                            }}
                            className={`text-[10px] px-2.5 py-1.5 rounded-lg border font-black transition ${
                              arMotionSpeed === sp.id
                                ? "bg-purple-600 border-purple-500 text-white shadow-md"
                                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                            }`}
                          >
                            {sp.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Right Column: Scenery Customizer and Control Actions Block */}
              <div className="lg:col-span-5 space-y-5">
                {/* Background Ocean Scenery Customizer */}
                <div id="scenery-customizer-panel" className="bg-zinc-950/60 p-5 rounded-2xl border border-zinc-805">
                  <label className="block text-xs text-indigo-400 font-extrabold uppercase mb-3 text-center flex items-center justify-center gap-1.5">
                    🌊 CHỌN CẢNH NỀN ĐẠI DƯƠNG PHÙ HỢP:
                  </label>
                  <div className="grid grid-cols-1 gap-2.5">
                    {oceanScenes.map((scene) => {
                      const isRecommended = recommendedScenes[selectedTemplate] === scene.id;
                      return (
                        <button
                          key={scene.id}
                          id={`btn-scene-${scene.id}`}
                          onClick={() => {
                            playWebSynth("click");
                            setSelectedOceanScene(scene.id);
                            speakPedagogicalText(`Tuyệt vời! Bé đã chọn cảnh nền ${scene.name}. Hãy quét tranh nhé!`);
                          }}
                          className={`relative px-4 py-3 rounded-xl border text-xs font-black transition flex items-center justify-between gap-3 text-left ${
                            selectedOceanScene === scene.id
                              ? "bg-indigo-600 shadow-lg border-indigo-500 text-white active:scale-95"
                              : "bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:border-zinc-700 active:scale-98"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">{scene.emoji}</span>
                            <span className="leading-tight text-[11px] font-bold">{scene.name}</span>
                          </div>
                          {isRecommended && (
                            <span className="text-[8px] bg-amber-500 text-zinc-950 px-2 py-0.5 rounded-full font-bold shadow animate-pulse">
                              Gợi ý ⭐
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-zinc-450 text-center font-bold mt-3 border-t border-zinc-800/80 pt-2">
                    💡 {oceanScenes.find((s) => s.id === selectedOceanScene)?.description}
                  </p>
                </div>

                {/* Control Actions Frame */}
                <div className="bg-zinc-950/40 p-5 rounded-2xl border border-zinc-800/60 space-y-3">
                  <span className="block text-[10.5px] text-zinc-400 font-black uppercase text-center tracking-wider mb-2">Bảng điều hướng thông minh:</span>
                  
                  {/* Start scan / scanning trigger */}
                  <button
                    id="btn-fast-scan-ar-again"
                    onClick={() => {
                      playWebSynth("magic");
                      startArScanningSequence();
                      speakPedagogicalText("Bắt đầu quét lại tranh vẽ chớp nhoáng nhé!");
                    }}
                    className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-505 text-white font-black text-xs py-3.5 px-4 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.25)] transition flex items-center justify-center gap-2 border border-violet-500 active:scale-95 cursor-pointer text-center"
                  >
                    <span>🔄 BẮT ĐẦU QUÉT TRANH VẼ CỦA BÉ</span>
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      id="btn-trigger-hardware-cam"
                      onClick={toggleRealCamera}
                      className="bg-zinc-900 border border-zinc-800 text-zinc-200 font-extrabold text-[11px] py-3 rounded-xl transition flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      {isRealCameraOn ? <VideoOff className="w-3.5 h-3.5 text-rose-450" /> : <Video className="w-3.5 h-3.5 text-emerald-405" />}
                      <span>{isRealCameraOn ? "Tắt Camera Thật" : "Dùng Camera Thật 📸"}</span>
                    </button>

                    <button
                      id="btn-save-to-collection"
                      onClick={saveArtworkToGallery}
                      className="bg-zinc-900 border border-zinc-800 text-zinc-200 font-extrabold text-[11px] py-3 rounded-xl transition flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      💾 Lưu Tranh 3D
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Sensory Color Game and Nature sound quiz */}
        {activeTab === "games" && (
          <div id="section-games" className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Playful mixing beaker chemistry */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
              <div className="text-center mb-4">
                <span className="text-4xl animate-bounce mb-1 inline-block">🧪</span>
                <h3 className="font-extrabold text-indigo-400 text-lg">Phù Thủy Phối Màu Nghệ Thuật</h3>
                <p className="text-xs text-zinc-400 font-bold">Hãy học cách phối màu cơ bản và nâng cấp ngôi trường của bé nhé!</p>
              </div>

              {/* Target mix goals */}
              <div className="bg-zinc-950 border border-zinc-800/80 p-4 rounded-2xl text-center mb-4">
                <p className="text-xs font-bold text-zinc-400">Nhiệm vụ mĩ thuật của bé: Phối màu sau</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div
                    style={getStyleThemeColor(targetMixColor.hex)}
                    className="w-16 h-8 rounded-lg shadow-sm"
                  />
                  <span className="font-extrabold text-sm text-zinc-200 uppercase tracking-widest">
                    {targetMixColor.name}
                  </span>
                </div>
              </div>

              {/* Current temporary combination bucket represent visually */}
              <div className="flex items-center justify-around gap-2 bg-zinc-950/60 border border-zinc-850 p-4 rounded-2xl mb-4">
                <div className="text-center">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Màu 1</span>
                  <div
                    style={getStyleThemeColor(mixerA ? (mixerA === "red" ? "#ef4444" : mixerA === "yellow" ? "#facc15" : mixerA === "blue" ? "#3b82f6" : "#ffffff") : "#18181b")}
                    className="w-12 h-12 rounded-full mx-auto border-2 border-zinc-800 shadow-md transition-colors duration-300"
                  />
                </div>
                <span className="text-2xl font-bold text-zinc-700">+</span>
                <div className="text-center">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Màu 2</span>
                  <div
                    style={getStyleThemeColor(mixerB ? (mixerB === "red" ? "#ef4444" : mixerB === "yellow" ? "#facc15" : mixerB === "blue" ? "#3b82f6" : "#ffffff") : "#18181b")}
                    className="w-12 h-12 rounded-full mx-auto border-2 border-zinc-800 shadow-md transition-colors duration-300"
                  />
                </div>
                <span className="text-2xl font-bold text-zinc-700">=</span>
                <div className="text-center">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Kết quả</span>
                  <div
                    id="mix-color-result"
                    style={getStyleThemeColor(getMixedColorHex(mixerA, mixerB))}
                    className="w-14 h-14 rounded-2xl mx-auto border border-zinc-750 shadow-lg animate-pulse transition-all duration-300"
                  />
                </div>
              </div>
              {/* Select buttons for base raw colors */}
              <div className="grid grid-cols-4 gap-2 mb-4 font-bold text-xs select-none">
                <button
                  id="ingredient-red"
                  onClick={() => handleSelectMixerIngredient("red")}
                  className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs py-2.5 rounded-xl transition"
                >
                  Đỏ🔴
                </button>
                <button
                  id="ingredient-yellow"
                  onClick={() => handleSelectMixerIngredient("yellow")}
                  className="bg-yellow-500 hover:bg-yellow-600 text-zinc-950 font-extrabold text-xs py-2.5 rounded-xl transition"
                >
                  Vàng🟡
                </button>
                <button
                  id="ingredient-blue"
                  onClick={() => handleSelectMixerIngredient("blue")}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-2.5 rounded-xl transition"
                >
                  Xanh🔵
                </button>
                <button
                  id="ingredient-white"
                  onClick={() => handleSelectMixerIngredient("white")}
                  className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-750 text-zinc-200 font-extrabold text-xs py-2.5 rounded-xl transition"
                >
                  Trắng⚪
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  id="btn-test-pitch"
                  onClick={checkMixResult}
                  className="flex-grow bg-indigo-600 hover:bg-indigo-505 text-white font-extrabold text-xs py-3.5 rounded-2xl shadow active:scale-95 transition-all text-center uppercase border border-indigo-550"
                >
                  🔮 Kiểm Tra Phối Màu Phép Thuật!
                </button>
                <button
                  id="btn-reset-mixer"
                  onClick={() => {
                    playWebSynth("click");
                    setMixerA(null);
                    setMixerB(null);
                    setMixFeedback(null);
                    setMixSuccess(null);
                  }}
                  className="px-4 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-bold text-xs rounded-2xl border border-zinc-700"
                >
                  Xóa
                </button>
              </div>

              {mixFeedback && (
                <div className={`mt-3 p-3 rounded-xl border text-xs text-center font-bold animate-pulse-slow ${
                  mixSuccess ? "bg-emerald-950/80 border-emerald-800 text-emerald-300" : "bg-rose-950/80 border-rose-805 text-rose-300"
                }`}>
                  {mixFeedback}
                </div>
              )}
            </div>

            {/* Shape Shadow Silhouette guessing game card */}
            <div id="section-shadow-game" className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
              <div className="text-center mb-4">
                <span className="text-4xl animate-bounce mb-1 inline-block">👤</span>
                <h3 className="font-extrabold text-indigo-400 text-lg">Bóng Bí Ản Đại Dương</h3>
                <p className="text-xs text-zinc-400 font-bold">Bóng của hình dạng màu đen đặt trên nền màu trắng!</p>
              </div>

              {/* Displaying Silhouette of current mystery target */}
              <div className="bg-zinc-950 border border-zinc-85c p-5 rounded-2xl flex flex-col items-center justify-center flex-grow mb-4">
                <p className="text-xs text-zinc-450 font-bold mb-3 text-center">
                  Bé có phát hiện chiếc bóng bí ẩn này thuộc về bức vẽ nào dưới đây?
                </p>

                {shadowTarget === "whale" && (
                  <svg viewBox="0 0 100 100" className="w-48 h-48 md:w-56 md:h-56 text-black mx-auto bg-white border-4 border-indigo-400 p-4 rounded-3xl shadow-2xl cursor-pointer hover:scale-105 transition-all">
                    <path d="M15 55 Q25 40 75 50 L90 38 L88 52 L90 66 L75 55 Z" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" />
                  </svg>
                )}
                {shadowTarget === "dolphin" && (
                  <svg viewBox="0 0 100 100" className="w-48 h-48 md:w-56 md:h-56 text-black mx-auto bg-white border-4 border-indigo-400 p-4 rounded-3xl shadow-2xl cursor-pointer hover:scale-105 transition-all">
                    <path d="M12 60 Q28 18 82 50 L92 58 L84 52 L90 44 Z" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" />
                  </svg>
                )}
                {shadowTarget === "goldfish" && (
                  <svg viewBox="0 0 100 100" className="w-48 h-48 md:w-56 md:h-56 text-black mx-auto bg-white border-4 border-indigo-400 p-4 rounded-3xl shadow-2xl cursor-pointer hover:scale-105 transition-all">
                    <path d="M18 50 Q42 16 68 50 Q42 84 18 50 Z M68 50 Q86 22 88 50 Z" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" />
                  </svg>
                )}
                {shadowTarget === "shark" && (
                  <svg viewBox="0 0 100 100" className="w-48 h-48 md:w-56 md:h-56 text-black mx-auto bg-white border-4 border-indigo-400 p-4 rounded-3xl shadow-2xl cursor-pointer hover:scale-105 transition-all">
                    <path d="M14 52 Q40 22 74 46 L86 26 L80 48 L86 70 L72 54 Z" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" />
                  </svg>
                )}
                {shadowTarget === "turtle" && (
                  <svg viewBox="0 0 100 100" className="w-48 h-48 md:w-56 md:h-56 text-black mx-auto bg-white border-4 border-indigo-400 p-4 rounded-3xl shadow-2xl cursor-pointer hover:scale-105 transition-all">
                    <path d="M26 50 Q50 18 74 50 Z M26 45 Q10 38 12 56 M32 50 Q22 84 36 78 Q40 58 44 50" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" />
                  </svg>
                )}
                {shadowTarget === "octopus" && (
                  <svg viewBox="0 0 100 100" className="w-48 h-48 md:w-56 md:h-56 text-black mx-auto bg-white border-4 border-indigo-400 p-4 rounded-3xl shadow-2xl cursor-pointer hover:scale-105 transition-all">
                    <path d="M35 50 A30 30 0 1 1 65 50 Z M35 49 Q20 70 34 85 M46 51 Q44 72 47 89" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" />
                  </svg>
                )}

                <div className="mt-3 flex items-center justify-between w-full">
                  <span className="text-[10px] text-zinc-500 font-bold">Điểm đạt được:</span>
                  <span className="text-xs bg-indigo-600/30 border border-indigo-500/20 text-indigo-400 font-extrabold px-3 py-1 rounded-full">{shadowScore} Điểm 🔥</span>
                </div>
              </div>

              {/* Interactive choices */}
              <div className="space-y-3">
                <p className="text-xs font-extrabold text-zinc-300 text-center">
                  Bấm để đoán chiếc bóng thuộc về mẫu phác họa nào:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <button
                    id="shadow-guess-whale"
                    onClick={() => handleShadowGuessSubmit("whale")}
                    className="text-left bg-zinc-950 hover:bg-zinc-850 border border-zinc-805 p-3 rounded-2xl text-xs font-extrabold text-zinc-300 hover:text-white flex items-center justify-center gap-1 transition active:scale-98 animate-fade-in"
                  >
                    🐳 Cá Voi Xanh
                  </button>
                  <button
                    id="shadow-guess-dolphin"
                    onClick={() => handleShadowGuessSubmit("dolphin")}
                    className="text-left bg-zinc-950 hover:bg-zinc-850 border border-zinc-805 p-3 rounded-2xl text-xs font-extrabold text-zinc-300 hover:text-white flex items-center justify-center gap-1 transition active:scale-98 animate-fade-in"
                  >
                    🐬 Cá Heo
                  </button>
                  <button
                    id="shadow-guess-goldfish"
                    onClick={() => handleShadowGuessSubmit("goldfish")}
                    className="text-left bg-zinc-950 hover:bg-zinc-850 border border-zinc-805 p-3 rounded-2xl text-xs font-extrabold text-zinc-300 hover:text-white flex items-center justify-center gap-1 transition active:scale-98 animate-fade-in"
                  >
                    🐠 Cá Vàng
                  </button>
                  <button
                    id="shadow-guess-shark"
                    onClick={() => handleShadowGuessSubmit("shark")}
                    className="text-left bg-zinc-950 hover:bg-zinc-850 border border-zinc-805 p-3 rounded-2xl text-xs font-extrabold text-zinc-300 hover:text-white flex items-center justify-center gap-1 transition active:scale-98 animate-fade-in"
                  >
                    🦈 Cá Mập
                  </button>
                  <button
                    id="shadow-guess-turtle"
                    onClick={() => handleShadowGuessSubmit("turtle")}
                    className="text-left bg-zinc-950 hover:bg-zinc-850 border border-zinc-855 p-3 rounded-2xl text-xs font-extrabold text-zinc-300 hover:text-white flex items-center justify-center gap-1 transition active:scale-98 animate-fade-in"
                  >
                    🐢 Rùa Biển
                  </button>
                  <button
                    id="shadow-guess-octopus"
                    onClick={() => handleShadowGuessSubmit("octopus")}
                    className="text-left bg-zinc-950 hover:bg-zinc-850 border border-zinc-855 p-3 rounded-2xl text-xs font-extrabold text-zinc-300 hover:text-white flex items-center justify-center gap-1 transition active:scale-98 animate-fade-in"
                  >
                    🐙 Bạch Tuộc
                  </button>
                </div>

                {shadowFeedback && (
                  <div className={`mt-2 p-2.5 rounded-xl border text-xs text-center font-bold animate-pulse-slow ${
                    shadowFeedback.includes("Chính xác") ? "bg-emerald-950/80 border-emerald-800 text-emerald-300" : "bg-rose-950/80 border-rose-900/40 text-rose-300"
                  }`}>
                    {shadowFeedback}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Immersive 3D Visual Exhibition Showroom */}
        {activeTab === "gallery3d" && (
          <div id="section-gallery-3d" className="max-w-6xl mx-auto">
            {!isStartedShowRoom ? (
              /* Immersive Invitation Lobby Screen */
              <div 
                id="lobby-screen" 
                className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 md:p-16 text-center shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[480px]"
                style={{
                  backgroundImage: "radial-gradient(circle at center, #1e1b4b 0%, #09090b 100%)"
                }}
              >
                {/* Visual ambient spotlights */}
                <div className="absolute top-0 left-1/4 w-32 h-64 bg-indigo-500/10 blur-3xl pointer-events-none rounded-full transform -rotate-12 animate-pulse-slow" />
                <div className="absolute top-0 right-1/4 w-32 h-64 bg-pink-500/10 blur-3xl pointer-events-none rounded-full transform rotate-12 animate-pulse-slow" />

                <div className="relative z-10 max-w-xl mx-auto space-y-6">
                  <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-pink-500 rounded-full flex items-center justify-center text-5xl shadow-2xl mx-auto transform hover:scale-110 transition duration-300">
                    🖼️
                  </div>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                    Triển Lãm Mỹ Thuật 3D Của Bé
                  </h2>
                  <p className="text-sm text-zinc-300 leading-relaxed font-semibold">
                    Chào mừng bé đến với không gian Bảo tàng Mỹ thuật 3D ảo Cô Điệp AI! Nơi quy tụ tất cả các tác phẩm vẽ tay đặc sắc của bé và các bạn nhỏ trong lớp học. Nhấn nút bên dưới để mở cửa phòng trưng bày sang trọng ngay lập tức!
                  </p>

                  <div className="pt-4 flex justify-center">
                    <button
                      id="btn-start-showroom"
                      onClick={() => {
                        playWebSynth("magic");
                        setIsStartedShowRoom(true);
                      }}
                      className="relative overflow-hidden group bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 text-white font-black text-sm md:text-base px-10 py-5 rounded-2xl shadow-[0_0_40px_rgba(99,102,241,0.5)] transition active:scale-95 flex items-center gap-3 animate-pulse cursor-pointer border border-white/20"
                    >
                      <span>🎨 BẮT ĐẦU XEM TRIỂN LÃM 🌐</span>
                    </button>
                  </div>
                </div>

                {/* Simulated frame miniatures floating in space */}
                <div className="absolute left-6 bottom-6 w-20 h-24 bg-zinc-800/80 border border-zinc-700 p-2 rounded-xl shadow-lg -rotate-12 opacity-40 hidden md:block">
                  <div className="w-full h-full bg-zinc-950 rounded-lg flex items-center justify-center text-xs">🐠</div>
                </div>
                <div className="absolute right-6 bottom-8 w-20 h-24 bg-zinc-800/80 border border-zinc-700 p-2 rounded-xl shadow-lg rotate-12 opacity-40 hidden md:block">
                  <div className="w-full h-full bg-zinc-950 rounded-lg flex items-center justify-center text-xs">⛵</div>
                </div>
              </div>
            ) : (
              /* Virtual 3D Curated Gallery Canvas & Showroom View */
              <div id="virtual-museum-view" className="space-y-6">
                
                {/* Control bar */}
                <div className="flex justify-between items-center bg-zinc-900 border border-zinc-800/80 px-6 py-4 rounded-2xl shadow-lg flex-wrap gap-3">
                  <div>
                    <h3 className="font-extrabold text-sm text-zinc-100 flex items-center gap-2">
                      🏢 Sảnh Trưng Bày Mỹ Thuật 3D Cô Điệp AI
                    </h3>
                    <p className="text-[10px] text-zinc-400 font-bold mt-0.5">Bé có thể xoay ngắm tác phẩm ở mọi góc cạnh!</p>
                  </div>
                  <button
                    id="btn-leave-showroom"
                    onClick={() => {
                      playWebSynth("click");
                      setIsStartedShowRoom(false);
                    }}
                    className="bg-zinc-800 hover:bg-zinc-750 text-zinc-300 border border-zinc-700 font-extrabold text-xs px-4 py-2 rounded-xl active:scale-95 transition"
                  >
                    🚪 Trở lại Sảnh chờ
                  </button>
                </div>

                {/* Perspective 3D Room Grid */}
                <div 
                  id="perspective-3d-room"
                  className="bg-zinc-950 border border-zinc-850 p-8 rounded-3xl relative overflow-hidden shadow-inner flex flex-col items-center"
                  style={{
                    perspective: "1000px"
                  }}
                >
                  <p className="text-zinc-500 text-xs font-bold mb-6 text-center max-w-md">
                    💫 Bấm vào bức tranh bất kì để đặt lên Tiêu Điểm Trưng Bày ở giữa phòng nhé:
                  </p>

                  {/* Active detailed display podium */}
                  <div className="w-full max-w-xl bg-zinc-900/90 border border-zinc-800 p-6 rounded-3xl shadow-2xl mb-8 transform-gpu relative group">
                    {/* Perspective floor shadow */}
                    <div className="absolute -bottom-4 inset-x-12 h-6 bg-indigo-500/10 blur-xl rounded-full" />
                    
                    {/* Display Item Name Tag */}
                    <div className="absolute top-4 left-4 bg-zinc-950/80 border border-zinc-800 px-3 py-1.5 rounded-full shadow text-[10px] font-black text-indigo-400">
                      🏆 TIÊU ĐIỂM SỐ 1
                    </div>

                    <div className="flex flex-col items-center py-4">
                      {/* Interactive frame that users can visually tilt */}
                      <div className="p-4 bg-orange-950/20 border-8 border-yellow-600 rounded-3xl shadow-[0_15px_30px_rgba(0,0,0,0.6)] transform hover:rotate-2 transition duration-300 w-64 h-64 flex items-center justify-center bg-zinc-950 relative overflow-hidden">
                        {savedArtworks.length > 0 ? (
                          <img
                            src={savedArtworks[0].dataUrl}
                            className="w-full h-full object-contain"
                            alt="Main featured canvas"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          // Fallback to preloaded first student artwork
                          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                            <span className="text-5xl mb-2 animate-bounce">🎨</span>
                            <span className="text-[10px] text-zinc-400 font-bold leading-normal">
                              Chưa có tranh tự vẽ của bé được lưu trữ. Dưới đây là bài nộp được duyệt đầu tiên!
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-5 text-center">
                        <h4 className="text-zinc-200 font-black text-sm uppercase tracking-wide">
                          {savedArtworks.length > 0 ? savedArtworks[0].title : `Tác Phẩm Mẫu Lớp Học`}
                        </h4>
                        <p className="text-[10px] text-zinc-500 font-bold mt-1">
                          Người vẽ: {savedArtworks.length > 0 ? `Bé Sáng Tạo` : `Bản vẽ của Lớp`} • {savedArtworks.length > 0 ? savedArtworks[0].timestamp : `Vừa xong`}
                        </p>
                      </div>

                      {/* Sparkle comment frame */}
                      <div className="mt-4 w-full bg-zinc-950/80 border border-zinc-850 p-4 rounded-2xl relative">
                        <span className="absolute -top-2.5 left-4 bg-indigo-900 border border-indigo-500/30 text-indigo-300 text-[8px] font-black px-2 py-0.5 rounded-full uppercase">
                          Lời phê Cô Điệp AI
                        </span>
                        <p className="text-xs text-zinc-300 italic font-semibold leading-relaxed mt-1">
                          "Bức tranh thật sáng tạo và lấp lánh tinh nghịch! Sắc độ màu hài hoà, tràn đầy năng lượng tươi mới mĩ thuật!"
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Grid list of other hanging paintings in the museum */}
                  <div className="w-full">
                    <h4 className="text-zinc-300 text-xs font-black mb-4 border-b border-zinc-800 pb-2 flex items-center gap-1.5">
                      🖼️ Các Tác Phẩm Khác Khắp Phòng Triển Lãm:
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Dynamic loop from SavedArtworks first */}
                      {savedArtworks.map((art, index) => (
                        <div 
                          key={`saved-${index}`}
                          className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl hover:border-indigo-500 transition-all duration-300 shadow-md group cursor-pointer"
                          onClick={() => {
                            playWebSynth("success");
                            // Simply swap item or play sound
                          }}
                        >
                          <div className="aspect-square bg-zinc-950 rounded-xl overflow-hidden border-2 border-zinc-800 p-2 flex items-center justify-center relative">
                            <img src={art.dataUrl} className="w-full h-full object-contain group-hover:scale-105 transition" alt="Saved frame" referrerPolicy="no-referrer" />
                          </div>
                          <div className="mt-2 text-center">
                            <p className="text-[10px] font-extrabold text-zinc-200 truncate">{art.title}</p>
                            <span className="text-[8px] text-indigo-400 font-bold block mt-0.5">Xoay 3D sẵn sàng 🔄</span>
                          </div>
                        </div>
                      ))}

                      {/* Display Class pre-submitted student artworks as well to fully populate */}
                      {students.map((stud) => (
                        <div 
                          key={`stud-${stud.id}`}
                          className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl hover:border-indigo-600 transition-all duration-300 shadow-md flex flex-col justify-between group cursor-pointer"
                          onClick={() => {
                            playWebSynth("click");
                          }}
                        >
                          <div className="aspect-square bg-zinc-950 rounded-xl overflow-hidden border-2 border-zinc-800 p-3 flex flex-col items-center justify-center relative">
                            {/* Visual sample representation of artwork sketch shape */}
                            {stud.artworkType === "fish" && (
                              <svg viewBox="0 0 100 100" className="w-16 h-16 text-indigo-500 fill-none stroke-current" strokeWidth="2.5">
                                <path d="M15 50 Q40 15 75 50 Q40 85 15 50 Z M75 50 L90 30 L84 50 L90 70 Z" />
                              </svg>
                            )}
                            {stud.artworkType === "bird" && (
                              <svg viewBox="0 0 100 100" className="w-16 h-16 text-teal-400 fill-none stroke-current" strokeWidth="2.5">
                                <path d="M35 15 A20 20 0 0 0 35 55 A20 20 0 0 0 35 15 Z M28 38 L10 42 L28 46 Z" />
                              </svg>
                            )}
                            {stud.artworkType === "pagoda" && (
                              <svg viewBox="0 0 100 100" className="w-16 h-16 text-amber-500 fill-none stroke-current" strokeWidth="2.5">
                                <path d="M50 15 L20 40 L25 40 L25 75 L75 75 L75 40 Z" />
                              </svg>
                            )}
                            {stud.artworkType === "halong" && (
                              <svg viewBox="0 0 100 100" className="w-16 h-16 text-rose-500 fill-none stroke-current" strokeWidth="2.5">
                                <path d="M5 85 Q15 30 28 85 M32 85 Q45 45 55 85 M64 85 Q78 35 92 85" strokeLinecap="round" />
                              </svg>
                            )}
                            <span className="text-[8px] text-zinc-500 font-bold uppercase mt-1">Tranh {stud.artworkType}</span>
                          </div>
                          <div className="mt-2 text-center">
                            <p className="text-[10px] font-extrabold text-zinc-200 truncate">Vẽ bởi bé {stud.name}</p>
                            <span className="text-[8px] text-zinc-400 font-bold block mt-0.5">{stud.className} • Trưng Bày ✅</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: Schoolroom Class homework submission & AI critic panel */}
        {activeTab === "teacher-ai" && (
          <div id="section-teacher-ai" className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-6xl mx-auto">
            
            {/* Student list card */}
            <div className="lg:col-span-7 bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-xl flex flex-col">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h3 className="font-extrabold text-zinc-200 text-sm flex items-center gap-1.5">
                  🎒 Quản lý Bài Nộp Lớp Vẽ AR 3A
                </h3>
              </div>

              {/* Grid or stack list */}
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                {students.map((stud) => (
                  <div
                    key={stud.id}
                    className="p-3.5 bg-zinc-950/60 border border-zinc-850 rounded-2xl hover:border-zinc-800 transition flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-extrabold text-indigo-400 text-xs">
                        {stud.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-zinc-250">
                          {stud.name} ({stud.className})
                        </h4>
                        <p className="text-[10px] text-zinc-500 font-bold">
                          Bài tô mẫu: {stud.artworkType} • {stud.timeAgo}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      id={`btn-critique-${stud.id}`}
                      onClick={() => triggerTeacherAISupervision(stud.name, stud.artworkType)}
                      className="bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition"
                    >
                      AI Nhận Xét ✨
                    </button>
                  </div>
                ))}
              </div>

              {/* Administrative homework assignment form */}
              <form onSubmit={handleAddNewHomework} className="mt-5 pt-4 border-t border-zinc-800 space-y-3">
                <p className="text-xs font-bold text-zinc-400">➕ Giao việc vẽ mới cho bé khác:</p>
                <div className="flex flex-wrap gap-3 items-end">
                  <div className="flex-grow min-w-[200px]">
                    <input
                      id="input-student-name"
                      type="text"
                      required
                      placeholder="Nhập tên bé, ví dụ: Minh Tiến"
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      className="w-full text-xs p-2.5 bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-zinc-100 rounded-xl outline-none font-medium"
                    />
                  </div>
                  <div>
                    <select
                      id="select-student-tpl"
                      value={newStudentTemplate}
                      onChange={(e) => setNewStudentTemplate(e.target.value as TemplateType)}
                      className="text-xs p-2.5 bg-zinc-950 border border-zinc-800 text-zinc-300 outline-none font-bold rounded-xl"
                    >
                      <option value="fish">Cá Vàng Đại Dương 🐠</option>
                      <option value="bird">Bồ Câu Hòa Bình 🐦</option>
                      <option value="pagoda">Chùa Một Cột 🏛️</option>
                      <option value="halong">Vịnh Hạ Long ⛵</option>
                    </select>
                  </div>
                  <button
                    id="btn-add-student"
                    type="submit"
                    className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-750 text-zinc-150 font-extrabold text-xs px-4 py-2.5 rounded-xl text-center active:scale-95 transition"
                  >
                    Giao & Thêm
                  </button>
                </div>
              </form>
            </div>

            {/* Real Gemini feedback display */}
            <div className="lg:col-span-5 bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-md flex flex-col justify-between">
              
              <div className="text-center mb-3">
                <span className="text-4xl animate-bounce mb-1 inline-block">👩‍🏫</span>
                <h3 className="font-extrabold text-indigo-400 text-md">Cô Điệp AI Nhận Xét</h3>
                <p className="text-[10px] text-zinc-500 font-bold">Khen ngợi truyền sinh khí theo phương pháp sư phạm mĩ thuật!</p>
              </div>

              {/* Text dialogue card */}
              <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-2xl flex-grow mb-4 relative overflow-hidden min-h-[160px]">
                <div className="absolute top-2 right-2 flex items-center gap-1 text-[8px] md:text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full shadow-sm animate-pulse border border-emerald-500/20">
                  <Sparkles className="w-2.5 h-2.5" /> HOẠT ĐỘNG
                </div>
                <p className="text-xs font-bold text-indigo-400 mb-2">💬 Nhận xét sư phạm truyền cảm hứng:</p>
                {isAiLoading ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-3">
                    <div className="w-8 h-8 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
                    <span className="text-xs font-bold text-zinc-400 animate-pulse">Cô Điệp đang ngắm tranh và viết lời bình dễ thương...</span>
                  </div>
                ) : (
                  <p id="ai-feedback-text" className="text-xs text-zinc-300 leading-relaxed font-semibold italic">
                    "{aiEvaluation}"
                  </p>
                )}
              </div>

              {/* Synthesized Vietnamese Speech Button */}
              <button
                id="btn-play-ai-comment"
                onClick={() => speakPedagogicalText(aiEvaluation)}
                disabled={isAiLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 active:scale-98 text-white font-extrabold text-xs py-3 rounded-2xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Volume2 className="w-4 h-4" /> Đọc Lời Phê Bằng Giọng Cô Điệp AI
              </button>
            </div>

          </div>
        )}

      </main>

      {/* 2. Rewards Badge overlay modal */}
      <AnimatePresence>
        {showRewardModal && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <motion.div
              id="reward-modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative"
            >
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-indigo-600 border border-indigo-500 p-4 rounded-full shadow-lg">
                <Award className="text-white w-12 h-12" />
              </div>
              
              <div className="pt-6">
                <span className="text-5xl animate-bounce mb-1 inline-block">🏆</span>
                <h3 className="text-2xl font-extrabold text-indigo-400 mt-2">Bé Nhận Huy Hiệu Mới!</h3>
                <p id="reward-badge-title" className="font-extrabold text-zinc-200 text-lg mt-1 decoration-indigo-400 underline decoration-wavy">
                  {rewardBadgeName}
                </p>
                <p className="text-xs text-zinc-400 mt-3 font-medium leading-relaxed">
                  Chúc mừng bạn nhỏ thông thái đã hoàn thành xuất sắc thử thách sáng tạo và nhận được thưởng thêm <span className="text-indigo-400 font-extrabold">+20 Sao Thần Kỳ</span>!
                </p>

                <button
                  id="btn-close-reward"
                  onClick={() => {
                    setShowRewardModal(false);
                    playWebSynth("click");
                  }}
                  className="mt-5 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500 font-extrabold text-sm rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Nhận Sao Thưởng ⭐
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Creative guidelines handbook Modal */}
      <AnimatePresence>
        {showGuideModal && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <motion.div
              id="guide-modal-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-8 shadow-2xl relative text-zinc-100"
            >
              {/* Close mark */}
              <button
                id="btn-close-guide"
                onClick={() => {
                  setShowGuideModal(false);
                  playWebSynth("click");
                }}
                className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 text-2xl font-bold p-1 cursor-pointer"
              >
                &times;
              </button>

              <div className="text-center mb-5">
                <span className="text-5xl">📖</span>
                <h3 className="text-2xl font-extrabold text-zinc-150 mt-2">
                  Cẩm Nang Sáng Tạo Magic Art
                </h3>
                <p className="text-xs text-zinc-400 font-bold">Hãy lựa chọn để xem các mẹo hữu ích từ Cô Điệp nhé!</p>
              </div>

              {/* Tab options inside guide */}
              <div className="flex border-b border-zinc-800 mb-4 justify-center gap-2">
                <button
                  id="guide-tab-student"
                  onClick={() => {
                    setGuideTab("student-guide");
                    playWebSynth("click");
                    speakPedagogicalText("Các bạn nhỏ hãy tô màu thật rực rỡ rồi quét tranh phép thuật nha!");
                  }}
                  className={`font-extrabold text-xs px-4 py-2 rounded-t-xl transition ${
                    guideTab === "student-guide" ? "bg-indigo-600/30 border-b-2 border-indigo-505 text-white" : "bg-zinc-950 text-zinc-400"
                  }`}
                >
                  🎒 Cho Học Sinh
                </button>
                <button
                  id="guide-tab-parent"
                  onClick={() => {
                    setGuideTab("parent-guide");
                    playWebSynth("click");
                    speakPedagogicalText("Quý phụ huynh hãy hỗ trợ các con mở camera thiết bị hoặc lưu giữ tranh kỉ niệm nhé!");
                  }}
                  className={`font-extrabold text-xs px-4 py-2 rounded-t-xl transition ${
                    guideTab === "parent-guide" ? "bg-indigo-600/30 border-b-2 border-indigo-505 text-white" : "bg-zinc-950 text-zinc-400"
                  }`}
                >
                  👨‍👩‍👦 Cho Phụ Huynh
                </button>
                <button
                  id="guide-tab-teacher"
                  onClick={() => {
                    setGuideTab("teacher-guide");
                    playWebSynth("click");
                    speakPedagogicalText("Quý thầy cô có thể dùng nhận xét AI của Chuyên gia mĩ thuật để khen ngợi học sinh.");
                  }}
                  className={`font-extrabold text-xs px-4 py-2 rounded-t-xl transition ${
                    guideTab === "teacher-guide" ? "bg-indigo-600/30 border-b-2 border-indigo-550 text-white" : "bg-zinc-950 text-zinc-400"
                  }`}
                >
                  👩‍🏫 Cho Giáo Viên
                </button>
              </div>

              {/* Dynamic text blocks */}
              <div className="text-zinc-300 text-sm leading-relaxed space-y-4">
                
                {guideTab === "student-guide" && (
                  <div id="student-guide-view" className="bg-zinc-950 p-4 rounded-2xl border border-zinc-850">
                    <p className="font-extrabold text-indigo-400 text-xs uppercase mb-2">⭐ Nhiệm vụ họa sĩ nhí:</p>
                    <ul className="list-decimal list-inside text-xs text-zinc-400 space-y-2 font-medium">
                      <li><strong>BƯỚC 1: Sáng tạo tranh:</strong> Hãy chọn đề tài Cá Vàng 🐠, Chim Bồ Câu 🐦, Chùa Một Cột 🏛️, hay Hạ Long ⛵, sau đó dùng cọ vẽ tô những bành màu sắc xinh đẹp nhất.</li>
                      <li><strong>BƯỚC 2: Quét phép thuật AR:</strong> Nhấn nút "PHÉP THUẬT QUÉT AR TRANH NÀY!". Tranh vẽ của bé sẽ chầm chậm "Sống Dậy" và bay nhảy trước mắt!</li>
                      <li><strong>BƯỚC 3: Trò chơi mĩ thuật:</strong> Sang Tab 3 pha màu sắc đỏ, vàng, lam để tạo màu cam, xanh lá cây cực kỳ thông minh nhe!</li>
                    </ul>
                  </div>
                )}

                {guideTab === "parent-guide" && (
                  <div id="parent-guide-view" className="bg-zinc-950 p-4 rounded-2xl border border-zinc-850">
                    <p className="font-extrabold text-indigo-400 text-xs uppercase mb-2">📸 Hỗ trợ bé chơi mĩ học tại nhà:</p>
                    <ul className="list-disc list-inside text-xs text-zinc-400 space-y-2 font-medium pl-1">
                      <li><strong>Sử dụng camera thật:</strong> Trong phòng AR, phụ huynh hãy bật tính năng Camera Thật của thiết bị di động để thấy chú cá của bé bơi lượn ngay trên mặt bàn căn phòng của cả nhà!</li>
                      <li><strong>Trưng bày 3D:</strong> Lưu tranh để treo lên tủ trưng bày cổ điển trong không gian 3D, bé có thể xoay ngắm và có thêm hứng thú học vẽ nâng cao.</li>
                    </ul>
                  </div>
                )}

                {guideTab === "teacher-guide" && (
                  <div id="teacher-guide-view" className="bg-zinc-950 p-4 rounded-2xl border border-zinc-850">
                    <p className="font-extrabold text-indigo-400 text-xs uppercase mb-2">🏫 Giáo án sư phạm mĩ thuật kết hợp AI:</p>
                    <ul className="list-disc list-inside text-xs text-zinc-400 space-y-2 font-medium pl-1">
                      <li><strong>Đánh giá toàn diện:</strong> Trí tuệ nhân tạo AI của Cô Điệp có khả năng nhận biết màu sắc mĩ học thực tế của tranh vẽ, bình luận với tâm tính sư phạm tuyệt vời để khuyến khích phát triển tiềm năng sáng tạo của trẻ nhỏ.</li>
                    </ul>
                  </div>
                )}

              </div>

              <div className="mt-6 flex justify-between items-center gap-3 flex-wrap">
                <button
                  id="btn-audio-guide"
                  onClick={() => {
                    playWebSynth("success");
                    speakPedagogicalText("Để xem hướng dẫn chi tiết, con hãy chọn tab Học sinh, Phụ huynh hoặc Giáo viên nhé!");
                  }}
                  className="text-xs bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-extrabold px-3.5 py-2 rounded-xl border border-zinc-700"
                >
                  🔊 Thuyết minh
                </button>
                <button
                  id="btn-close-guide-main"
                  onClick={() => {
                    setShowGuideModal(false);
                    playWebSynth("click");
                  }}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow border border-indigo-500"
                >
                  Đã Hiểu! Bắt Đầu Sáng Tạo 🎨
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer component */}
      <footer className="mt-auto py-6 bg-zinc-950 text-zinc-500 text-center border-t border-zinc-900">
        <p className="text-xs font-bold tracking-wider">
          Magic Art Việt Nam © 2026 - Mĩ thuật sống động tích hợp AI & Công nghệ 3D
        </p>
        <p className="text-[10px] text-zinc-650 mt-1">
          Dành cho đổi mới giáo dục tiểu học và kích phát tiềm năng hội họa của bé.
        </p>
      </footer>

    </div>
  );
}
