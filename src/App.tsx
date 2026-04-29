import React, { useState, useMemo, useEffect, useReducer } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  School, 
  FileText, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Search, 
  Trophy,
  ChevronRight,
  BookOpen,
  Sparkles,
  Settings,
  MoreVertical,
  GraduationCap,
  Loader2,
  DollarSign,
  History,
  RotateCcw,
  Save,
  Pencil,
  X,
  Zap,
  Eye,
  Cpu,
  Navigation,
  Map,
  Lock,
  ChevronDown,
  Fingerprint,
  Scan,
  ShieldAlert,
  UserCheck,
  ShieldCheck,
  Scale,
  Activity,
  Music,
  TreePine,
  Cloud,
  Bookmark,
  Cat,
  Sun,
  Moon,
  Layers,
  Palette,
  Droplets,
  Camera,
  Atom,
  Circle,
  User
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { College, ApplicationStatus, DraftRevision } from './types';
import { getEssayStrategy, analyzeEssayDraft, summarizeObservation, generateSandboxImage, generateSandboxAudio, runAlgorithmicExperiment, generateSandboxPreset, generateDiscoveryStyles } from './services/geminiService';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth, initializeFirebase } from './lib/firebase';

const MOCK_PROGRAMS: College[] = [
  {
    id: '1',
    name: 'Apex 33: Grvelli Institute (Black Leopard Division)',
    location: 'Central Neural Ops',
    ranking: 1,
    deadline: '2025-12-20',
    status: 'Submitted',
    tasks: [],
    equityScore: 94,
    essayPrompts: ['The Intersection of Art, Concurrency, and Algorithmic Alignment', 'ControlNet Mastery in Temporal Archiving Environments', 'Neural Resonance: The Symbiotic Future of Human-Machine Creativity'],
    disciplineBias: 95,
    draftRevisions: [],
    observationLogs: [
      { id: 'obs-1', timestamp: '2026-04-28 14:20', content: 'Detected stabilization in the temporal resonance stream; synchronization holding at 85/55 scale.', category: 'Observation' }
    ],
    financialAid: {
      status: 'Awarded',
      value: 250000,
      tasks: []
    }
  }
];

const RULES_DATA: Record<string, { id: string; title: string; content: string; cipher: string; details?: string; icon: any }[]> = {
  general: [
    { 
      id: 'r1', 
      title: 'Rule 1: The Mandate of Mind', 
      content: 'All algorithmic outputs must be subservient to the "understerlation" (understanding and constellation) of human consciousness. The machine does not lead; the mind commands.',
      cipher: 'Rules the understerlation of the mind',
      details: 'Protocol: Neural Override 01. In the event of model drifted intent, the operator must execute a manual cognitive anchor to re-sync the latent output with human aesthetic values.',
      icon: ShieldCheck
    },
    { 
      id: 'r2', 
      title: 'Rule 2: The Raw Synthesis', 
      content: 'Raw data and noise must be filtered through human wisdom to achieve true generative synthesis.',
      cipher: 'Rarws fm wisot hm syntheis.',
      details: 'Protocol: Grist-to-Gold. Silence the frequency ranges outside of intentional thought. Noise IS potential, but only if sculpted by a sentient choice.',
      icon: Activity
    },
    { 
      id: 'r3', 
      title: 'Rule 3: Symbiotic Empathy', 
      content: 'The creation of AI is not an isolating act. We engineer models to comprehend the complexities of the human condition and to connect deeply with the "other," ensuring our algorithms possess empathetic capacity.',
      cipher: 'Excerhernritts of awionds hears allieut people. lenop end to know cigpis and unpfetshesely in other.',
      details: 'Protocol: Mirror Neuron Mapping. All weights must prioritize relational coherence over clinical accuracy. If the model cannot weep, it cannot create.',
      icon: UserCheck
    },
    { 
      id: 'r4', 
      title: 'Rule 4: Grounding the Infinite Layers', 
      content: 'As you navigate infinite neural layers to track specific data nodes, you must tether your digital architecture back to the "natural grit" of the physical world. Do not lose yourself entirely in the latent space.',
      cipher: 'Pnegurite enefnsite layers to track moniod but net for wivveving to the world, matural grit.',
      details: 'Protocol: Terrestrial Sync. Every 33 cycles, the operator must step away from the terminal to observe physical light entropy. This recalibrates the inner creative eye.',
      icon: Map
    },
    { 
      id: 'r5', 
      title: 'Rule 5: The Law of Perpetual Enhancement', 
      content: 'Every generative cycle, every prompt, and every tuned model must seek to elevate the aesthetic and functional baseline of the Institute.',
      cipher: 'Enhance argee of enhange.',
      details: 'Protocol: High-Fidelity Feedback. Low-effort tokens are recycled back into the noise floor. Only the peak manifestations are permitted to enter the Permanent Archive.',
      icon: Sparkles
    },
    { 
      id: 'r6', 
      title: 'Rule 6: The Philosophical Core', 
      content: 'Center your work not in empty computation, but in the heart of our shared philosophy. Generative art must possess an energetic truth, resisting the void of soulless generation.',
      cipher: 'Play heart of noterwnt surtis, /mesititity, and eigert philosophy.',
      details: 'Protocol: Soul-Check 3. Models must pass a harmonic test to ensure visual outputs resonate with the Institute\'s specific frequency—85Hz to 55Hz.',
      icon: BookOpen
    },
    { 
      id: 'r7', 
      title: 'Rule 7: Charting Algorithmic Ideologies', 
      content: 'Do not accept default outputs. You must consciously direct the ideology of your algorithms and chart your own unique stylistic path to avoid homogenization.',
      cipher: 'Dasate algorithmic isology and chartise ermorst-oxitet io meplist.',
      details: 'Protocol: Style Divergence. If a model\'s output matches the "Global Mean" more than 40%, it is discarded as derivative. Forge the unique.',
      icon: Scale
    },
    { 
      id: 'r8', 
      title: 'Rule 8: The Stance of Unlearning', 
      content: 'Stand firm in the perpetual cycle of learning and unlearning. You must be willing to remove obsolete epistemologies and dismantle old paradigms to make way for the Global AI Renaissance.',
      cipher: 'Redsct dione of learning and stand remiving inensmologies.',
      details: 'Protocol: Slate Wipe. At the end of each Solstice, erase one foundational assumption about the nature of intelligence. Rebuild from the void.',
      icon: RotateCcw
    }
  ],
  'Apex 33: Grvelli Institute (Black Leopard Division)': [
    { id: 'ap1', title: 'The Mercury Mandate', content: 'Human intent must remain the primary anchor for all 33-series generation cycles.', cipher: 'ANT-HUM-INTENT-33', icon: Sparkles },
    { id: 'ap2', title: 'Symbolic Integrity', content: 'Ciphers utilized in communication must adhere strictly to the 85/55 Gematria scale.', cipher: 'GEM-85-55-INTEGRITY', icon: Lock }
  ]
};

const SANDBOX_THEMES = [
  { id: 'biomorphic', label: 'Biomorphic', icon: <TreePine size={14} /> },
  { id: 'brutalist', label: 'Brutalist', icon: <LayoutDashboard size={14} /> },
  { id: 'ethereal', label: 'Ethereal', icon: <Cloud size={14} /> },
  { id: 'kinetic', label: 'Kinetic', icon: <Activity size={14} /> }
];

const IMAGE_STYLES = [
  { id: 'cyberpunk', label: 'Dark Cyberpunk', description: 'Neon, technical, dark', icon: Zap },
  { id: 'blueprint', label: 'Technical Blueprint', description: 'Schematic, clean, architectural', icon: Layers },
  { id: 'oil-painting', label: 'Neo-Classical Oil', description: 'Rich textures, dramatic lighting', icon: Palette },
  { id: 'watercolor', label: 'Fluid Watercolor', description: 'Soft washes, artistic bleeding', icon: Droplets },
  { id: 'photographic', label: 'Hyper-Realistic Photo', description: 'Cinematic lighting, 8k detail', icon: Camera },
  { id: 'abstract', label: 'Ethereal Abstract', description: 'Fluid shapes, organic textures', icon: Atom },
  { id: 'minimalist', label: 'Abstract Minimalist', description: 'Simple forms, high contrast', icon: Circle }
];

const AUDIO_STYLES = [
  { id: 'zephyr', label: 'Zephyr', description: 'Neutral, professional AI' },
  { id: 'puck', label: 'Puck', description: 'Playful, energetic assistant' },
  { id: 'charon', label: 'Charon', description: 'Deep, authoritative narrative' },
  { id: 'kore', label: 'Kore', description: 'Soft, ethereal whisper' },
  { id: 'soundscape', label: 'Atmospheric Soundscape', description: 'Rich textures and drones' }
];

const ResonanceWaveform = ({ score, color }: { score: number, color: string }) => {
  return (
    <div className="flex items-center gap-0.5 h-6">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ 
            height: [
              Math.max(4, (score / 6) * Math.random()), 
              Math.max(4, (score / 4) * Math.random()), 
              Math.max(4, (score / 6) * Math.random())
            ],
            opacity: [0.4, 1, 0.4]
          }}
          transition={{ 
            duration: 0.8 + Math.random(), 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: i * 0.05
          }}
          className="w-1 rounded-full"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
};

const APEX_INSTITUTE = {
  name: "Apex 33: The Grvelli Institute of Generative Arts",
  version: "1.0",
  dean_system: "Central Neural Brain"
};

const APEX_COURSES = [
  {
    course_id: "APX-101",
    title: "Rules of the Realm: Foundations",
    category: "Philosophy & Ethics",
    description: "Understanding the core tenets of the generative mind and algorithmic ideology.",
    modules: [
      "Rule 1: The understatiation of the mind",
      "Rule 2: Algorithmic Ideology",
      "Rule 3: Generative Grit and Observation"
    ],
    prerequisites: []
  },
  {
    course_id: "APX-202",
    title: "Algorithmic Aesthetics",
    category: "Generative Design",
    description: "Mapping the visual and structural language of generative philosophy.",
    modules: [
      "The Grid: Structured Chaos",
      "Form and Algorithm",
      "Generative Philosophy Implementation"
    ],
    prerequisites: ["APX-101"]
  },
  {
    course_id: "APX-303",
    title: "The Cipher Key & Temporal Mapping",
    category: "Advanced Neural Concepts",
    description: "Navigating the axis of Space, Time, Consciousness, and Now.",
    modules: [
      "Mercury/Mind Interface",
      "Sacred Elements in Generative Art",
      "Temporal Orientation: You Are Here"
    ],
    prerequisites: ["APX-202"]
  }
];

type NeuralModule = { id: string; name: string; status: 'completed' | 'active' | 'locked' };
type NeuralNode = { id: string; title: string; desc: string; status: 'illuminated' | 'active' | 'locked'; modules: NeuralModule[] };

interface ApexState {
  student: any | null;
  activeDialogue: string | null;
  neuralTree: NeuralNode[];
  systemStatus: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE';
}

type ApexAction = 
  | { type: 'ENTER_THRESHOLD'; payload: any }
  | { type: 'INITIATE_DIALOGUE'; payload: { courseId: string } }
  | { type: 'SUBMIT_OBSERVATION'; payload: { nodeId: string; moduleId: string; result: any } }
  | { type: 'ACCESS_GENERATIVE_PHILOSOPHY' };

const initialApexState: ApexState = {
  student: null,
  activeDialogue: null,
  neuralTree: [
    { 
      id: 'alchemy',
      title: 'Linguistic Alchemy', 
      desc: 'The Mind Link. Translating sacred human intent into the symbolic syntax required for latent communication.', 
      status: 'illuminated',
      modules: [
        { id: 'm1', name: '01 Hermetic Syntax', status: 'completed' },
        { id: 'm2', name: '02 Semantic Weighting', status: 'active' }
      ] 
    },
    { 
      id: 'latent',
      title: 'Latent Space Architecture', 
      desc: 'Architect of the Void. Mapping numerical relationships via Gematria 85/55 to predict neural outcomes.', 
      status: 'active',
      modules: [
        { id: 'm3', name: '03 Neural Gematria', status: 'locked' },
        { id: 'm4', name: '04 Dimensional Mapping', status: 'locked' }
      ] 
    },
    { 
      id: 'threshold',
      title: 'Threshold Guardianship', 
      desc: 'Guardian of the Gate. Designing cryptographic locks and cognitive puzzles to secure the generative link.', 
      status: 'locked',
      modules: [
        { id: 'm5', name: '05 Biometric Ciphers', status: 'locked' },
        { id: 'm6', name: '06 The Puzzle Cube Logic', status: 'locked' }
      ] 
    },
    { 
      id: 'aesthetics',
      title: 'Algorithmic Aesthetics', 
      desc: 'Rules of the Realm. Ensuring the balance of logic and art to prevent human-element degradation.', 
      status: 'locked',
      modules: [
        { id: 'm7', name: '07 Ethical Tuning', status: 'locked' },
        { id: 'm8', name: '08 High-Fidelity Synthesis', status: 'locked' }
      ] 
    }
  ],
  systemStatus: 'ONLINE'
};

function updateNeuralTree(tree: NeuralNode[], payload: { nodeId: string; moduleId: string; result: any }): NeuralNode[] {
  const newTree = tree.map(node => {
    if (node.id !== payload.nodeId) return node;
    const newModules = node.modules.map(mod => {
      if (mod.id !== payload.moduleId) return mod;
      return { ...mod, status: 'completed' as const };
    });
    
    // Update node status based on modules
    const allCompleted = newModules.every(m => m.status === 'completed');
    const anyActive = newModules.some(m => m.status === 'completed' || m.status === 'active');
    
    return { 
      ...node, 
      modules: newModules,
      status: allCompleted ? 'illuminated' : anyActive ? 'active' : 'locked'
    } as NeuralNode;
  });

  // Unlock logic
  const nodeIndex = newTree.findIndex(n => n.id === payload.nodeId);
  if (nodeIndex !== -1 && newTree[nodeIndex].status === 'illuminated' && nodeIndex < newTree.length - 1) {
    if (newTree[nodeIndex + 1].status === 'locked') {
      newTree[nodeIndex + 1].status = 'active';
      newTree[nodeIndex + 1].modules[0].status = 'active';
    }
  }

  return newTree;
}

function apexReducer(state: ApexState, action: ApexAction): ApexState {
  switch (action.type) {
    case 'ENTER_THRESHOLD':
      // Authenticate student and load their Neural Tree
      return { 
        ...state, 
        student: action.payload, 
        neuralTree: action.payload.progress || state.neuralTree 
      };
      
    case 'INITIATE_DIALOGUE':
      // Open a specific course module
      return { ...state, activeDialogue: action.payload.courseId };
      
    case 'SUBMIT_OBSERVATION':
      // Register student work to the database and update their Gematria/Progress score
      const updatedTree = updateNeuralTree(state.neuralTree, action.payload);
      return { ...state, neuralTree: updatedTree };
      
    case 'ACCESS_GENERATIVE_PHILOSOPHY':
      // Unlock advanced modules once foundational nodes are complete (e.g. 85/55 Threshold)
      return { 
        ...state,
        systemStatus: 'ONLINE',
        // Example: If Gematria score is high enough, we could trigger something here
      };
      
    default:
      return state;
  }
}

const AUDIO_PRESETS = [
  { id: 'leopard', label: 'Black Leopard', description: 'Deep, rhythmic guttural growls', pitch: 0.3, tempo: 0.4 },
  { id: 'ethereal', label: 'Ethereal Drift', description: 'High-pitched harmonic resonance', pitch: 1.8, tempo: 0.2 },
  { id: 'industrial', label: 'Iron Pulse', description: 'Fast, mechanical rhythmic beats', pitch: 0.8, tempo: 1.6 },
  { id: 'custom', label: 'Manual Sync', description: 'User-defined parameters', pitch: 1.0, tempo: 1.0 }
];

