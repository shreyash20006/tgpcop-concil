import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/admin/ProtectedRoute';
import { 
  MessageSquare, Pin, CheckCircle2, XCircle, Trash2, 
  CornerDownRight, Check, RefreshCw, ShieldCheck 
} from 'lucide-react';
import { useToast } from '../../components/admin/Toast';

interface Message {
  id: string;
  content: string;
  author_name: string;
  author_email?: string;
  reply?: string;
  reply_by?: string;
  is_pinned: boolean;
  is_approved: boolean;
  created_at: string;
}

export const AdminMessages: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<'all' | 'pending' | 'approved' | 'pinned'>('pending');
  const toast = useToast();
  const { fullName } = useAuth();

  // Reply inline editing state
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replySign, setReplySign] = useState('');

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch messages');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleToggleApproval = async (id: string, currentVal: boolean) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_approved: !currentVal })
        .eq('id', id);

      if (error) throw error;

      setMessages(prev => prev.map(m => m.id === id ? { ...m, is_approved: !currentVal } : m));
      toast.success(currentVal ? 'Message hidden / unapproved' : 'Message approved & public!');
    } catch (err: any) {
      toast.error(err.message || 'Action failed');
    }
  };

  const handleTogglePin = async (id: string, currentVal: boolean) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_pinned: !currentVal })
        .eq('id', id);

      if (error) throw error;

      setMessages(prev => prev.map(m => m.id === id ? { ...m, is_pinned: !currentVal } : m));
      toast.success(currentVal ? 'Message unpinned' : 'Message pinned to top!');
    } catch (err: any) {
      toast.error(err.message || 'Action failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this student post?')) return;

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMessages(prev => prev.filter(m => m.id !== id));
      toast.success('Message deleted successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete message');
    }
  };

  const handleReplySubmit = async (id: string) => {
    if (!replyText.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({
          reply: replyText.trim(),
          reply_by: replySign.trim() || fullName || 'Student Council',
          is_approved: true // Auto-approve on reply
        })
        .eq('id', id);

      if (error) throw error;

      setMessages(prev => prev.map(m => m.id === id ? { 
        ...m, 
        reply: replyText.trim(), 
        reply_by: replySign.trim() || fullName || 'Student Council',
        is_approved: true 
      } : m));
      
      toast.success('Reply saved and message published!');
      setActiveReplyId(null);
      setReplyText('');
      setReplySign('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save reply');
    }
  };

  const startReply = (msg: Message) => {
    setActiveReplyId(msg.id);
    setReplyText(msg.reply || '');
    setReplySign(msg.reply_by || fullName || '');
  };

  // Filtering messages
  const filteredMessages = messages.filter(m => {
    if (filterMode === 'pending') return !m.is_approved;
    if (filterMode === 'approved') return m.is_approved;
    if (filterMode === 'pinned') return m.is_pinned;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Overview statistics bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending Moderation', count: messages.filter(m => !m.is_approved).length, bg: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' },
          { label: 'Approved Live', count: messages.filter(m => m.is_approved).length, bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' },
          { label: 'Pinned Posts', count: messages.filter(m => m.is_pinned).length, bg: 'bg-blue-500/10 border-blue-500/20 text-blue-500' },
          { label: 'Total Messages', count: messages.length, bg: 'bg-slate-500/10 border-slate-500/20 text-white/70' }
        ].map(stat => (
          <div key={stat.label} className={`border p-4 rounded-2xl flex flex-col justify-between ${stat.bg}`}>
            <span className="text-[10px] uppercase font-bold tracking-wider">{stat.label}</span>
            <span className="text-2xl font-extrabold mt-1">{stat.count}</span>
          </div>
        ))}
      </div>

      {/* Action panel & Filters bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-navy-dark p-4 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm">
        <div className="flex gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'pending', label: 'Pending Moderation' },
            { id: 'approved', label: 'Approved Live' },
            { id: 'pinned', label: 'Pinned to Top' },
            { id: 'all', label: 'Show All' }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setFilterMode(btn.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filterMode === btn.id
                  ? 'bg-orange-burnt text-white shadow-md'
                  : 'text-gray-600 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <button 
          onClick={fetchMessages} 
          className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 hover:border-orange-burnt/30 text-xs font-bold text-gray-700 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Main Moderation Cards Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-2 border-orange-burnt border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-navy-dark border border-gray-200 dark:border-white/5 rounded-3xl">
          <MessageSquare className="w-12 h-12 text-gray-300 dark:text-white/10 mx-auto mb-3" />
          <h3 className="font-bold text-gray-800 dark:text-white text-base">No message posts found</h3>
          <p className="text-xs text-gray-400 dark:text-white/40 mt-1">There are no records matching the selected filter state.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMessages.map((msg) => (
            <div 
              key={msg.id} 
              className={`bg-white dark:bg-[#0c1227] border rounded-2xl p-5 transition-all relative ${
                msg.is_pinned 
                  ? 'border-gold-accent/40 dark:border-gold-accent/30' 
                  : 'border-gray-200 dark:border-white/5'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-white/5 pb-3 mb-3">
                {/* Author Info */}
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-orange-burnt/10 dark:bg-orange-burnt/5 flex items-center justify-center text-orange-burnt">
                    <MessageSquare className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-gray-800 dark:text-white text-sm">{msg.author_name}</span>
                      {msg.author_email && (
                        <span className="text-[10px] text-gray-400 dark:text-white/35 font-mono">{msg.author_email}</span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 dark:text-white/45">
                      📅 {new Date(msg.created_at).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Moderation Controls Actions */}
                <div className="flex flex-wrap gap-2">
                  {/* Pinned action */}
                  <button
                    onClick={() => handleTogglePin(msg.id, msg.is_pinned)}
                    className={`p-2 rounded-xl border flex items-center justify-center transition-colors ${
                      msg.is_pinned
                        ? 'bg-gold-accent/15 border-gold-accent/30 text-gold-accent'
                        : 'border-gray-200 dark:border-white/10 hover:border-gold-accent/30 text-gray-400 hover:text-gold-accent'
                    }`}
                    title={msg.is_pinned ? 'Unpin message' : 'Pin message to top'}
                  >
                    <Pin className={`w-4 h-4 ${msg.is_pinned ? 'fill-gold-accent' : ''}`} />
                  </button>

                  {/* Approved action */}
                  <button
                    onClick={() => handleToggleApproval(msg.id, msg.is_approved)}
                    className={`p-2 rounded-xl border flex items-center justify-center transition-colors ${
                      msg.is_approved
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                        : 'border-gray-200 dark:border-white/10 hover:border-emerald-500/30 text-gray-400 hover:text-emerald-500'
                    }`}
                    title={msg.is_approved ? 'Hide message' : 'Approve message'}
                  >
                    {msg.is_approved ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </button>

                  {/* Reply button */}
                  <button
                    onClick={() => startReply(msg)}
                    className="p-2 rounded-xl border border-gray-200 dark:border-white/10 hover:border-orange-burnt/30 text-gray-500 hover:text-orange-burnt transition-colors"
                    title="Write/edit reply"
                  >
                    <CornerDownRight className="w-4 h-4" />
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="p-2 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-red-500/5 hover:border-red-500/30 text-gray-400 hover:text-red-500 transition-all"
                    title="Delete message permanently"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Student Question message */}
              <p className="text-sm text-gray-700 dark:text-white/80 leading-relaxed font-sans mt-3 pl-1 whitespace-pre-wrap">
                {msg.content}
              </p>

              {/* Current Reply Display */}
              {msg.reply && activeReplyId !== msg.id && (
                <div className="bg-[#f3f6ff] dark:bg-[#121e3d] border border-orange-burnt/20 p-4 rounded-xl mt-4 flex items-start space-x-3.5">
                  <ShieldCheck className="w-5 h-5 text-orange-burnt shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[10px] font-bold text-orange-burnt uppercase tracking-wider">Replied by {msg.reply_by || 'Council'}</span>
                    <p className="text-xs text-gray-600 dark:text-white/70 font-sans mt-0.5 leading-relaxed whitespace-pre-wrap">{msg.reply}</p>
                  </div>
                </div>
              )}

              {/* Reply Edit Interface */}
              {activeReplyId === msg.id && (
                <div className="bg-orange-burnt/5 border border-orange-burnt/20 p-4 rounded-xl mt-4 space-y-4">
                  <div>
                    <span className="block text-[10px] font-bold text-orange-burnt uppercase tracking-wider mb-1">Write Council Response</span>
                    <textarea
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="Type your moderation answer/response here..."
                      className="w-full h-24 p-3 border border-orange-burnt/20 dark:border-white/5 bg-white dark:bg-[#050b18] text-xs text-gray-800 dark:text-white rounded-xl outline-none focus:border-orange-burnt transition-colors resize-none"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <input
                      type="text"
                      value={replySign}
                      onChange={e => setReplySign(e.target.value)}
                      placeholder="Sign signature (e.g. Student President)"
                      className="w-full sm:w-64 p-2 border border-gray-200 dark:border-white/10 bg-white dark:bg-[#050b18] text-xs text-gray-800 dark:text-white rounded-lg outline-none focus:border-orange-burnt transition-colors"
                    />

                    <div className="flex space-x-2 w-full sm:w-auto">
                      <button
                        onClick={() => setActiveReplyId(null)}
                        className="flex-1 sm:flex-none px-4 py-2 border border-gray-200 dark:border-white/10 hover:bg-white/10 text-xs font-bold text-gray-600 dark:text-white/60 rounded-xl"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleReplySubmit(msg.id)}
                        className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-5 py-2 bg-orange-burnt text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:opacity-90 shadow-md shadow-orange-burnt/10"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Reply</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default AdminMessages;
