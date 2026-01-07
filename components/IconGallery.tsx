import React from 'react';
import { 
  Activity, AlertCircle, AlertTriangle, ArrowLeft, ArrowRight, Bell, BookOpen, Bot, 
  Calendar, Camera, Check, ChevronLeft, ChevronRight, Clock, Ear, Edit2, FileText, 
  Flame, GitCompare, GraduationCap, HandMetal, Heart, HeartPulse, Home, Info, 
  LayoutDashboard, Loader2, Lock, LogOut, Mail, MessageCircle, MessageSquare, Mic, 
  MicOff, Moon, Music, PhoneCall, Play, PlayCircle, Plus, RefreshCw, RotateCcw, 
  ScanEye, ScanFace, Send, Share2, Shield, Sparkles, Star, Stethoscope, ThumbsUp, 
  Timer, Trash2, Upload, User, UserCheck, UserCircle, UserCog, UserPlus, Users, 
  Utensils, X, Zap 
} from 'lucide-react';

const icons = [
  { name: 'Activity', component: Activity },
  { name: 'AlertCircle', component: AlertCircle },
  { name: 'AlertTriangle', component: AlertTriangle },
  { name: 'ArrowLeft', component: ArrowLeft },
  { name: 'ArrowRight', component: ArrowRight },
  { name: 'Bell', component: Bell },
  { name: 'BookOpen', component: BookOpen },
  { name: 'Bot', component: Bot },
  { name: 'Calendar', component: Calendar },
  { name: 'Camera', component: Camera },
  { name: 'Check', component: Check },
  { name: 'ChevronLeft', component: ChevronLeft },
  { name: 'ChevronRight', component: ChevronRight },
  { name: 'Clock', component: Clock },
  { name: 'Ear', component: Ear },
  { name: 'Edit2', component: Edit2 },
  { name: 'FileText', component: FileText },
  { name: 'Flame', component: Flame },
  { name: 'GitCompare', component: GitCompare },
  { name: 'GraduationCap', component: GraduationCap },
  { name: 'HandMetal', component: HandMetal },
  { name: 'Heart', component: Heart },
  { name: 'HeartPulse', component: HeartPulse },
  { name: 'Home', component: Home },
  { name: 'Info', component: Info },
  { name: 'LayoutDashboard', component: LayoutDashboard },
  { name: 'Loader2', component: Loader2 },
  { name: 'Lock', component: Lock },
  { name: 'LogOut', component: LogOut },
  { name: 'Mail', component: Mail },
  { name: 'MessageCircle', component: MessageCircle },
  { name: 'MessageSquare', component: MessageSquare },
  { name: 'Mic', component: Mic },
  { name: 'MicOff', component: MicOff },
  { name: 'Moon', component: Moon },
  { name: 'Music', component: Music },
  { name: 'PhoneCall', component: PhoneCall },
  { name: 'Play', component: Play },
  { name: 'PlayCircle', component: PlayCircle },
  { name: 'Plus', component: Plus },
  { name: 'RefreshCw', component: RefreshCw },
  { name: 'RotateCcw', component: RotateCcw },
  { name: 'ScanEye', component: ScanEye },
  { name: 'ScanFace', component: ScanFace },
  { name: 'Send', component: Send },
  { name: 'Share2', component: Share2 },
  { name: 'Shield', component: Shield },
  { name: 'Sparkles', component: Sparkles },
  { name: 'Star', component: Star },
  { name: 'Stethoscope', component: Stethoscope },
  { name: 'ThumbsUp', component: ThumbsUp },
  { name: 'Timer', component: Timer },
  { name: 'Trash2', component: Trash2 },
  { name: 'Upload', component: Upload },
  { name: 'User', component: User },
  { name: 'UserCheck', component: UserCheck },
  { name: 'UserCircle', component: UserCircle },
  { name: 'UserCog', component: UserCog },
  { name: 'UserPlus', component: UserPlus },
  { name: 'Users', component: Users },
  { name: 'Utensils', component: Utensils },
  { name: 'X', component: X },
  { name: 'Zap', component: Zap },
];

const IconGallery: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-stone-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8 sticky top-0 bg-stone-50 py-4 z-10 border-b border-stone-200">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Icon Gallery</h1>
            <p className="text-stone-500 mt-1">Total Icons: {icons.length}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-stone-200 rounded-full transition-colors"
          >
            <X size={24} className="text-stone-600" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {icons.map(({ name, component: Icon }) => (
            <div 
              key={name} 
              className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border border-stone-200 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group"
              onClick={() => {
                navigator.clipboard.writeText(name);
                // Optional: Add toast notification here
              }}
            >
              <div className="p-3 bg-stone-50 rounded-lg group-hover:bg-emerald-50 transition-colors mb-3">
                <Icon size={24} className="text-stone-600 group-hover:text-emerald-600" />
              </div>
              <span className="text-xs font-medium text-stone-500 group-hover:text-emerald-700 truncate w-full text-center select-all">
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IconGallery;