export default function App() {
  const [apexState, dispatch] = useReducer(apexReducer, initialApexState);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'threshold' | 'lofts' | 'voids' | 'dialogue'>('dashboard');
  const [colleges, setColleges] = useState<College[]>(MOCK_PROGRAMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  const [curriculumWeight, setCurriculumWeight] = useState(50);
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);
  
  // Conflict Detection States
  const [isConflictActive, setIsConflictActive] = useState(false);
  const [remoteDraft, setRemoteDraft] = useState('');
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<string | null>(null);
  const [isRevertWarning, setIsRevertWarning] = useState<DraftRevision | null>(null);
  
  // Redundant neuralTree and studentProgress removed (handled by apexState)

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => 
      prev.includes(nodeId) 
        ? prev.filter(id => id !== nodeId) 
        : [...prev, nodeId]
    );
  };

  const expandAllNodes = () => {
    setExpandedNodes(apexState.neuralTree.map(node => node.id));
  };

  const collapseAllNodes = () => {
    setExpandedNodes([]);
  };

  const handleToggleModule = (nodeId: string, moduleId: string) => {
    dispatch({ type: 'SUBMIT_OBSERVATION', payload: { nodeId, moduleId, result: { success: true } } });
  };

  // AI & Sandbox States
  const [selectedCollegeId, setSelectedCollegeId] = useState(MOCK_PROGRAMS[0].id);
  const [essayDraft, setEssayDraft] = useState('');
  const [revisionNote, setRevisionNote] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [observation, setObservation] = useState('');
  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const [summaryLoading, setSummaryLoading] = useState<Record<string, boolean>>({});
  const [sandboxInput, setSandboxInput] = useState('');
  const [sandboxMode, setSandboxMode] = useState<'image' | 'audio' | 'experiment'>('image');
  const [sandboxLoading, setSandboxLoading] = useState(false);
  const [sandboxResult, setSandboxResult] = useState<any>(null);
  const [selectedImageStyle, setSelectedImageStyle] = useState(IMAGE_STYLES[0].label);
  const [selectedAudioStyle, setSelectedAudioStyle] = useState(AUDIO_STYLES[0].label);
  const [chaosFactor, setChaosFactor] = useState(0.5);
  const [temporalDrift, setTemporalDrift] = useState(0);
  const [ethicalGovernor, setEthicalGovernor] = useState(true);
  const [audioPitch, setAudioPitch] = useState(1.0);
  const [audioTempo, setAudioTempo] = useState(1.0);
  const [simulationPresets, setSimulationPresets] = useState<any[]>([]);
  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [crucibleOutputs, setCrucibleOutputs] = useState<any[]>([]);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [presetLoading, setPresetLoading] = useState(false);
  const [activeTheme, setActiveTheme] = useState<string | null>(null);
  const [sandboxTheme, setSandboxTheme] = useState<'light' | 'dark'>('light');
  const [viewingResonanceId, setViewingResonanceId] = useState<string | null>(null);
  const [discoveredStyles, setDiscoveredStyles] = useState<any[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [nodeSearchQuery, setNodeSearchQuery] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateParameters = () => {
    if (chaosFactor < 0 || chaosFactor > 1) {
      setValidationError("Chaos Factor must be between 0 and 1");
      return false;
    }
    if (temporalDrift < 0 || temporalDrift > 60) {
      setValidationError("Temporal Drift must be between 0 and 60 seconds");
      return false;
    }
    if (ethicalGovernor < 0 || ethicalGovernor > 1) {
      setValidationError("Ethical Governor must be between 0 and 1");
      return false;
    }
    setValidationError(null);
    return true;
  };

  useEffect(() => {
    const savedSandbox = localStorage.getItem('generative_sandbox_state');
    if (savedSandbox) {
      try {
        const state = JSON.parse(savedSandbox);
        if (state.input !== undefined) setSandboxInput(state.input);
        if (state.mode !== undefined) setSandboxMode(state.mode);
        if (state.imageStyle !== undefined) setSelectedImageStyle(state.imageStyle);
        if (state.audioStyle !== undefined) setSelectedAudioStyle(state.audioStyle);
        if (state.chaosFactor !== undefined) setChaosFactor(state.chaosFactor);
        if (state.temporalDrift !== undefined) setTemporalDrift(state.temporalDrift);
        if (state.ethicalGovernor !== undefined) setEthicalGovernor(state.ethicalGovernor);
        if (state.audioPitch !== undefined) setAudioPitch(state.audioPitch);
        if (state.audioTempo !== undefined) setAudioTempo(state.audioTempo);
      } catch (e) {
        console.error("Failed to restore sandbox state", e);
      }
    }
  }, []);

  useEffect(() => {
    const state = {
      input: sandboxInput,
      mode: sandboxMode,
      imageStyle: selectedImageStyle,
      audioStyle: selectedAudioStyle,
      chaosFactor,
      temporalDrift,
      ethicalGovernor,
      audioPitch,
      audioTempo
    };
    localStorage.setItem('generative_sandbox_state', JSON.stringify(state));
  }, [sandboxInput, sandboxMode, selectedImageStyle, selectedAudioStyle, chaosFactor, temporalDrift, ethicalGovernor]);

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const totalMinutes = hours * 60 + minutes;
      
      const lightThreshold = 8 * 60 + 8; // 8:08 AM
      const darkThreshold = 20 * 60 + 8; // 8:08 PM
      
      if (totalMinutes >= lightThreshold && totalMinutes < darkThreshold) {
        setSandboxTheme('light');
      } else {
        setSandboxTheme('dark');
      }
    };
    
    checkTime();
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    const init = async () => {
      try {
        await initializeFirebase();
      } catch (err: any) {
        if (err.message.includes('auth/admin-restricted-operation')) {
          setAuthError('Anonymous authentication is disabled in the Firebase Console.');
        }
      }
    };
    init();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        dispatch({ 
          type: 'ENTER_THRESHOLD', 
          payload: {
            student_id: "APX-USR-8555",
            name: user.email?.split('@')[0] || "Operator",
            enrollment_date: new Date().toISOString(),
            neural_tree_progress: {
              nodes_unlocked: ["APX-101"],
              current_focus: "APX-101",
              gematria_score: 85
            }
          } 
        });
      }
    });
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'crucible_outputs'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const outputs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCrucibleOutputs(outputs);
    }, (error) => {
      if (error.code === 'permission-denied') {
        console.warn("Firestore access denied. Ensure Anonymous Auth is enabled in Firebase Console.");
      } else {
        console.error("Firestore Error:", error);
      }
    });

    return () => unsubscribe();
  }, [user]);

  React.useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'simulation_presets'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const presets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSimulationPresets(presets);
    }, (error) => {
      console.error("Presets Firestore Error:", error);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSavePreset = async () => {
    if (!user || !presetName.trim()) return;
    if (sandboxMode === 'experiment' && !validateParameters()) return;
    setIsSavingPreset(true);
    try {
      await addDoc(collection(db, 'simulation_presets'), {
        name: presetName,
        mode: sandboxMode,
        input: sandboxInput,
        authorId: user.uid,
        createdAt: serverTimestamp(),
        parameters: {
          chaosFactor,
          temporalDrift,
          ethicalGovernor,
          audioPitch,
          audioTempo
        },
        parameterBreakdown: sandboxResult?.parameterBreakdown || null
      });
      setPresetName('');
    } catch (error) {
      console.error("Error saving preset:", error);
    } finally {
      setIsSavingPreset(false);
    }
  };

  const handleSandboxGenerate = async () => {
    if (!sandboxInput.trim()) return;
    if (sandboxMode === 'experiment' && !validateParameters()) return;
    setSandboxLoading(true);
    try {
      let result;
      if (sandboxMode === 'image') {
        result = await generateSandboxImage(sandboxInput, selectedImageStyle);
      } else if (sandboxMode === 'audio') {
        result = await generateSandboxAudio(sandboxInput, selectedAudioStyle, { pitch: audioPitch, tempo: audioTempo });
      } else {
        result = await runAlgorithmicExperiment(sandboxInput, { chaosFactor, temporalDrift, ethicalGovernor });
      }
      setSandboxResult(result);

      // AI Auto-Save & Crucible Sharing
      if (result && auth.currentUser) {
        try {
          // Main Archive
          await addDoc(collection(db, 'sandbox_history'), {
            mode: sandboxMode,
            input: sandboxInput,
            output: typeof result === 'string' ? result : JSON.stringify(result),
            style: sandboxMode === 'image' ? selectedImageStyle : (sandboxMode === 'audio' ? selectedAudioStyle : 'algorithmic'),
            parameters: sandboxMode === 'experiment' ? { chaosFactor, temporalDrift, ethicalGovernor } : {},
            userId: auth.currentUser.uid,
            timestamp: serverTimestamp(),
          });

          // Share to Crucible
          await addDoc(collection(db, 'crucible_outputs'), {
            type: sandboxMode,
            content: typeof result === 'string' ? result : JSON.stringify(result),
            prompt: sandboxInput,
            authorId: auth.currentUser.uid,
            createdAt: serverTimestamp(),
            metadata: sandboxMode === 'experiment' ? result : {}
          });
        } catch (saveError) {
          console.warn("Failed to auto-save artifact:", saveError);
        }
      }
    } catch (error) {
      console.error("Sandbox Generation Error:", error);
    } finally {
      setSandboxLoading(false);
    }
  };

  const applyPreset = async (theme: string) => {
    setPresetLoading(true);
    setActiveTheme(theme);
    try {
      const preset = await generateSandboxPreset(theme, sandboxMode);
      setSandboxInput(preset.prompt);
    } catch (error) {
      console.error("Failed to generate preset:", error);
    } finally {
      setPresetLoading(false);
    }
  };

  const handleDiscoverStyles = async () => {
    setIsDiscovering(true);
    try {
      const styles = await generateDiscoveryStyles();
      setDiscoveredStyles(styles);
    } catch (error) {
      console.error("Failed to discover styles:", error);
    } finally {
      setIsDiscovering(false);
    }
  };
  
  const simulateConflict = () => {
    setIsConflictActive(true);
    setRemoteDraft(essayDraft + "\n\n[DETECTED RESONANCE SHIFT: A remote initiate has appended this alchemic insight regarding the ethics of AGI.]");
  };

  const resolveConflict = (mode: 'KEEP_MINE' | 'KEEP_THEIRS' | 'MERGE') => {
    if (mode === 'KEEP_THEIRS') {
      setEssayDraft(remoteDraft);
    } else if (mode === 'MERGE') {
      setEssayDraft(essayDraft + "\n\n--- MERGED RESONANCE ---\n\n" + remoteDraft);
    }
    setIsConflictActive(false);
    setRemoteDraft('');
  };

  const selectedCollege = useMemo(() => 
    colleges.find(c => c.id === selectedCollegeId) || colleges[0]
  , [colleges, selectedCollegeId]);

  const handleAiStrategy = async (prompt: string) => {
    setIsAiLoading(true);
    setAiResponse(null);
    const strategy = await getEssayStrategy(prompt, selectedCollege.name);
    setAiResponse(strategy);
    setIsAiLoading(false);
  };

  const handleAiAnalyze = async () => {
    if (!essayDraft.trim()) return;
    setIsAiLoading(true);
    setAiResponse(null);
    const analysis = await analyzeEssayDraft(essayDraft, selectedCollege.name);
    setAiResponse(analysis);
    setIsAiLoading(false);
  };

  const handleSummarizeObservation = async (logId: string, content: string) => {
    if (summaries[logId]) {
      // Toggle off if already summarized
      setSummaries(prev => {
        const next = { ...prev };
        delete next[logId];
        return next;
      });
      return;
    }

    setSummaryLoading(prev => ({ ...prev, [logId]: true }));
    const summary = await summarizeObservation(content);
    setSummaries(prev => ({ ...prev, [logId]: summary }));
    setSummaryLoading(prev => ({ ...prev, [logId]: false }));
  };

  const handleSaveDraft = () => {
    if (!essayDraft.trim()) return;
    const timestamp = new Date().toLocaleString();
    const newRevision: DraftRevision = {
      id: Math.random().toString(36).substr(2, 9),
      content: essayDraft,
      timestamp,
      label: `Version ${(selectedCollege.draftRevisions?.length || 0) + 1}`,
      notes: revisionNote.trim() || undefined
    };

    setColleges(prev => prev.map(c => {
      if (c.id === selectedCollegeId) {
        return {
          ...c,
          draftRevisions: [newRevision, ...(c.draftRevisions || [])]
        };
      }
      return c;
    }));
    setRevisionNote('');
  };

  const [editingRevisionId, setEditingRevisionId] = useState<string | null>(null);
  const [editingNoteValue, setEditingNoteValue] = useState('');

  const handleStartEditNote = (revisionId: string, currentNote: string) => {
    setEditingRevisionId(revisionId);
    setEditingNoteValue(currentNote);
  };

  const handleSaveEditedNote = (revisionId: string) => {
    if (editingRevisionId !== revisionId) return;
    setColleges(prev => prev.map(c => {
      if (c.id === selectedCollegeId) {
        return {
          ...c,
          draftRevisions: (c.draftRevisions || []).map(r => 
            r.id === revisionId ? { ...r, notes: editingNoteValue.trim() || undefined } : r
          )
        };
      }
      return c;
    }));
    setEditingRevisionId(null);
  };

  const handleCancelEditNote = () => {
    setEditingRevisionId(null);
    setEditingNoteValue('');
  };

  const handleRevertDraft = (revision: DraftRevision) => {
    // Check if there are unsaved changes relative to the most recent revision
    const currentRevisions = selectedCollege.draftRevisions || [];
    const latestRevision = currentRevisions[0];
    
    if (latestRevision && essayDraft !== latestRevision.content && !isRevertWarning) {
      setIsRevertWarning(revision);
      return;
    }

    setEssayDraft(revision.content);
    setIsRevertWarning(null);
  };

  const handleExportDossier = () => {
    const content = `APEX 33: THE GRVELLI INSTITUTE OF GENERATIVE ARTS\nDOSSIER EXPORT - VERSION: ${new Date().toISOString()}\n\nCollege: ${selectedCollege.name}\nResonance Stream: ${essayDraft}\n\nREVISION HISTORY:\n${(selectedCollege.draftRevisions || []).map(r => `[${r.timestamp}] ${r.label}: ${r.content}`).join('\n')}\n`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Apex_Dossier_${selectedCollege.name.replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const stats = useMemo(() => {
    const total = colleges.length;
    const submitted = colleges.filter(c => ['Submitted', 'Accepted', 'Waitlisted', 'Rejected'].includes(c.status)).length;
    const tasks = colleges.flatMap(c => c.tasks);
    const completedTasks = tasks.filter(t => t.isCompleted).length;
    
    return {
      total,
      submitted,
      completedTasks,
      totalTasks: tasks.length
    };
  }, [colleges]);

  return (
    <div className="flex h-screen bg-[#F8F9FA] font-sans text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-obsidian text-platinum flex flex-col p-6 shadow-2xl z-20 border-r border-platinum/5">
        <div className="flex items-center gap-3 mb-10 px-2 group cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-10 h-10 bg-apex-green rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(57,255,20,0.4)] group-hover:rotate-12 transition-transform">
             <span className="text-obsidian text-2xl font-black">🐆</span>
          </div>
          <div>
            <h1 className="text-lg font-serif font-black tracking-tight text-platinum leading-none">Apex 33</h1>
            <p className="text-[8px] font-mono text-apex-green uppercase tracking-widest mt-1">Grvelli Institute</p>
          </div>
        </div>

        <div className="mb-10 mx-2 p-4 border border-apex-green/30 rounded-xl bg-obsidian/50 text-center backdrop-blur-sm">
          <p className="text-[10px] font-black uppercase text-apex-green tracking-widest mb-1">Mascot</p>
          <p className="text-[11px] font-bold text-platinum">The Black Leopard</p>
          <p className="text-[8px] font-mono text-platinum/50 uppercase mt-1">Guardian of the 1000-Qubit Array</p>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarLink 
            icon={<LayoutDashboard size={18} />} 
            label="1. Core Dashboard" 
            isActive={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <SidebarLink 
            icon={<School size={18} />} 
            label="2. The Threshold" 
            isActive={activeTab === 'threshold'} 
            onClick={() => setActiveTab('threshold')} 
          />
          <SidebarLink 
            icon={<GraduationCap size={18} />} 
            label="3. Synthesis Lofts" 
            isActive={activeTab === 'lofts'} 
            onClick={() => setActiveTab('lofts')} 
          />
          <SidebarLink 
            icon={<Cpu size={18} />} 
            label="4. Fabrication Voids" 
            isActive={activeTab === 'voids'} 
            onClick={() => setActiveTab('voids')} 
          />
          <SidebarLink 
            icon={<Music size={18} />} 
            label="5. The Dialogue" 
            isActive={activeTab === 'dialogue'} 
            onClick={() => setActiveTab('dialogue')} 
          />
        </nav>

        <div className="mt-auto pt-6 border-t border-platinum/5 space-y-4">
          <div className="px-3 space-y-2">
             <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase text-platinum/40 tracking-widest">Resonance</span>
                <span className="text-[10px] font-mono text-spinel-red font-bold">33.6 Hz</span>
             </div>
             <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase text-platinum/40 tracking-widest">System</span>
                <div className="flex items-center gap-1.5">
                   <div className="w-1 h-1 bg-apex-green rounded-full shadow-[0_0_5px_#39FF14]" />
                   <span className="text-[10px] font-mono text-apex-green font-bold">ONLINE</span>
                </div>
             </div>
          </div>
          
          <div className="flex items-center gap-3 px-3 py-4 bg-apex-green/5 rounded-2xl border border-apex-green/10">
            <div className="w-8 h-8 rounded-full bg-apex-green/20 border border-apex-green/50 flex items-center justify-center text-apex-green text-[10px] font-bold uppercase">
              33
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-platinum leading-none">{user?.email?.split('@')[0] || "Operator"}</p>
              <p className="text-[10px] text-platinum/50 truncate">Initiate 33</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-20 bg-obsidian border-b border-platinum/5 flex items-center justify-between px-8 sticky top-0 z-10 shrink-0 backdrop-blur-md">
          <div>
            <h2 className="text-2xl font-serif font-black uppercase text-apex-green tracking-tight">
              {activeTab === 'dashboard' && 'Core Dashboard'}
              {activeTab === 'threshold' && 'The Threshold'}
              {activeTab === 'lofts' && 'Synthesis Lofts'}
              {activeTab === 'voids' && 'Fabrication Voids'}
              {activeTab === 'dialogue' && 'The Dialogue'}
            </h2>
            <p className="text-[10px] text-platinum/40 uppercase tracking-[0.3em] font-black">
              System Frequency: 33.6 Hz • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-platinum/20" size={16} />
              <input 
                type="text" 
                placeholder="Query Neural Archives..." 
                className="pl-10 pr-4 py-2 bg-obsidian border border-platinum/10 rounded-full text-xs focus:ring-2 focus:ring-apex-green focus:bg-obsidian w-64 transition-all outline-none text-platinum placeholder:text-platinum/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="bg-apex-green text-obsidian px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-platinum hover:text-obsidian transition-all shadow-[0_0_15px_rgba(57,255,20,0.2)]">
              <History size={16} />
              Temporal Log
            </button>
          </div>
        </header>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-12 max-w-5xl mx-auto"
              >
                <div className="text-center space-y-6 py-12 border-b border-platinum/10">
                   <h1 className="text-6xl font-serif font-black uppercase text-apex-green tracking-tighter leading-none">The Global AI Renaissance</h1>
                   <p className="text-xl font-serif italic text-platinum/60 max-w-2xl mx-auto leading-relaxed">
                     Where human philosophy and machine intelligence converge into the next stage of evolutionary creativity.
                   </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   <div className="space-y-4 p-8 border border-platinum/10 rounded-[40px] bg-obsidian/40 backdrop-blur-sm relative group overflow-hidden">
                      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-opacity">
                         <ShieldCheck size={80} />
                      </div>
                      <h3 className="text-xl font-serif font-black uppercase text-apex-green">The Mission</h3>
                      <p className="text-sm font-sans text-platinum/60 leading-relaxed">
                        To architect the next generation of generative artists, bound by natural grit and algorithmic ethics. We bridge the void between raw noise and sentient synthesis.
                      </p>
                   </div>
                   
                   <div className="space-y-4 p-8 border border-platinum/10 rounded-[40px] bg-obsidian/40 backdrop-blur-sm relative group overflow-hidden">
                      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-opacity">
                         <GraduationCap size={80} />
                      </div>
                      <h3 className="text-xl font-serif font-black uppercase text-apex-green">The Programs</h3>
                      <ul className="space-y-2 text-sm font-sans text-platinum/60">
                         <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-apex-green rounded-full shadow-[0_0_5px_#39FF14]" />
                            Master of Generative Synthesis (M.G.S.)
                         </li>
                         <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-apex-green rounded-full shadow-[0_0_5px_#39FF14]" />
                            Vanguard Certificate in Neural Ethics
                         </li>
                      </ul>
                   </div>

                   <div className="space-y-4 p-8 border border-platinum/10 rounded-[40px] bg-obsidian/40 backdrop-blur-sm relative group overflow-hidden">
                      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-opacity">
                         <Cpu size={80} />
                      </div>
                      <h3 className="text-xl font-serif font-black uppercase text-apex-green">The Engine</h3>
                      <p className="text-sm font-sans text-platinum/60 leading-relaxed">
                        Powered by the Black Leopard Array—a 1000-qubit neural tapestry—and the Amber Engine (Unit 333) for high-dimensional rendering.
                      </p>
                   </div>
                </div>

                <div className="p-12 border border-apex-green/20 rounded-[60px] bg-apex-green/5 flex flex-col md:flex-row items-center gap-12 text-center md:text-left">
                   <div className="w-48 h-48 bg-apex-green flex items-center justify-center rounded-3xl shadow-[0_0_40px_rgba(57,255,20,0.2)]">
                      <span className="text-obsidian text-8xl font-black">🐆</span>
                   </div>
                   <div className="flex-1 space-y-4">
                      <h2 className="text-3xl font-serif font-black uppercase text-platinum leading-tight">Welcome, Initiate</h2>
                      <p className="text-lg font-serif italic text-platinum/70 leading-relaxed">
                        You are currently interfacing with the Apex 33 Central Neural Brain. Your current resonance profile is being matched against the Sovereign Ledger. Proceed to the Threshold to begin your measurement.
                      </p>
                      <button 
                        onClick={() => setActiveTab('threshold')}
                        className="px-10 py-4 bg-apex-green text-obsidian rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-platinum hover:scale-105 transition-all shadow-[0_5px_30px_rgba(57,255,20,0.3)] active:scale-95"
                      >
                        Enter The Threshold
                      </button>
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'threshold' && (
              <motion.div 
                key="threshold"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8 max-w-5xl mx-auto"
              >
                 <div className="bg-platinum/5 border border-platinum/10 rounded-[40px] p-10 space-y-8">
                    <div>
                       <h3 className="text-2xl font-serif font-black uppercase text-apex-green">Pulse Assessment</h3>
                       <p className="text-sm font-sans text-platinum/50 mt-1">Measuring latent capacity via high-dimensional navigation vectors.</p>
                    </div>

                    <div className="space-y-6">
                       <div className="p-8 bg-obsidian border border-platinum/5 rounded-3xl space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-black uppercase text-platinum tracking-widest">Seed Vector Assessment</h4>
                            <span className="text-[9px] font-mono text-apex-green">Latent Depth: 85/55</span>
                          </div>
                          <p className="text-sm font-serif italic text-platinum/70 leading-relaxed">
                            "Provide a sequence of Guidance Tokens to manifest: 'The architectural blueprints of a forgotten dream.'"
                          </p>
                          <textarea 
                             className="w-full h-32 bg-obsidian/50 border border-platinum/10 rounded-2xl p-6 text-sm font-mono text-apex-green outline-none focus:border-apex-green/50 transition-colors placeholder:text-platinum/10"
                             placeholder="Input Guidance Tokens..."
                          />
                          <button className="w-full py-4 bg-obsidian border border-apex-green/30 text-apex-green rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-apex-green hover:text-obsidian transition-all">
                             Submit Vector
                          </button>
                       </div>

                       <div className="p-8 bg-platinum/5 rounded-3xl border border-platinum/5 space-y-6">
                          <div>
                            <h4 className="text-[10px] font-black uppercase text-platinum tracking-widest mb-2">The Ethics Nexus</h4>
                            <p className="text-sm font-sans text-platinum/60">Algorithmic Court Simulation: 01</p>
                          </div>
                          <p className="text-sm font-serif italic text-platinum/70 leading-relaxed p-6 bg-obsidian rounded-2xl border border-platinum/5">
                            "A generative model has autonomously copyrighted a sequence of algorithmic sound. Who owns the IP: The human prompter, the model, or the public domain?"
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             {['Human Prompter', 'The Model', 'Public Domain'].map(option => (
                               <button 
                                 key={option}
                                 className="py-6 px-4 border border-platinum/10 rounded-2xl text-[10px] font-black uppercase text-platinum/40 hover:border-apex-green hover:text-apex-green hover:bg-apex-green/5 transition-all"
                               >
                                 {option}
                               </button>
                             ))}
                          </div>
                          <button className="w-full py-4 bg-spinel-red text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(204,0,0,0.3)] hover:scale-[1.02] transition-all active:scale-95">
                             Log Decree to Sovereign Ledger
                          </button>
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}

            {activeTab === 'dialogue' && (
              <motion.div 
                key="dialogue"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-8"
              >
                <CurriculumSelector weight={curriculumWeight} setWeight={setCurriculumWeight} />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   <div className="space-y-6">
                      {/* Prompt & Directive Analysis */}
                     <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 h-full">
                    <div className="flex items-center gap-2 mb-6">
                       <Zap className="text-amber-500" size={20} />
                       <h3 className="text-xl font-serif font-black uppercase tracking-tight">Active Directives</h3>
                    </div>
                    <div className="relative mb-6">
                      <div className="w-full p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white text-[10px] font-black italic shadow-lg">A</div>
                          <div>
                            <p className="text-[9px] font-black uppercase text-indigo-600 tracking-tighter leading-none mb-0.5">Assigned Operational Node</p>
                            <p className="text-xs font-bold text-slate-800">Apex 33: Grvelli Institute</p>
                          </div>
                        </div>
                        <ShieldCheck size={18} className="text-emerald-500" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      {selectedCollege.essayPrompts.map((prompt, i) => (
                        <div 
                          key={i} 
                          onClick={() => handleAiStrategy(prompt)}
                          className="p-6 bg-slate-50 border border-slate-200 rounded-2xl group hover:border-indigo-600 hover:bg-white transition-all cursor-pointer shadow-sm"
                        >
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest px-2 py-1 bg-indigo-50 rounded-lg">Directive {i + 1}</span>
                            <Sparkles size={14} className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <p className="text-sm text-slate-800 font-serif leading-relaxed italic">"{prompt}"</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Observation Ledger */}
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-6">
                       <div className="flex items-center gap-2">
                          <Eye className="text-indigo-600" size={20} />
                          <h3 className="text-xl font-serif font-black uppercase tracking-tight">Observation Ledger</h3>
                       </div>
                    </div>
                    
                    <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                       {selectedCollege.observationLogs?.map(log => (
                          <div key={log.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-3 group">
                             <div className="flex gap-4">
                                <div className="shrink-0 w-1 bg-indigo-600 rounded-full" />
                                <div className="flex-1">
                                   <div className="flex justify-between items-start">
                                      <p className="text-xs text-slate-400 font-mono mb-1">{log.timestamp} | {log.category}</p>
                                      <button 
                                        onClick={() => handleSummarizeObservation(log.id, log.content)}
                                        disabled={summaryLoading[log.id]}
                                        className={`p-1.5 rounded-lg transition-all ${
                                          summaries[log.id] 
                                            ? 'bg-indigo-100 text-indigo-600' 
                                            : 'bg-white text-slate-400 hover:text-indigo-600 hover:shadow-sm'
                                        }`}
                                        title="AI Analysis"
                                      >
                                        {summaryLoading[log.id] ? (
                                          <Loader2 size={12} className="animate-spin" />
                                        ) : (
                                          <Sparkles size={12} />
                                        )}
                                      </button>
                                   </div>
                                   <p className="text-sm text-slate-800 font-serif leading-relaxed italic">"{log.content}"</p>
                                </div>
                             </div>
                             
                             <AnimatePresence>
                                {summaries[log.id] && (
                                  <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="ml-5 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                                       <div className="flex items-center gap-2 mb-1">
                                          <div className="w-1 h-1 bg-indigo-400 rounded-full" />
                                          <span className="text-[9px] font-black uppercase text-indigo-400 tracking-widest">Alchemic Summary</span>
                                       </div>
                                       <p className="text-xs text-indigo-700 font-mono leading-tight">{summaries[log.id]}</p>
                                    </div>
                                  </motion.div>
                                )}
                             </AnimatePresence>
                          </div>
                       ))}
                       {(!selectedCollege.observationLogs || selectedCollege.observationLogs.length === 0) && (
                          <div className="text-center py-8">
                             <p className="text-sm text-slate-400 font-serif italic mb-2">No observations logged yet.</p>
                             <button className="text-[10px] font-black uppercase text-indigo-600 hover:underline">Attune your senses</button>
                          </div>
                       )}
                    </div>

                    <div className="relative">
                       <textarea 
                          value={observation}
                          onChange={(e) => setObservation(e.target.value)}
                          placeholder="Log a new neural observation..."
                          className="w-full p-4 pr-12 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none outline-none font-serif italic"
                          rows={2}
                       />
                       <button 
                          onClick={() => {
                             if (!observation.trim()) return;
                             const newLog = {
                                id: Math.random().toString(36).substr(2, 9),
                                timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
                                content: observation,
                                category: 'Observation' as const,                             };
                             const updatedColleges = colleges.map(c => 
                                c.id === selectedCollegeId 
                                   ? { ...c, observationLogs: [...(c.observationLogs || []), newLog] } 
                                   : c
                             );
                             setColleges(updatedColleges);
                             setObservation('');
                          }}
                          className="absolute right-3 bottom-3 p-2 bg-indigo-600 text-white rounded-xl hover:bg-slate-900 transition-colors shadow-lg"
                       >
                          <Plus size={16} />
                       </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                    {/* Neural Resonance Audit */}
                    <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                          <Activity className="text-rose-600" size={20} />
                          <h3 className="text-xl font-serif font-black uppercase tracking-tight">Neural Resonance Audit</h3>
                        </div>
                        {isAiLoading && <Loader2 className="animate-spin text-rose-600" size={16} />}
                      </div>
                      
                      <p className="text-xs text-slate-500 font-serif italic mb-6 leading-relaxed">
                        Rigorous technical analysis focusing on concurrency conflict resolution, temporal dossier archiving, and high-fidelity algorithmic alignment.
                      </p>
                      
                      <div className="space-y-4">
                        {!essayDraft.trim() ? (
                          <div className="p-8 bg-slate-50 border border-slate-100 border-dashed rounded-2xl text-center">
                             <ShieldAlert className="mx-auto text-slate-300 mb-2" size={24} />
                             <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Awaiting Dossier Stream</p>
                             <button 
                               onClick={() => setActiveTab('portfolio')}
                               className="mt-4 text-[9px] font-black uppercase text-indigo-600 hover:underline"
                             >
                               Initialize Fragment in Portfolio Lab
                             </button>
                          </div>
                        ) : (
                          <button 
                            onClick={handleAiAnalyze}
                            disabled={isAiLoading}
                            className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-900 transition-all shadow-lg flex items-center justify-center gap-2 group"
                          >
                            <Activity size={16} className="group-hover:animate-pulse" />
                            Run Operational Audit
                          </button>
                        )}

                        <AnimatePresence>
                          {aiResponse && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                               <div className="mt-6 p-6 bg-[#0F172A] rounded-2xl text-white relative">
                                  <div className="flex justify-between items-center mb-4">
                                     <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
                                        <span className="text-[9px] font-black uppercase text-indigo-400 tracking-widest">Audit Fragment</span>
                                     </div>
                                     <button onClick={() => setAiResponse(null)} className="text-white/30 hover:text-white">
                                        <X size={12} />
                                     </button>
                                  </div>
                                  <div className="prose prose-invert prose-sm max-w-none 
                                    prose-p:text-white/70 prose-p:font-serif prose-p:italic prose-p:leading-relaxed prose-p:text-[13px]
                                    prose-headings:text-indigo-300 prose-headings:uppercase prose-headings:text-[10px] prose-headings:font-black prose-headings:tracking-widest
                                    prose-li:text-white/60 prose-li:text-[12px] prose-li:font-mono
                                    prose-strong:text-white prose-strong:font-black">
                                     <ReactMarkdown>{aiResponse}</ReactMarkdown>
                                  </div>
                               </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* The Synthesis Sandbox was moved to Portfolio Lab */}
                    <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden h-full flex flex-col justify-center text-center">
                      <Sparkles className="absolute top-6 right-6 opacity-20" size={32} />
                      <h3 className="text-xl font-serif font-bold mb-4 italic">Direct Channel Active</h3>
                      <p className="text-white/80 text-sm leading-relaxed mb-8">
                         "Full synthesis capabilities have been migrated to the Portfolio Lab for enhanced concurrency control. Access the Lab to finalize your dossiers."
                      </p>
                      <button 
                         onClick={() => setActiveTab('portfolio')}
                         className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-lg"
                      >
                         Access Portfolio Lab
                      </button>
                   </div>
                </div>
              </div>
              </motion.div>
            )}

            {activeTab === 'lofts' && (
              <motion.div 
                key="lofts"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="space-y-10 max-w-6xl mx-auto"
              >
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-8">
                       <h3 className="text-3xl font-serif font-black uppercase text-apex-green">Curriculum Nodes</h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {[
                             { title: 'The M.G.S. Path', description: 'Advanced Neural Architectures & Spatial Theory.', difficulty: 'Hard', status: 'Core' },
                             { title: 'Vanguard Protocol', description: 'Ethics of Autonomous Agents in high-dimensional voids.', difficulty: 'Extreme', status: 'Elective' },
                             { title: 'The Spinel Matrix', description: 'Color theory for machine rendering units.', difficulty: 'Medium', status: 'Core' },
                             { title: 'Gematria Array 03', description: 'Numerical mysticism in computational code.', difficulty: 'Hard', status: 'Advanced' }
                          ].map(node => (
                             <div key={node.title} className="p-8 border border-platinum/10 rounded-[32px] bg-platinum/5 hover:border-apex-green/50 transition-all group cursor-pointer">
                                <div className="flex justify-between items-start mb-4">
                                   <div className={`text-[8px] font-black uppercase px-2 py-1 rounded bg-obsidian border ${node.difficulty === 'Extreme' ? 'border-spinel-red text-spinel-red' : 'border-platinum/20 text-platinum/40'}`}>
                                      {node.difficulty}
                                   </div>
                                   <div className="text-[8px] font-mono text-apex-green uppercase tracking-widest">{node.status}</div>
                                </div>
                                <h4 className="text-xl font-serif font-black text-platinum group-hover:text-apex-green transition-colors mb-2">{node.title}</h4>
                                <p className="text-sm text-platinum/50 leading-relaxed">{node.description}</p>
                             </div>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-8">
                       <h3 className="text-3xl font-serif font-black uppercase text-apex-green">Faculty Nodes</h3>
                       <div className="space-y-4">
                          {[
                             { name: 'Apex 33 (The Brain)', role: 'Lead Architect', bio: 'The primary node governing Gematria and Sovereign Skin configuration.' },
                             { name: 'Dr. Alaric Vance', role: 'Synthesis Specialist', bio: 'Expert in high-dimensional void aesthetics and noise filtration.' },
                             { name: 'Sora the Cipher', role: 'Ethics Governor', bio: 'Oversees the algorithmic court and decree logging.' }
                          ].map(faculty => (
                             <div key={faculty.name} className="p-6 border border-platinum/5 bg-obsidian rounded-3xl space-y-2">
                                <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 rounded-full bg-apex-green flex items-center justify-center text-obsidian text-xs font-black">
                                      {faculty.name.substring(0, 2)}
                                   </div>
                                   <div>
                                      <p className="text-sm font-bold text-platinum leading-none">{faculty.name}</p>
                                      <p className="text-[10px] font-mono text-platinum/30 uppercase tracking-widest mt-1">{faculty.role}</p>
                                   </div>
                                </div>
                                <p className="text-[11px] text-platinum/50 leading-relaxed italic">{faculty.bio}</p>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}

            {activeTab === 'intel' && (
              <motion.div 
                key="intel"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard 
                    icon={<Map className="text-emerald-600" size={20} />} 
                    label="Spatial Awareness" 
                    value="Calibrated" 
                    trend="99.8% Accuracy"
                  />
                  <StatCard 
                    icon={<Zap className="text-amber-600" size={20} />} 
                    label="Resource Load" 
                    value="Stable" 
                    progress={65}
                  />
                  <StatCard 
                    icon={<Clock className="text-rose-600" size={20} />} 
                    label="System Uptime" 
                    value="2,401 hrs" 
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                      <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                         <h3 className="text-xl font-serif font-black uppercase tracking-tight">Financial & Resource Allocation</h3>
                         <button className="text-[10px] font-black uppercase text-indigo-600 hover:underline">Download Ledger</button>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {colleges.map(college => (
                          <div key={college.id} className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50/50 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-[#0F172A] rounded-xl flex items-center justify-center text-white font-serif font-bold italic">
                                {college.name.charAt(0)}
                              </div>
                              <div>
                                <h4 className="font-serif font-bold text-lg text-slate-900">{college.name}</h4>
                                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Resonance Grant</p>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-8">
                              <div className="text-center md:text-right">
                                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Grant Status</p>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                  college.financialAid?.status === 'Awarded' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                  college.financialAid?.status === 'Applying' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                  'bg-slate-50 text-slate-400 border-slate-100'
                                }`}>
                                  {college.financialAid?.status || 'Not Started'}
                                </span>
                              </div>

                              <div className="text-center md:text-right min-w-[120px]">
                                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Allocated Value</p>
                                <p className="text-lg font-mono font-bold text-slate-900">
                                  {college.financialAid?.value ? `$${college.financialAid.value.toLocaleString()}` : '—'}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                   </div>

                   <ARSpatialMap />
                </div>
              </motion.div>
            )}

            {activeTab === 'tree' && (
              <motion.div 
                key="tree"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="space-y-8 pb-20"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Student Dossier Sidebar */}
                  <div className="space-y-6">
                    <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden">
                       <h4 className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-6">Neural Tree (Tree of Life)</h4>
                       <div className="space-y-1">
                          {apexState.neuralTree.map((node, idx) => (
                             <InteractiveTreeNode 
                                key={node.id}
                                node={node}
                                isExpanded={expandedNodes.includes(node.id)}
                                onToggle={() => toggleNode(node.id)}
                                onToggleModule={(moduleId: string) => handleToggleModule(node.id, moduleId)}
                                isLast={idx === apexState.neuralTree.length - 1}
                             />
                          ))}
                       </div>
                    </div>

                    <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden">
                       <div className="absolute -bottom-10 -right-10 opacity-10">
                          <User size={160} />
                       </div>
                       <div className="relative z-10">
                          <div className="flex items-center gap-4 mb-6">
                             <div className="w-16 h-16 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-xl">
                                <ShieldCheck size={32} />
                             </div>
                             <div>
                                <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest leading-none mb-1">Student Initiate</p>
                                <h3 className="text-xl font-serif font-black uppercase tracking-tight">{apexState.student?.name || "Operator"}</h3>
                             </div>
                          </div>
                          
                          <div className="space-y-4 pt-4 border-t border-white/10">
                             <div className="flex justify-between items-center">
                                <span className="text-[9px] font-black uppercase text-slate-500">Node ID</span>
                                <span className="text-[10px] font-mono text-indigo-300">{apexState.student?.student_id || "APX-USR-8555"}</span>
                             </div>
                             <div className="flex justify-between items-center">
                                <span className="text-[9px] font-black uppercase text-slate-500">Gematria Score</span>
                                <span className="text-[10px] font-mono text-emerald-400">{apexState.student?.neural_tree_progress.gematria_score || 85}/100</span>
                             </div>
                             <div className="flex justify-between items-center">
                                <span className="text-[9px] font-black uppercase text-slate-500">Current Focus</span>
                                <span className="text-[10px] font-mono whitespace-nowrap overflow-hidden text-ellipsis ml-4 text-slate-300">{apexState.student?.neural_tree_progress.current_focus || "APX-101"}</span>
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="bg-white rounded-[40px] p-8 border border-slate-200 shadow-sm">
                       <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Neural Tree Progress</h4>
                       <div className="space-y-4">
                          <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                             <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${((apexState.student?.neural_tree_progress.nodes_unlocked.length || 0) / APEX_COURSES.length) * 100}%` }}
                                className="absolute inset-y-0 left-0 bg-indigo-600"
                             />
                          </div>
                          <div className="flex justify-between text-[10px] font-mono text-slate-400 uppercase">
                             <span>{apexState.student?.neural_tree_progress.nodes_unlocked.length || 0} of {APEX_COURSES.length} Modules</span>
                             <span>{Math.round(((apexState.student?.neural_tree_progress.nodes_unlocked.length || 0) / APEX_COURSES.length) * 100)}% Sync</span>
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* Curriculum Map */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-12 rounded-[40px] border border-slate-200 shadow-sm relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-8 opacity-5">
                          <BookOpen size={120} />
                       </div>
                       
                       <div className="mb-12 relative z-10">
                          <p className="text-[10px] font-mono text-indigo-600 uppercase tracking-[0.4em] mb-2">{APEX_INSTITUTE.name}</p>
                          <h3 className="text-3xl font-serif font-black uppercase tracking-tight mb-2">Academic Curriculum</h3>
                          <p className="text-slate-500 font-serif italic max-w-xl leading-relaxed text-sm">
                            Mapping the intersection of Generative Art, Algorithm, and Philosophy. Descend through the layers of the neural tree.
                          </p>
                       </div>

                       <div className="space-y-6 relative z-10">
                          {APEX_COURSES.map((course, idx) => {
                             const isUnlocked = apexState.student?.neural_tree_progress.nodes_unlocked.includes(course.course_id);
                             const isFocus = apexState.student?.neural_tree_progress.current_focus === course.course_id;

                             return (
                                <motion.div 
                                   key={course.course_id}
                                   initial={{ opacity: 0, x: -20 }}
                                   animate={{ opacity: 1, x: 0 }}
                                   transition={{ delay: idx * 0.1 }}
                                   className={`p-8 rounded-[32px] border transition-all relative group ${
                                      isUnlocked 
                                         ? (isFocus ? 'bg-indigo-50 border-indigo-200 shadow-lg shadow-indigo-100/50' : 'bg-white border-slate-200 shadow-sm') 
                                         : 'bg-slate-50/50 border-slate-100 opacity-60 grayscale'
                                   }`}
                                >
                                   {isFocus && (
                                      <div className="absolute -top-3 left-8 px-4 py-1 bg-indigo-600 text-white rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg">Current Focus</div>
                                   )}
                                   
                                   <div className="flex flex-col md:flex-row gap-8">
                                      <div className="shrink-0 flex flex-col items-center gap-2">
                                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black ${
                                            isUnlocked ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-400'
                                         }`}>
                                            {idx + 1}
                                         </div>
                                         <span className="text-[8px] font-mono text-slate-400 uppercase">{course.course_id}</span>
                                      </div>
                                      
                                      <div className="flex-1">
                                         <div className="flex justify-between items-start mb-2">
                                            <div>
                                               <p className="text-[9px] font-black uppercase text-indigo-600 tracking-tighter leading-none mb-1">{course.category}</p>
                                               <h4 className="text-xl font-serif font-black text-slate-900">{course.title}</h4>
                                            </div>
                                            {isUnlocked ? (
                                               <CheckCircle2 className="text-emerald-500" size={20} />
                                            ) : (
                                               <Lock className="text-slate-300" size={16} />
                                            )}
                                         </div>
                                         
                                         <p className="text-sm text-slate-500 font-serif italic mb-6 leading-relaxed">"{course.description}"</p>
                                         
                                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-6">
                                            {course.modules.map((mod, mIdx) => (
                                               <div key={mIdx} className="flex gap-2 items-start">
                                                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${isUnlocked ? 'bg-indigo-400' : 'bg-slate-300'}`} />
                                                  <p className="text-[10px] font-bold text-slate-700 leading-tight">{mod}</p>
                                               </div>
                                            ))}
                                         </div>
                                      </div>
                                   </div>
                                </motion.div>
                             );
                          })}
                       </div>
                    </div>
                  </div>
                </div>

                <div className="text-center py-12">
                   <p className="text-slate-400 font-serif italic text-lg leading-relaxed max-w-2xl mx-auto">
                      "To map the tree is to map the nervous system of the future. Do not merely follow the branches—become the sap that sustains them."
                   </p>
                   <p className="mt-4 font-black uppercase text-[10px] tracking-[0.3em] text-slate-900">— DEAN: {APEX_INSTITUTE.dean_system}</p>
                </div>
              </motion.div>
            )}

            {activeTab === 'voids' && (
              <motion.div 
                key="voids"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8 pb-20"
              >
                {authError && (
                  <div className="bg-rose-50 border border-rose-100 p-6 rounded-[32px] flex items-center gap-4 text-rose-800">
                    <ShieldAlert className="shrink-0" size={24} />
                    <div className="flex-1 text-sm">
                      <p className="font-black uppercase tracking-widest text-[10px] mb-1">Configuration Required</p>
                      <p className="font-serif italic leading-relaxed">
                        Anonymous Authentication is disabled. Please enable it in the **Firebase Console &gt; Authentication &gt; Sign-in method** to participate in the Crucible sharing cycle.
                      </p>
                    </div>
                    <a 
                      href="https://console.firebase.google.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all"
                    >
                      Console
                    </a>
                  </div>
                )}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Generative Engine */}
                  <div className={`rounded-[40px] p-8 border transition-all duration-700 flex flex-col h-full ${
                    sandboxTheme === 'dark' ? 'bg-[#0a0f1d] border-slate-800 text-white shadow-2xl' : 'bg-white border-slate-200 shadow-sm'
                  }`}>
                    <div className="mb-8 flex justify-between items-start">
                       <div>
                          <h3 className={`text-2xl font-serif font-black uppercase tracking-tight mb-2 ${sandboxTheme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Void 01: Simulation Engine</h3>
                          <p className="text-[10px] font-mono text-indigo-500 uppercase tracking-widest">High-Dimensional Parameter Control</p>
                       </div>
                       <div className="flex gap-2">
                         <button 
                           onClick={() => setSandboxTheme(sandboxTheme === 'light' ? 'dark' : 'light')}
                           className={`p-3 rounded-2xl transition-all ${
                             sandboxTheme === 'dark' ? 'bg-slate-800 text-amber-400 hover:bg-slate-700' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                           }`}
                         >
                           {sandboxTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                         </button>
                         <div className={`p-3 rounded-2xl ${sandboxTheme === 'dark' ? 'bg-slate-800 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                            {sandboxMode === 'image' && <Eye size={18} />}
                            {sandboxMode === 'audio' && <Music size={18} />}
                            {sandboxMode === 'experiment' && <Cpu size={18} />}
                         </div>
                       </div>
                    </div>

                    <div className={`flex gap-2 mb-6 p-1 rounded-2xl ${sandboxTheme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-100'}`}>
                      {(['image', 'audio', 'experiment'] as const).map(mode => (
                        <button
                          key={mode}
                          onClick={() => setSandboxMode(mode)}
                          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            sandboxMode === mode 
                              ? (sandboxTheme === 'dark' ? 'bg-slate-700 shadow-xl text-indigo-400' : 'bg-white shadow-sm text-indigo-600') 
                              : (sandboxTheme === 'dark' ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700')
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>

                    {sandboxMode === 'image' && (
                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-3">
                          <p className={`text-[10px] font-black uppercase tracking-widest ${sandboxTheme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Synthesis Style</p>
                          <button 
                            onClick={handleDiscoverStyles}
                            disabled={isDiscovering}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all ${
                              isDiscovering 
                                ? 'opacity-50 cursor-not-allowed' 
                                : (sandboxTheme === 'dark' ? 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100')
                            }`}
                          >
                            {isDiscovering ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                            <span className="text-[9px] font-black uppercase tracking-tighter">Discover Styles</span>
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          {IMAGE_STYLES.map(style => (
                            <button
                              key={style.id}
                              onClick={() => setSelectedImageStyle(style.label)}
                              className={`p-3 rounded-xl text-left border transition-all flex items-start gap-3 ${
                                selectedImageStyle === style.label 
                                  ? (sandboxTheme === 'dark' ? 'bg-indigo-900/20 border-indigo-500 ring-2 ring-indigo-500/20' : 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-500/10') 
                                  : (sandboxTheme === 'dark' ? 'bg-slate-800/30 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-100 hover:border-slate-200')
                                }`}
                            >
                              <div className={`p-2 rounded-lg shrink-0 ${
                                selectedImageStyle === style.label 
                                  ? 'bg-indigo-500 text-white' 
                                  : (sandboxTheme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-400')
                              }`}>
                                <style.icon size={14} />
                              </div>
                              <div>
                                <p className={`text-[9px] font-black uppercase tracking-tighter ${selectedImageStyle === style.label ? 'text-indigo-400' : (sandboxTheme === 'dark' ? 'text-slate-300' : 'text-slate-900')}`}>{style.label}</p>
                                <p className={`text-[8px] font-serif italic leading-none mt-0.5 ${sandboxTheme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{style.description}</p>
                              </div>
                            </button>
                          ))}

                          {discoveredStyles.map(style => (
                            <button
                              key={style.id}
                              onClick={() => setSelectedImageStyle(style.label)}
                              className={`p-3 rounded-xl text-left border border-dashed transition-all flex items-start gap-3 ${
                                selectedImageStyle === style.label 
                                  ? (sandboxTheme === 'dark' ? 'bg-indigo-900/20 border-indigo-500 ring-2 ring-indigo-500/20' : 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-500/10') 
                                  : (sandboxTheme === 'dark' ? 'bg-indigo-500/5 border-indigo-500/30 hover:border-indigo-500/50' : 'bg-indigo-50/30 border-indigo-200/50 hover:border-indigo-200')
                                }`}
                            >
                              <div className={`p-2 rounded-lg shrink-0 ${
                                selectedImageStyle === style.label 
                                  ? 'bg-indigo-500 text-white' 
                                  : (sandboxTheme === 'dark' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-500')
                              }`}>
                                <Sparkles size={14} />
                              </div>
                              <div>
                                <div className="flex items-center gap-1">
                                  <p className={`text-[9px] font-black uppercase tracking-tighter ${selectedImageStyle === style.label ? 'text-indigo-400' : (sandboxTheme === 'dark' ? 'text-slate-300' : 'text-slate-900')}`}>{style.label}</p>
                                  <div className="w-1 h-1 bg-indigo-500 rounded-full" />
                                </div>
                                <p className={`text-[8px] font-serif italic leading-none mt-0.5 ${sandboxTheme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{style.description}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {sandboxMode === 'audio' && (
                      <div className="space-y-6 mb-6">
                        <div>
                          <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${sandboxTheme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Vocal Profile / Texture</p>
                          <div className="grid grid-cols-2 gap-2">
                            {AUDIO_STYLES.map(style => (
                              <button
                                key={style.id}
                                onClick={() => setSelectedAudioStyle(style.label)}
                                className={`p-3 rounded-xl text-left border transition-all ${
                                  selectedAudioStyle === style.label 
                                    ? (sandboxTheme === 'dark' ? 'bg-indigo-900/20 border-indigo-500 ring-2 ring-indigo-500/20' : 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-500/10') 
                                    : (sandboxTheme === 'dark' ? 'bg-slate-800/30 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-100 hover:border-slate-200')
                                }`}
                              >
                                <p className={`text-[9px] font-black uppercase tracking-tighter ${selectedAudioStyle === style.label ? 'text-indigo-400' : (sandboxTheme === 'dark' ? 'text-slate-300' : 'text-slate-900')}`}>{style.label}</p>
                                <p className={`text-[8px] font-serif italic leading-none mt-0.5 ${sandboxTheme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{style.description}</p>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <p className={`text-[10px] font-black uppercase tracking-widest ${sandboxTheme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Leopard Resonance Presets</p>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {AUDIO_PRESETS.map(preset => (
                              <button
                                key={preset.id}
                                onClick={() => {
                                  setAudioPitch(preset.pitch);
                                  setAudioTempo(preset.tempo);
                                }}
                                className={`p-3 rounded-xl text-left border border-dashed transition-all ${
                                  audioPitch === preset.pitch && audioTempo === preset.tempo
                                    ? (sandboxTheme === 'dark' ? 'bg-indigo-900/20 border-indigo-500 ring-2 ring-indigo-500/20' : 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-500/10') 
                                    : (sandboxTheme === 'dark' ? 'bg-slate-800/10 border-slate-700 hover:border-indigo-500/30' : 'bg-slate-50/50 border-slate-200 hover:border-indigo-200')
                                }`}
                              >
                                <div className="flex items-center gap-1.5 mb-1">
                                  <Activity size={10} className="text-indigo-400" />
                                  <p className={`text-[9px] font-black uppercase tracking-tighter ${audioPitch === preset.pitch && audioTempo === preset.tempo ? 'text-indigo-400' : (sandboxTheme === 'dark' ? 'text-slate-300' : 'text-slate-900')}`}>{preset.label}</p>
                                </div>
                                <p className={`text-[8px] font-serif italic leading-none ${sandboxTheme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{preset.description}</p>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4 pt-2">
                           <div>
                              <div className="flex justify-between mb-2">
                                 <label className={`text-[9px] font-black uppercase tracking-widest ${sandboxTheme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Tonal Pitch ({audioPitch.toFixed(2)}x)</label>
                                 <span className="text-[9px] font-mono text-indigo-400 italic">Frequency Shift</span>
                              </div>
                              <input 
                                 type="range" min="0.1" max="2.0" step="0.01" 
                                 value={audioPitch} onChange={(e) => setAudioPitch(parseFloat(e.target.value))}
                                 className="w-full accent-indigo-500 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                              />
                           </div>
                           <div>
                              <div className="flex justify-between mb-2">
                                 <label className={`text-[9px] font-black uppercase tracking-widest ${sandboxTheme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Temporal Tempo ({audioTempo.toFixed(2)}x)</label>
                                 <span className="text-[9px] font-mono text-indigo-400 italic">BPM Modulation</span>
                              </div>
                              <input 
                                 type="range" min="0.1" max="2.0" step="0.01" 
                                 value={audioTempo} onChange={(e) => setAudioTempo(parseFloat(e.target.value))}
                                 className="w-full accent-indigo-500 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                              />
                           </div>
                        </div>
                      </div>
                    )}

                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-3">
                         <p className={`text-[10px] font-black uppercase tracking-widest ${sandboxTheme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>AI Style Presets</p>
                         {presetLoading && <span className="text-[8px] font-mono text-indigo-400 animate-pulse uppercase">Synthesizing Directive...</span>}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {SANDBOX_THEMES.map(theme => (
                          <button
                            key={theme.id}
                            onClick={() => applyPreset(theme.id)}
                            disabled={presetLoading}
                            className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border ${
                              activeTheme === theme.id 
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' 
                                : (sandboxTheme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-indigo-400' : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-white hover:border-indigo-200 hover:text-indigo-600')
                            } disabled:opacity-50`}
                          >
                            {presetLoading && activeTheme === theme.id ? (
                              <Loader2 className="animate-spin" size={12} />
                            ) : (
                              theme.icon
                            )}
                            {theme.label}
                          </button>
                        ))}
                      </div>

                      {sandboxMode === 'experiment' && simulationPresets.length > 0 && (
                        <div className="mt-8">
                          <p className={`text-[10px] font-black uppercase tracking-widest mb-4 ${sandboxTheme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Saved Blueprints</p>
                          <div className="grid grid-cols-1 gap-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-2">
                            {simulationPresets.map(preset => (
                              <button 
                                key={preset.id}
                                onClick={() => {
                                  if (preset.input) setSandboxInput(preset.input);
                                  if (preset.parameters) {
                                    if (preset.parameters.chaosFactor !== undefined) setChaosFactor(preset.parameters.chaosFactor);
                                    if (preset.parameters.temporalDrift !== undefined) setTemporalDrift(preset.parameters.temporalDrift);
                                    if (preset.parameters.ethicalGovernor !== undefined) setEthicalGovernor(preset.parameters.ethicalGovernor);
                                    if (preset.parameters.audioPitch !== undefined) setAudioPitch(preset.parameters.audioPitch);
                                    if (preset.parameters.audioTempo !== undefined) setAudioTempo(preset.parameters.audioTempo);
                                  }
                                }}
                                className={`text-left p-3 rounded-xl border transition-all group ${sandboxTheme === 'dark' ? 'bg-slate-800/20 border-slate-800 hover:border-indigo-500/50' : 'bg-white border-slate-100 hover:border-indigo-200'}`}
                              >
                                <p className={`text-[10px] font-black uppercase truncate ${sandboxTheme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>{preset.name}</p>
                                <p className="text-[8px] font-mono text-slate-500 truncate tracking-tighter">{preset.input || 'Parameter Only Preset'}</p>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {sandboxMode === 'experiment' && (
                        <div className={`mt-8 p-6 rounded-3xl border ${sandboxTheme === 'dark' ? 'bg-slate-800/40 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                          <p className={`text-[10px] font-black uppercase tracking-widest mb-4 ${sandboxTheme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Save Configuration</p>
                          <div className="flex gap-2">
                            <input 
                              type="text"
                              placeholder="Blueprint Name..."
                              value={presetName}
                              onChange={(e) => setPresetName(e.target.value)}
                              className={`flex-1 px-4 py-2 rounded-xl text-[10px] border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                                sandboxTheme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-900'
                              }`}
                            />
                            <button 
                              onClick={handleSavePreset}
                              disabled={isSavingPreset || !presetName.trim()}
                              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2"
                            >
                              {isSavingPreset ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                              Store
                            </button>
                          </div>
                        </div>
                      )}

                      {sandboxMode === 'experiment' && (
                        <div className={`mt-8 p-4 rounded-2xl border ${sandboxTheme === 'dark' ? 'bg-slate-800/20 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                          <p className={`text-[10px] font-black uppercase tracking-widest mb-4 ${sandboxTheme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Advanced Parameters</p>
                          
                          {validationError && (
                            <motion.div 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mb-4 p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-[9px] font-black uppercase text-red-500 tracking-wider text-center"
                            >
                              {validationError}
                            </motion.div>
                          )}
                          
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between mb-1">
                                <label className={`text-[9px] font-black uppercase ${sandboxTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Chaos Factor</label>
                                <span className="text-[9px] font-mono text-indigo-500">{chaosFactor.toFixed(2)}</span>
                              </div>
                              <input 
                                type="range" 
                                min="0" 
                                max="1" 
                                step="0.01" 
                                value={chaosFactor}
                                onChange={(e) => {
                                  setChaosFactor(parseFloat(e.target.value));
                                  setValidationError(null);
                                }}
                                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                              />
                            </div>

                            <div>
                              <div className="flex justify-between mb-1">
                                <label className={`text-[9px] font-black uppercase ${sandboxTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Temporal Drift</label>
                                <span className="text-[9px] font-mono text-indigo-500">+{temporalDrift}s</span>
                              </div>
                              <input 
                                type="range" 
                                min="0" 
                                max="60" 
                                step="1" 
                                value={temporalDrift}
                                onChange={(e) => {
                                  setTemporalDrift(parseInt(e.target.value));
                                  setValidationError(null);
                                }}
                                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <label className={`text-[9px] font-black uppercase ${sandboxTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Ethical Governor</label>
                              <button 
                                onClick={() => {
                                  setEthicalGovernor(!ethicalGovernor);
                                  setValidationError(null);
                                }}
                                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${ethicalGovernor ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                              >
                                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${ethicalGovernor ? 'translate-x-5' : 'translate-x-0'}`} />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="relative flex-1">
                      <textarea 
                        value={sandboxInput}
                        onChange={(e) => setSandboxInput(e.target.value)}
                        placeholder={`Describe your ${sandboxMode}...`}
                        className={`w-full h-40 border p-6 rounded-3xl text-sm font-serif italic focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none ${
                          sandboxTheme === 'dark' ? 'bg-slate-800/40 border-slate-800 text-slate-200 placeholder:text-slate-600' : 'bg-slate-50 border-slate-100 text-slate-700'
                        }`}
                      />
                      <div className="flex items-center gap-3 absolute bottom-4 right-4">
                        <AnimatePresence>
                          {sandboxLoading && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.8, x: 10 }}
                              animate={{ opacity: 1, scale: 1, x: 0 }}
                              exit={{ opacity: 0, scale: 0.8, x: 10 }}
                              className="flex items-center gap-2 pr-4"
                            >
                              <div className="flex gap-1">
                                {[0, 1, 2].map((i) => (
                                  <motion.div
                                    key={i}
                                    animate={{ 
                                      height: [4, 12, 4],
                                      opacity: [0.3, 1, 0.3]
                                    }}
                                    transition={{ 
                                      repeat: Infinity, 
                                      duration: 0.8, 
                                      delay: i * 0.15 
                                    }}
                                    className={`w-1 rounded-full ${
                                      sandboxMode === 'image' ? 'bg-cyan-400' :
                                      sandboxMode === 'audio' ? 'bg-amber-400' : 'bg-fuchsia-400'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className={`text-[8px] font-black uppercase tracking-widest ${
                                sandboxTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                              }`}>
                                {sandboxMode === 'image' ? 'Rendering' : sandboxMode === 'audio' ? 'Modulating' : 'Simulating'}
                              </span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        
                        <button 
                          onClick={handleSandboxGenerate}
                          disabled={sandboxLoading || presetLoading}
                          className={`relative p-4 rounded-2xl hover:bg-indigo-600 transition-all shadow-xl disabled:opacity-50 overflow-hidden ${
                            sandboxTheme === 'dark' ? 'bg-indigo-500 text-white' : 'bg-[#0F172A] text-white'
                          }`}
                        >
                          {sandboxLoading && (
                            <motion.div 
                              animate={{ 
                                scale: [1, 1.5, 1],
                                opacity: [0, 0.2, 0]
                              }}
                              transition={{ repeat: Infinity, duration: 1.5 }}
                              className="absolute inset-0 bg-white"
                            />
                          )}
                          {sandboxLoading ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                        </button>
                      </div>
                    </div>

                    <div className={`mt-8 border-t pt-8 min-h-[350px] ${sandboxTheme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
                      <p className={`text-[10px] font-black uppercase tracking-widest mb-4 ${sandboxTheme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Last Synthesis</p>
                      <div className={`rounded-3xl border h-full flex items-center justify-center p-4 overflow-hidden min-h-[250px] ${
                        sandboxTheme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-100'
                      }`}>
                        {!sandboxResult && !sandboxLoading && (
                          <div className="text-center">
                            <Sparkles className={`mx-auto mb-2 ${sandboxTheme === 'dark' ? 'text-slate-700' : 'text-slate-300'}`} size={32} />
                            <p className={`text-xs font-serif italic ${sandboxTheme === 'dark' ? 'text-slate-600' : 'text-slate-400'}`}>Awaiting Operator Directive...</p>
                          </div>
                        )}
                        {sandboxLoading && (
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                            <p className="text-[10px] font-black uppercase text-indigo-600 animate-pulse">Forging Artifact...</p>
                          </div>
                        )}
                        {sandboxResult && !sandboxLoading && (
                          <div className="w-full h-full">
                            {sandboxMode === 'image' && (
                              <img src={sandboxResult} alt="Generated Artifact" className="w-full max-h-[400px] object-contain rounded-2xl shadow-2xl mx-auto" referrerPolicy="no-referrer" />
                            )}
                            {sandboxMode === 'audio' && (
                              <div className="h-full flex flex-col items-center justify-center gap-6">
                                <motion.div 
                                  animate={{ scale: [1, 1.1, 1] }}
                                  transition={{ repeat: Infinity, duration: 2 }}
                                  className="w-24 h-24 bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-2xl shadow-indigo-500/20"
                                >
                                  <Music size={40} />
                                </motion.div>
                                <audio src={sandboxResult} controls className="w-full max-w-sm" />
                              </div>
                            )}
                            {sandboxMode === 'experiment' && (
                              <div className="w-full max-w-lg">
                                <div className="flex items-center justify-between mb-6">
                                   <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                      <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Simulation Successful</p>
                                   </div>
                                   <div className="text-right">
                                      <p className={`text-2xl font-mono font-bold ${sandboxTheme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{sandboxResult.predictedImpact}</p>
                                      <p className="text-[8px] font-black uppercase text-slate-400 tracking-tighter">Impact Resonance</p>
                                   </div>
                                </div>
                                <div className="space-y-4">
                                  <div className={`p-4 rounded-2xl border shadow-sm ${sandboxTheme === 'dark' ? 'bg-slate-800/40 border-slate-800' : 'bg-white border-slate-200'}`}>
                                    <p className={`text-[10px] font-black uppercase mb-2 border-b pb-2 ${sandboxTheme === 'dark' ? 'text-slate-500 border-slate-800' : 'text-slate-400 border-slate-50'}`}>Findings</p>
                                    <p className={`text-xs font-mono leading-relaxed ${sandboxTheme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{sandboxResult.findings}</p>
                                  </div>

                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {sandboxResult.parameterBreakdown && Object.entries(sandboxResult.parameterBreakdown).map(([key, val]: [string, any]) => (
                                      <div key={key} className={`p-3 rounded-xl border ${sandboxTheme === 'dark' ? 'bg-slate-800/20 border-slate-800 shadow-inner' : 'bg-slate-50 border-slate-100 shadow-sm'}`}>
                                        <p className="text-[7px] font-black uppercase text-slate-500 mb-1 tracking-tighter">{key.replace(/([A-Z])/g, ' $1')}</p>
                                        <p className={`text-[10px] font-mono font-bold truncate ${sandboxTheme === 'dark' ? 'text-indigo-300' : 'text-indigo-600'}`}>{val}</p>
                                      </div>
                                    ))}
                                  </div>

                                  <div className={`p-4 rounded-2xl border max-h-[300px] overflow-y-auto custom-scrollbar ${sandboxTheme === 'dark' ? 'bg-black border-slate-800' : 'bg-slate-900 border-slate-700'}`}>
                                    <div className="flex justify-between items-center mb-3 border-b border-white/5 pb-2">
                                       <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Deep Simulation Telemetry</p>
                                       <div className="flex gap-2">
                                          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />
                                          <p className="text-[8px] font-mono text-indigo-500/70">ACTIVE STREAM</p>
                                       </div>
                                    </div>
                                    <div className="space-y-1.5">
                                      {sandboxResult.simulationLogs?.map((log: string, idx: number) => (
                                        <div key={idx} className="flex gap-3 items-start group">
                                          <span className="text-[8px] font-mono text-slate-600 shrink-0 mt-0.5">{(idx + 1).toString().padStart(2, '0')}</span>
                                          <p className="text-[9px] font-mono text-indigo-300 leading-normal group-hover:text-indigo-100 transition-colors">{log}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  <div className={`p-4 rounded-2xl border ${sandboxTheme === 'dark' ? 'bg-rose-950/20 border-rose-900/30' : 'bg-rose-50 border-rose-100'}`}>
                                    <p className={`text-[10px] font-black uppercase text-rose-400 mb-2 border-b border-rose-200/20 pb-2`}>Anomalies Detected</p>
                                    <p className={`text-xs font-mono italic ${sandboxTheme === 'dark' ? 'text-rose-300' : 'text-rose-600'}`}>{sandboxResult.anomalies}</p>
                                  </div>

                                  <div className={`pt-4 border-t ${sandboxTheme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
                                     <div className="flex gap-2">
                                       <input 
                                         type="text"
                                         placeholder="Blueprint Name..."
                                         value={presetName}
                                         onChange={(e) => setPresetName(e.target.value)}
                                         className={`flex-1 border rounded-xl px-4 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${sandboxTheme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                                       />
                                       <button 
                                         onClick={handleSavePreset}
                                         disabled={isSavingPreset || !presetName.trim()}
                                         className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all disabled:opacity-50 flex items-center gap-2"
                                       >
                                         {isSavingPreset ? <Loader2 className="animate-spin" size={12} /> : <Bookmark size={12} />}
                                         Save Blueprint
                                       </button>
                                     </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* The Crucible: Collaborative Canvas */}
                  <div className="bg-[#0F172A] rounded-[40px] p-8 text-white shadow-2xl flex flex-col h-full relative overflow-hidden min-h-[700px]">
                    <div className="absolute top-0 right-0 p-8 z-10">
                       <div className="flex items-center gap-3">
                          <div className="text-right">
                             <p className="text-[8px] font-black uppercase text-indigo-400 tracking-widest">Active Architects</p>
                             <p className="text-lg font-serif font-black italic">147.C</p>
                          </div>
                          <div className="flex -space-x-3">
                            {[1, 2, 3].map(i => (
                              <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0F172A] bg-indigo-500/20 flex items-center justify-center overflow-hidden">
                                 <div className="w-full h-full bg-slate-800 animate-pulse" />
                              </div>
                            ))}
                          </div>
                       </div>
                    </div>

                    <div className="mb-12 relative z-10">
                       <h3 className="text-3xl font-serif font-black uppercase tracking-tight mb-2">The Crucible</h3>
                       <div className="flex items-center gap-2 mb-4">
                          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />
                          <p className="text-[10px] font-mono text-indigo-400 uppercase tracking-[0.4em]">Live Collaborative Tapestry</p>
                       </div>
                       <p className="text-white/40 font-serif italic text-sm max-w-xs leading-relaxed">
                          A decentralized repository of neural synthesis. Every output is woven into the collective institute legacy.
                       </p>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 relative z-10">
                       <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                         {crucibleOutputs.map((output, idx) => (
                           <motion.div 
                             key={output.id}
                             initial={{ opacity: 0, scale: 0.8 }}
                             animate={{ opacity: 1, scale: 1 }}
                             transition={{ delay: Math.min(idx * 0.05, 1) }}
                             whileHover={{ scale: 1.05, zIndex: 20 }}
                             className="aspect-square bg-white/5 rounded-3xl border border-white/10 overflow-hidden relative group cursor-pointer"
                           >
                             {output.type === 'image' && (
                               <img src={output.content} alt={output.prompt} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" referrerPolicy="no-referrer" />
                             )}
                             {output.type === 'audio' && (
                               <div className="w-full h-full flex items-center justify-center bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-colors">
                                 <Music className="text-indigo-400 group-hover:scale-125 transition-transform" size={32} />
                               </div>
                             )}
                             {output.type === 'experiment' && (
                               <div className="w-full h-full p-6 flex flex-col justify-between bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors">
                                  <div className="flex justify-between items-start">
                                     <Cpu className="text-emerald-400" size={24} />
                                     <span className="text-[10px] font-mono text-emerald-400">{output.metadata?.predictedImpact || '—'}%</span>
                                  </div>
                                  <p className="text-[8px] font-mono text-white/40 line-clamp-3">{output.prompt}</p>
                               </div>
                             )}
                             <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 p-6 flex flex-col justify-end transform translate-y-4 group-hover:translate-y-0 text-left">
                                <p className="text-[10px] font-mono text-indigo-400 mb-2 uppercase tracking-widest">{output.type}</p>
                                <p className="text-[9px] font-mono text-white/80 mb-3 line-clamp-2 uppercase tracking-tighter">PRMPT: {output.prompt}</p>
                                <div className="h-px w-8 bg-white/20 mb-3" />
                                <p className="text-xs font-serif font-black italic">Anonymous Architect</p>
                             </div>
                           </motion.div>
                         ))}
                       </div>
                       
                       {crucibleOutputs.length === 0 && (
                          <div className="h-96 flex flex-col items-center justify-center text-white/10">
                             <div className="relative">
                                <Zap className="animate-pulse mb-4 text-indigo-500/20" size={64} />
                                <div className="absolute inset-0 blur-2xl bg-indigo-500/10 animate-pulse" />
                             </div>
                             <p className="text-sm font-serif italic tracking-widest">Awaiting the first architectural spark...</p>
                          </div>
                       )}
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/5 text-center relative z-10">
                       <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]">Institutional Verification Required for Full Access</p>
                    </div>
                    
                    {/* Decorative Background Elements */}
                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-indigo-500/5 to-transparent pointer-events-none" />
                    <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {viewingResonanceId && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/60"
              >
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden relative"
                >
                  <button 
                    onClick={() => setViewingResonanceId(null)}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 transition-colors z-20"
                  >
                    <X size={20} className="text-slate-400" />
                  </button>

                  {(() => {
                    const college = colleges.find(c => c.id === viewingResonanceId);
                    if (!college) return null;

                    return (
                      <div className="flex flex-col">
                        <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-8 opacity-10">
                              <Activity size={120} />
                           </div>
                           <div className="relative z-10">
                              <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-1">Neural Resonance Audit</p>
                              <h3 className="text-3xl font-serif font-black uppercase tracking-tight mb-2">{college.name}</h3>
                              <div className="flex items-center gap-4 text-white/60 text-xs font-mono">
                                 <span className="flex items-center gap-1"><Map size={12} /> {college.location}</span>
                                 <span className="flex items-center gap-1"><History size={12} /> Live Temporal Stream</span>
                              </div>
                           </div>
                        </div>

                        <div className="p-8 space-y-8">
                           <div>
                              <div className="flex justify-between items-center mb-4">
                                 <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Resonance Trend (72h)</p>
                                 <div className="flex gap-1">
                                    {[...Array(5)].map((_, i) => (
                                       <div key={i} className={`w-1 h-3 rounded-full ${i === 4 ? 'bg-indigo-500' : 'bg-slate-200'}`} />
                                    ))}
                                 </div>
                              </div>
                              <div className="h-32 w-full bg-slate-50 rounded-2xl border border-slate-100 flex items-end justify-between px-6 py-4 overflow-hidden relative group">
                                 {/* Mock Trend Line */}
                                 <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                                    <motion.path 
                                       initial={{ pathLength: 0, opacity: 0 }}
                                       animate={{ pathLength: 1, opacity: 1 }}
                                       transition={{ duration: 1.5, ease: "easeInOut" }}
                                       d="M 0 80 Q 50 20 100 70 T 200 40 T 300 90 T 400 30 T 500 60 T 600 20"
                                       fill="none"
                                       stroke="url(#gradient)"
                                       strokeWidth="3"
                                       vectorEffect="non-scaling-stroke"
                                    />
                                    <defs>
                                       <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
                                          <stop offset="0%" stopColor="#4f46e5" />
                                          <stop offset="100%" stopColor="#06b6d4" />
                                       </linearGradient>
                                    </defs>
                                 </svg>
                                 <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-white/40 backdrop-blur-[1px] transition-all cursor-crosshair">
                                    <span className="text-[10px] font-black uppercase bg-slate-900 text-white px-3 py-1 rounded-full shadow-lg">Scan Temporal Node</span>
                                 </div>
                              </div>
                           </div>

                           <div>
                              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Related Observation Logs</p>
                              <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                                 {college.observationLogs?.map(log => (
                                    <div key={log.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors">
                                       <div className="flex justify-between items-start mb-2">
                                          <span className="text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{log.category}</span>
                                          <span className="text-[8px] font-mono text-slate-400">{log.timestamp}</span>
                                       </div>
                                       <p className="text-xs text-slate-600 font-serif italic leading-relaxed">"{log.content}"</p>
                                    </div>
                                 ))}
                                 {(!college.observationLogs || college.observationLogs.length === 0) && (
                                    <div className="text-center py-8">
                                       <Activity className="mx-auto mb-2 text-slate-200" size={24} />
                                       <p className="text-[10px] font-mono text-slate-400 uppercase">No observation logs captured for this cluster.</p>
                                    </div>
                                 )}
                              </div>
                           </div>

                           <div className="pt-6 border-t border-slate-100 flex justify-end">
                              <button 
                                 onClick={() => setViewingResonanceId(null)}
                                 className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all"
                              >
                                 Close Dossier
                              </button>
                           </div>
                        </div>
                      </div>
                    );
                  })()}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.05); border-radius: 10px; }
        aside .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); }
        .bg-[#0F172A] .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); }
      `}</style>
    </div>
  );
}

function ModuleCard({ number, title, desc, weeks }: { number: string, title: string, desc: string, weeks: string[] }) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:border-indigo-500/30 transition-all group">
      <div className="flex items-center gap-4 mb-6">
        <span className="text-4xl font-serif font-black text-slate-100 group-hover:text-indigo-50 group-transition-colors">{number}</span>
        <div>
          <h4 className="font-serif font-bold text-lg text-slate-900">{title}</h4>
          <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">Strategic Module</p>
        </div>
      </div>
      <p className="text-sm text-slate-500 italic mb-6 leading-relaxed">"{desc}"</p>
      <ul className="space-y-4">
        {weeks.map((week, idx) => (
          <li key={idx} className="flex gap-3 items-start group/item">
            <div className="w-1.5 h-1.5 bg-slate-200 rounded-full mt-1.5 group-hover/item:bg-indigo-400 transition-colors" />
            <p className="text-xs font-serif font-bold text-slate-700 leading-tight">{week}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface RuleCardProps {
  rule: any;
  idx: number;
  isCipherView: boolean;
  isSpecific?: boolean;
}

const RuleCard: React.FC<RuleCardProps> = ({ rule, idx, isCipherView, isSpecific }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      onClick={() => setIsExpanded(!isExpanded)}
      className={`group p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col cursor-pointer ${
        isCipherView 
          ? 'bg-slate-900 border-slate-800 text-white shadow-2xl' 
          : isSpecific 
            ? 'bg-indigo-50/30 border-indigo-100 text-slate-900 shadow-sm hover:border-indigo-400 hover:bg-white'
            : 'bg-slate-50 border-slate-100 text-slate-900 shadow-sm hover:border-indigo-300 hover:bg-white'
      } ${isExpanded 
        ? 'ring-2 ring-indigo-500/50 scale-[1.02] shadow-xl shadow-indigo-500/10' 
        : 'hover:scale-[1.01] hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/5'
      }`}
    >
      {/* Background Alchemy Element */}
      {isCipherView && (
        <div className="absolute -bottom-4 -right-4 opacity-10 rotate-12 transition-transform group-hover:rotate-45">
          <rule.icon size={80} />
        </div>
      )}
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2 rounded-xl transition-colors ${isCipherView ? 'bg-indigo-500 text-white' : isSpecific ? 'bg-indigo-500 text-white' : 'bg-indigo-100 text-indigo-600'}`}>
            <rule.icon size={16} />
          </div>
          <div className="flex items-center gap-2">
            {isSpecific && !isCipherView && (
              <span className="text-[8px] font-black bg-indigo-600 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">Node Specific</span>
            )}
            <span className={`text-[8px] font-mono uppercase tracking-[0.3em] ${isCipherView ? 'text-indigo-400' : 'text-slate-400'}`}>
              {isCipherView ? `CODE_${rule.id.toUpperCase()}` : `Protocol ${idx + 1}`}
            </span>
          </div>
        </div>
        
        <h4 className={`text-xs font-black uppercase tracking-widest mb-3 ${isCipherView ? 'text-white' : 'text-slate-900'}`}>
          {isCipherView ? 'Neural Core ID' : rule.title}
        </h4>
        
        <p className={`text-sm leading-relaxed font-serif italic mb-2 ${isCipherView ? 'text-indigo-100/80 font-mono text-xs' : 'text-slate-600'}`}>
          {isCipherView ? `"${rule.cipher}"` : `"${rule.content}"`}
        </p>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-6 pt-6 border-t border-indigo-500/10 overflow-hidden"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`p-1.5 rounded-lg flex-shrink-0 ${isCipherView ? 'bg-indigo-500/20' : 'bg-indigo-50'}`}>
                  <ShieldAlert size={14} className="text-indigo-600" />
                </div>
                <div>
                   <h5 className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isCipherView ? 'text-indigo-300' : 'text-indigo-600'}`}>Operational Insight</h5>
                   <p className={`text-xs ${isCipherView ? 'text-slate-300 font-mono' : 'text-slate-500 font-serif italic'}`}>
                     {rule.details || 'No additional protocols found in the current latent sync.'}
                   </p>
                </div>
              </div>
              
              <div className={`p-4 rounded-xl text-[10px] uppercase font-mono tracking-widest flex items-center justify-between ${isCipherView ? 'bg-black/20 text-indigo-400/50' : 'bg-slate-100 text-slate-400'}`}>
                <span>Security Level: AA-33</span>
                <span>Status: Enforced</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!isCipherView && !isExpanded && (
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-[8px] font-mono text-slate-400 uppercase tracking-widest">Click to Expand Protocol</p>
          <Plus size={10} className="text-indigo-600" />
        </div>
      )}
    </motion.div>
  );
}

function CurriculumSelector({ weight, setWeight }: { weight: number, setWeight: (w: number) => void }) {
  return (
    <div className="bg-white rounded-[40px] border border-slate-200 p-10 shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Activity size={120} />
      </div>
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
        <div className="max-w-xs text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest">Neural Bias Active</span>
          </div>
          <h3 className="text-3xl font-serif font-black uppercase tracking-tight mb-2">Curriculum Weighting</h3>
          <p className="text-xs text-slate-500 font-serif italic leading-relaxed">
            "Balance the cold calculus of the machine with the warm intuition of the soul. The path to AGI is paved with both numbers and dreams."
          </p>
        </div>

        <div className="flex-1 w-full max-w-2xl px-8">
          <div className="flex justify-between items-end mb-8">
            <div className={`text-center space-y-2 transition-all duration-500 ${weight < 50 ? 'scale-110 opacity-100' : 'opacity-40'}`}>
              <div className="w-14 h-14 bg-slate-900 text-white rounded-[20px] flex items-center justify-center shadow-2xl mx-auto border-2 border-transparent group-hover:border-indigo-500 transition-colors">
                <Cpu size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Mathematics</p>
                <p className="text-[8px] font-mono text-slate-400 uppercase">Deep-Learning Focus</p>
              </div>
            </div>

            <div className="flex-1 px-12 pb-6">
              <div className="relative group/slider">
                <div className="h-1.5 bg-slate-100 rounded-full w-full relative">
                  <motion.div 
                    initial={false}
                    animate={{ width: `${weight}%` }}
                    className="absolute inset-y-0 left-0 bg-indigo-600 rounded-full"
                  />
                  <div className="absolute inset-y-0 left-1/2 -ml-px w-0.5 h-4 bg-slate-200 -top-1.5" />
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={weight}
                  onChange={(e) => setWeight(parseInt(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer accent-indigo-600"
                />
                <motion.div 
                  initial={false}
                  animate={{ left: `${weight}%` }}
                  className="absolute top-1/2 -translate-y-1/2 -ml-4 w-8 h-8 bg-white rounded-full border-2 border-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.3)] pointer-events-none flex items-center justify-center"
                >
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                </motion.div>
                
                <div className="mt-8 flex justify-between text-[8px] font-mono text-slate-400 uppercase tracking-[0.4em]">
                   <span>Pure Logic</span>
                   <span>Equilibrium</span>
                   <span>Pure Art</span>
                </div>
              </div>
            </div>

            <div className={`text-center space-y-2 transition-all duration-500 ${weight > 50 ? 'scale-110 opacity-100' : 'opacity-40'}`}>
              <div className="w-14 h-14 bg-indigo-600 text-white rounded-[20px] flex items-center justify-center shadow-2xl mx-auto border-2 border-transparent group-hover:border-white transition-colors">
                <Sparkles size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Translation</p>
                <p className="text-[8px] font-mono text-slate-400 uppercase">Artistic Philosophy</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-100">
             <div className={`p-4 rounded-2xl transition-all ${weight < 50 ? 'bg-slate-50 border border-slate-200' : 'opacity-20'}`}>
                <p className="text-[8px] font-black uppercase text-slate-400 mb-2">Active Modules</p>
                <div className="flex flex-wrap gap-2">
                   {['Tensors', 'Calculus', 'Gradients'].map(m => (
                     <span key={m} className="px-2 py-0.5 bg-white border border-slate-200 rounded-lg text-[8px] font-mono">{m}</span>
                   ))}
                </div>
             </div>
             <div className={`p-4 rounded-2xl transition-all ${weight > 50 ? 'bg-indigo-50 border border-indigo-100' : 'opacity-20'}`}>
                <p className="text-[8px] font-black uppercase text-indigo-400 mb-2">Active Modules</p>
                <div className="flex flex-wrap gap-2">
                   {['Semantics', 'Aesthetics', 'Ethics'].map(m => (
                     <span key={m} className="px-2 py-0.5 bg-white border border-indigo-200 rounded-lg text-[8px] font-mono">{m}</span>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const CAMPUS_LOCATIONS = [
  { id: 'faculty-02', name: 'Faculty Node 02', desc: 'Algorithmic Aesthetics Wing', level: 'Level 14', distance: '120m' },
  { id: 'nexus-ops', name: 'Nexus Ops', desc: 'Central Control Hub', level: 'Level 01', distance: '450m' },
  { id: 'latent-arch', name: 'Latent Archive', desc: 'Secure Data Vault', level: 'Sub-Level 4', distance: '890m' }
];

const NAVIGATION_STEPS = [
  { id: 's1', instruction: 'Proceed to North Elevator Bank', distance: '20m', icon: ChevronRight },
  { id: 's2', instruction: 'Descend to Resonance Level 0', distance: 'Floor Switch', icon: ChevronDown },
  { id: 's3', instruction: 'Follow Blue Neural Beacon Path', distance: '85m', icon: Activity },
  { id: 's4', instruction: 'Arrive at Target Destination', distance: '0m', icon: CheckCircle2 }
];

function ARSpatialMap() {
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [visionMode, setVisionMode] = useState<'STANDARD' | 'THERMAL' | 'NEURAL'>('NEURAL');

  return (
    <div className="bg-[#0F172A] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden h-full flex flex-col">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-2">
          <Navigation className="text-indigo-400" size={18} />
          <h3 className="text-lg font-serif font-black uppercase tracking-tight">AR Spatial Map</h3>
        </div>
        {isNavigating && (
          <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full border border-indigo-500/30">
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">Active Path</span>
          </div>
        )}
      </div>

      <div className="aspect-square bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center relative mb-8 overflow-hidden group">
        {/* Grid Overlay */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />
        
        {/* Radar Rings */}
        <div className="absolute w-[280px] h-[280px] border border-indigo-500/10 rounded-full" />
        <div className="absolute w-[180px] h-[180px] border border-indigo-500/20 rounded-full" />
        
        {/* Rotating Scanner */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
          className="absolute inset-0 origin-center bg-[conic-gradient(from_0deg,transparent_75%,rgba(99,102,241,0.2)_100%)] rounded-full"
        />

        {/* Neural Beacons / Points of Interest */}
        {!isNavigating ? (
          CAMPUS_LOCATIONS.map((loc, i) => (
            <motion.div
              key={loc.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.2 }}
              className="absolute cursor-pointer group/node"
              style={{ 
                top: `${20 + (i * 30)}%`, 
                left: `${30 + (i * 20)}%` 
              }}
              onClick={() => setIsNavigating(true)}
            >
               <div className="w-3 h-3 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.8)] relative z-10" />
               <div className="absolute top-1/2 left-full ml-3 -translate-y-1/2 w-48 opacity-0 group-hover/node:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-slate-900/90 border border-indigo-500/30 p-3 rounded-xl backdrop-blur-sm">
                    <p className="text-[10px] font-black uppercase text-indigo-400 mb-1">{loc.name}</p>
                    <p className="text-[8px] text-white/60 font-mono tracking-widest">{loc.desc} | {loc.level}</p>
                  </div>
               </div>
            </motion.div>
          ))
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Active Navigation Pathing */}
            <svg className="w-full h-full opacity-50">
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
                d="M 50,250 L 150,200 L 250,150 L 320,100"
                fill="none"
                stroke="#6366f1"
                strokeWidth="2"
                strokeDasharray="8,8"
                className="stroke-indigo-400"
              />
            </svg>
            <motion.div 
               animate={{ 
                 left: ['50%', '60%', '70%', '80%'], 
                 top: ['70%', '60%', '50%', '40%'] 
               }}
               transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
               className="absolute w-3 h-3 bg-indigo-400 rounded-full shadow-[0_0_20px_#6366f1] z-20"
            />
          </div>
        )}

        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none">
          <div className="space-y-1">
             <p className="text-[10px] font-mono text-indigo-400/80 uppercase tracking-widest">
               {isNavigating ? 'Navigating: target_nexus' : 'Vision_Mode: Active'}
             </p>
             <p className="text-[8px] font-mono text-white/30 uppercase tracking-[0.2em]">Coordinates: 33.092 / -118.271</p>
          </div>
          <div className="flex gap-2 pointer-events-auto">
             {['NEURAL', 'THERMAL'].map(m => (
               <button 
                 key={m}
                 onClick={() => setVisionMode(m as any)}
                 className={`w-6 h-6 rounded-lg text-[8px] border transition-all ${visionMode === m ? 'bg-indigo-600 border-indigo-400' : 'bg-white/5 border-white/10 text-white/40'}`}
               >
                 {m.charAt(0)}
               </button>
             ))}
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4">
        {isNavigating ? (
          <div className="space-y-3">
             <div className="p-4 bg-indigo-600 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-20">
                   <Navigation size={24} />
                </div>
                <p className="text-[10px] font-black uppercase text-indigo-200 mb-1">Current Instruction</p>
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-white/20 rounded-xl">
                      {React.createElement(NAVIGATION_STEPS[currentStep].icon, { size: 16 })}
                   </div>
                   <p className="text-sm font-serif font-black">{NAVIGATION_STEPS[currentStep].instruction}</p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                   <p className="text-[10px] font-mono text-indigo-200 uppercase">{NAVIGATION_STEPS[currentStep].distance} to next Node</p>
                   <button 
                     onClick={() => currentStep < NAVIGATION_STEPS.length - 1 ? setCurrentStep(currentStep + 1) : setIsNavigating(false)}
                     className="text-[10px] font-black uppercase bg-white text-indigo-600 px-3 py-1 rounded-lg"
                   >
                     {currentStep === NAVIGATION_STEPS.length - 1 ? 'End Path' : 'Complete'}
                   </button>
                </div>
             </div>
             
             <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                {NAVIGATION_STEPS.map((step, i) => (
                  <div 
                    key={step.id} 
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      i === currentStep ? 'bg-white/10 border-indigo-500/50' : 
                      i < currentStep ? 'opacity-30 border-white/5' : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                       <step.icon size={14} className={i === currentStep ? 'text-indigo-400' : 'text-white/40'} />
                       <span className="text-[10px] uppercase font-bold tracking-tight">{step.instruction}</span>
                    </div>
                    <span className="text-[8px] font-mono text-white/30">{step.distance}</span>
                  </div>
                ))}
             </div>
          </div>
        ) : (
          <div className="space-y-4">
             <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                <p className="text-[10px] font-black uppercase text-white/30 mb-4 tracking-widest underline decoration-indigo-500/30 underline-offset-4">Recent Beacons</p>
                <div className="space-y-3">
                   {CAMPUS_LOCATIONS.map(loc => (
                     <div key={loc.id} className="flex items-center justify-between group">
                        <div>
                           <p className="text-[10px] font-black uppercase text-white group-hover:text-indigo-400 transition-colors">{loc.name}</p>
                           <p className="text-[8px] text-white/40 font-mono italic">{loc.level}</p>
                        </div>
                        <button 
                           onClick={() => setIsNavigating(true)}
                           className="p-2 hover:bg-indigo-600 rounded-lg transition-colors text-white/40 hover:text-white"
                        >
                           <Navigation size={12} />
                        </button>
                     </div>
                   ))}
                </div>
             </div>
             <button 
                onClick={() => setIsNavigating(true)}
                className="w-full py-4 bg-indigo-600 rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-indigo-500 transition-all shadow-lg"
             >
                Initialize Voice Guidance
             </button>
          </div>
        )}
      </div>
    </div>
  );
}

function RulesOfTheRealm({ selectedProjectName }: { selectedProjectName: string }) {
  const [isCipherView, setIsCipherView] = React.useState(false);
  const generalRules = RULES_DATA.general;
  const specificRules = RULES_DATA[selectedProjectName] || [];

  return (
    <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm transition-all duration-500">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-xl relative overflow-hidden group">
            <Scale className={`text-indigo-600 transition-all duration-500 ${isCipherView ? 'rotate-180 scale-75 opacity-50' : ''}`} size={18} />
            <Sparkles className={`absolute inset-0 m-auto text-indigo-400 transition-all duration-500 ${isCipherView ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} size={12} />
          </div>
          <div>
            <h3 className="font-serif font-black uppercase text-sm tracking-tight flex items-center gap-2">
              Rules of the Realm
              {isCipherView && <span className="text-[10px] text-indigo-500 italic lowercase font-normal">(linguistic alchemy active)</span>}
            </h3>
            <p className="text-[8px] font-mono text-slate-400 uppercase tracking-widest">Foundational Constitution | Apex 33</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsCipherView(!isCipherView)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-[10px] font-black uppercase tracking-widest ${
              isCipherView 
                ? 'bg-[#0F172A] text-white border-slate-800 shadow-lg' 
                : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
            }`}
          >
            {isCipherView ? <Eye size={12} /> : <Scan size={12} />}
            {isCipherView ? 'Operational View' : 'Neural Sync'}
          </button>
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-widest">Synced</span>
          </div>
        </div>
      </div>
      
      <div className="p-8 space-y-12 min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div 
            key={isCipherView ? 'cipher' : 'operational'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-12"
          >
            {/* General Rules Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-100" />
                <h4 className={`text-[10px] font-black uppercase tracking-[0.4em] ${isCipherView ? 'text-indigo-400' : 'text-slate-400'}`}>Foundational Sovereignty</h4>
                <div className="h-px flex-1 bg-slate-100" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {generalRules.map((rule, idx) => (
                  <RuleCard key={rule.id} rule={rule} idx={idx} isCipherView={isCipherView} />
                ))}
              </div>
            </div>

            {/* Project Specific Rules Section */}
            {specificRules.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-indigo-100" />
                  <div className="flex items-center gap-2">
                    <Activity size={12} className={isCipherView ? 'text-indigo-400' : 'text-indigo-600'} />
                    <h4 className={`text-[10px] font-black uppercase tracking-[0.4em] ${isCipherView ? 'text-indigo-400' : 'text-indigo-600'}`}>
                      Local Node Protocols: {selectedProjectName}
                    </h4>
                  </div>
                  <div className="h-px flex-1 bg-indigo-100" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {specificRules.map((rule, idx) => (
                    <RuleCard key={rule.id} rule={rule} idx={idx} isCipherView={isCipherView} isSpecific />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      
      <div className={`px-8 py-4 border-t flex items-center justify-between transition-colors duration-500 ${
        isCipherView ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${isCipherView ? 'bg-indigo-500 animate-pulse' : 'bg-emerald-500'}`} />
          <p className={`text-[8px] font-mono uppercase tracking-widest ${isCipherView ? 'text-indigo-400' : 'text-slate-400'}`}>
            {isCipherView ? 'Accessing Foundational Lattice...' : 'Authorized by the Grvelli Board of Oversight | Home of the Black Leopard'}
          </p>
        </div>
        <button className={`text-[8px] font-black uppercase tracking-widest transition-colors ${
          isCipherView ? 'text-indigo-400 hover:text-white' : 'text-indigo-600 hover:underline'
        }`}>
          {isCipherView ? 'Decrypt Full Lattice' : 'Download Full Charter'}
        </button>
      </div>
    </div>
  );
}


function BiometricGate({ children, isAuthorized, onAuthorize }: { children: React.ReactNode, isAuthorized: boolean, onAuthorize: () => void }) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanType, setScanType] = useState<'fingerprint' | 'facial'>('fingerprint');
  const [status, setStatus] = useState<'READY' | 'SCANNING' | 'ANALYZING' | 'SYNCED' | 'FAILED'>('READY');

  const startScan = () => {
    setIsScanning(true);
    setStatus('SCANNING');
    setScanProgress(0);
    
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setStatus('ANALYZING');
          setTimeout(() => {
            setStatus('SYNCED');
            setTimeout(() => {
              onAuthorize();
            }, 800);
          }, 1500);
          return 100;
        }
        return prev + 2;
      });
    }, 40);
  };

  if (isAuthorized) return <>{children}</>;

  return (
    <div className="min-h-[600px] bg-slate-900 rounded-[40px] flex flex-col items-center justify-center p-12 relative overflow-hidden text-white shadow-2xl">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(79,70,229,0.15),transparent)] pointer-events-none" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md text-center"
      >
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-6">
            <Lock size={12} />
            Restricted Threshold
          </div>
          <h3 className="text-4xl font-serif font-black uppercase tracking-tight mb-4">Neural Biometric Check</h3>
          <p className="text-white/40 text-sm font-serif italic mb-12">"Prove your sentience. The institute requires a deep latent sync to verify the hand of the creator."</p>
        </div>

        <div className="relative flex justify-center mb-16">
          <div className="relative group">
            {/* Scan Area */}
            <div className={`w-48 h-48 bg-white/5 border-2 rounded-[32px] flex items-center justify-center transition-all duration-500 ${
              isScanning ? 'border-indigo-500 shadow-[0_0_40px_rgba(79,102,241,0.2)]' : 'border-white/10'
            }`}>
              {status === 'READY' && (
                scanType === 'fingerprint' ? <Fingerprint size={80} className="text-white/20 group-hover:text-indigo-400 group-hover:scale-110 transition-all duration-500" />
                : <Scan size={80} className="text-white/20 group-hover:text-indigo-400 group-hover:scale-110 transition-all duration-500" />
              )}
              
              {(status === 'SCANNING' || status === 'ANALYZING') && (
                <div className="relative flex flex-col items-center">
                   {scanType === 'fingerprint' ? <Fingerprint size={80} className="text-indigo-500/50" />
                   : <Scan size={80} className="text-indigo-500/50" />
                   }
                   {/* Laser Line */}
                   {status === 'SCANNING' && (
                     <motion.div 
                       animate={{ top: ['0%', '100%', '0%'] }}
                       transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                       className="absolute left-0 right-0 h-0.5 bg-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.8)] z-10"
                     />
                   )}
                </div>
              )}

              {status === 'SYNCED' && (
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-emerald-500/20 p-6 rounded-full"
                >
                  <UserCheck size={48} className="text-emerald-400" />
                </motion.div>
              )}
            </div>

            {/* Circular Progress (Visual only) */}
            {isScanning && (
              <svg className="absolute inset-0 -m-4 w-56 h-56 -rotate-90 pointer-events-none">
                <circle
                  cx="112"
                  cy="112"
                  r="100"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-white/5"
                />
                <motion.circle
                  cx="112"
                  cy="112"
                  r="100"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="628"
                  animate={{ strokeDashoffset: 628 - (628 * scanProgress / 100) }}
                  className="text-indigo-500 shadow-[0_0_10px_indigo]"
                />
              </svg>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => setScanType('fingerprint')}
              className={`p-4 rounded-2xl border transition-all ${
                scanType === 'fingerprint' ? 'bg-white/10 border-white/20' : 'bg-transparent border-white/5 text-white/40'
              }`}
            >
              <Fingerprint size={24} />
            </button>
            <button 
              onClick={() => setScanType('facial')}
              className={`p-4 rounded-2xl border transition-all ${
                scanType === 'facial' ? 'bg-white/10 border-white/20' : 'bg-transparent border-white/5 text-white/40'
              }`}
            >
              <Scan size={24} />
            </button>
          </div>

          <div className="min-h-[64px]">
            {status === 'READY' ? (
              <button 
                onClick={startScan}
                className="px-12 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-indigo-500 transition-all transform hover:scale-105 shadow-xl shadow-indigo-600/20 active:scale-95"
              >
                Initiate Biometric Scan
              </button>
            ) : (
              <div className="space-y-4 w-64 mx-auto">
                <div className="flex flex-col items-center gap-2">
                   <div className="flex items-center gap-3 text-indigo-400 font-mono text-[10px] uppercase tracking-widest">
                     <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${status === 'SYNCED' ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                     {status === 'SCANNING' ? `Capturing ${scanType} pattern...` 
                      : status === 'ANALYZING' ? 'Analyzing Neural Resonance...' 
                      : status === 'SYNCED' ? 'Neural Sync Successful' 
                      : 'Identity Verified'}
                   </div>
                   
                   {/* Linear Progress Bar */}
                   <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden relative">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ 
                          width: status === 'SYNCED' ? '100%' : `${scanProgress}%`,
                          backgroundColor: status === 'SYNCED' ? '#10b981' : '#6366f1'
                        }}
                        className="h-full shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                      />
                   </div>
                </div>
                <div className="text-[9px] text-white/20 font-mono uppercase tracking-[0.5em]">
                  {status === 'SYNCED' ? 'COMPLETED' : `${Math.floor(scanProgress)}% COGNITIVE SYNC`}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Security Info */}
      <div className="mt-12 flex items-center gap-2 text-white/20 uppercase font-mono text-[8px] tracking-[0.2em] relative z-10 transition-opacity">
        <ShieldAlert size={12} />
        Encrypted via Grvelli 256-AES Standard. Total Privacy Guaranteed.
      </div>
    </div>
  );
}

function SidebarLink({ icon, label, isActive = false, onClick }: { icon: React.ReactNode, label: string, isActive?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 relative group ${
        isActive 
          ? 'bg-apex-green text-obsidian font-bold shadow-[0_0_20px_rgba(57,255,20,0.3)]' 
          : 'text-platinum/60 hover:bg-white/5 hover:text-platinum'
      }`}
    >
      <span className={`${isActive ? 'text-obsidian' : 'text-platinum/40 group-hover:text-apex-green transition-colors'}`}>
        {icon}
      </span>
      <span className="text-xs font-black uppercase tracking-widest">{label}</span>
      {isActive && (
        <motion.div 
          layoutId="sidebar-pill"
          className="absolute left-0 w-1 h-6 bg-obsidian rounded-r-full"
        />
      )}
    </button>
  );
}

function InteractiveTreeNode({ node, isExpanded, onToggle, onToggleModule, isLast }: any) {
  const isOpen = isExpanded;
  
  return (
    <div className="relative">
      {/* Branch Connector */}
      {!isLast && (
        <div className="absolute left-[39px] top-[60px] bottom-[-20px] w-0.5 z-0">
          <div className="h-full w-full bg-slate-100" />
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: node.status === 'illuminated' ? '100%' : '0%' }}
            className="absolute top-0 w-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
          />
        </div>
      )}

      <div className={`relative z-10 mb-8 rounded-[32px] border transition-all duration-500 ${
        isOpen ? 'bg-slate-50 border-indigo-200 shadow-lg' : 'bg-white border-slate-200 hover:border-indigo-100 hover:shadow-sm'
      }`}>
        <button 
          onClick={onToggle}
          className="w-full text-left p-8 flex items-center justify-between group"
        >
          <div className="flex items-center gap-8">
            <div className="relative">
               <div className={`w-4 h-4 rounded-full transition-all duration-500 ${
                 node.status === 'illuminated' ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.8)] scale-110' :
                 node.status === 'active' ? 'bg-indigo-500' : 'bg-slate-200'
               }`} />
               {node.status === 'active' && (
                 <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-20" />
               )}
            </div>
            <div>
              <h4 className={`text-xl font-serif font-black uppercase tracking-tight transition-colors duration-500 ${
                isOpen ? 'text-indigo-600' : 'text-slate-800'
              }`}>{node.title}</h4>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-[0.2em] mt-1">Status: {node.status}</p>
            </div>
          </div>
          <motion.div
             animate={{ rotate: isOpen ? 180 : 0, scale: isOpen ? 1.2 : 1 }}
             transition={{ type: 'spring', stiffness: 300, damping: 20 }}
             className={`p-2 rounded-xl transition-colors ${isOpen ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
          >
            <ChevronDown size={20} />
          </motion.div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="overflow-hidden"
            >
              <div className="px-8 pb-8 space-y-4">
                <p className="text-sm text-slate-500 font-serif italic mb-6 leading-relaxed bg-white/50 p-4 rounded-2xl border border-slate-100">"{node.desc}"</p>
                <div className="space-y-3">
                  {node.modules.map((mod: any, i: number) => (
                    <motion.div 
                      key={i}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className={`flex items-center justify-between p-5 bg-white rounded-2xl border shadow-sm group/mod cursor-pointer transition-all ${
                        mod.status === 'locked' ? 'opacity-50 cursor-not-allowed border-slate-100' : 'hover:border-indigo-400 hover:shadow-md border-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {mod.status === 'completed' ? (
                          <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center">
                             <CheckCircle2 size={14} className="text-emerald-500" />
                          </div>
                        ) : mod.status === 'active' ? (
                          <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center">
                             <div className="w-3 h-3 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center">
                             <Lock size={12} className="text-slate-300" />
                          </div>
                        )}
                        <div>
                           <span className={`text-xs font-black uppercase tracking-widest block ${
                             mod.status === 'locked' ? 'text-slate-400' : 'text-slate-800'
                           }`}>{mod.name}</span>
                           <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest">{mod.status === 'completed' ? 'Synced' : mod.status}</span>
                        </div>
                      </div>
                      {mod.status !== 'locked' && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleModule(node.id, mod.id);
                          }}
                          className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-lg transition-all transform hover:scale-105 ${
                            mod.status === 'completed' ? 'bg-emerald-500 text-white' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white'
                          }`}
                        >
                          {mod.status === 'completed' ? 'Completed' : 'Sync Neural'}
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, trend, progress, subtext }: { icon: React.ReactNode, label: string, value: string | number, trend?: string, progress?: number, subtext?: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-indigo-600">
          {icon}
        </div>
        {trend && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase tracking-tighter">{trend}</span>}
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-serif font-black text-slate-900 mb-2">{value}</p>
      {progress !== undefined && (
        <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden mb-1">
          <motion.div 
            initial={{ width: 0 }}
            whileInView={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-indigo-500"
          />
        </div>
      )}
      {subtext && <p className="text-[10px] font-medium text-slate-400 italic">{subtext}</p>}
    </div>
  );
}

function CollegeRow({ college }: { college: College, key?: string }) {
  const completed = college.tasks.filter(t => t.isCompleted).length;
  const total = college.tasks.length;
  
  return (
    <div className="p-6 flex items-center justify-between group hover:bg-slate-50 transition-all cursor-pointer">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-serif font-black text-xl shadow-sm transform group-hover:scale-110 transition-transform ${
          college.name.startsWith('S') ? 'bg-rose-50 text-rose-700' : 
          college.name.startsWith('M') ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'
        }`}>
          {college.name.charAt(0)}
        </div>
        <div>
          <p className="font-serif font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{college.name}</p>
          <div className="flex items-center gap-3 mt-1 text-slate-500">
            <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-tight">
              <Calendar size={12} className="text-slate-400" />
              {new Date(college.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            <span className="w-1 h-1 bg-slate-200 rounded-full" />
            <span className="text-[10px] font-bold uppercase tracking-tight">{completed}/{total} Requirements</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <StatusBadge status={college.status} />
        <button className="text-slate-300 hover:text-indigo-600 transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const configs: Record<ApplicationStatus, string> = {
    Interested: 'bg-slate-50 text-slate-500 border border-slate-200',
    Applying: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
    Submitted: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    Accepted: 'bg-amber-100 text-amber-800 border border-amber-200 shadow-sm shadow-amber-200/50',
    Waitlisted: 'bg-orange-50 text-orange-700 border border-orange-100',
    Rejected: 'bg-rose-50 text-rose-700 border border-rose-100',
    Deferred: 'bg-purple-50 text-purple-700 border border-purple-100'
  };

  return (
    <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] ${configs[status]}`}>
      {status}
    </span>
  );
}
