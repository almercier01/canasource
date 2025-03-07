import React, { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Language } from '../types';

interface CommentSectionProps {
  businessId: string;
  language: Language;
  onCommentAdded: () => void;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_email: string;
}

export function CommentSection({ businessId, language, onCommentAdded }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
    fetchComments();
  }, [businessId]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('business_comments_with_users')
        .select('id, content, created_at, user_email')
        .eq('business_id', businessId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError(language === 'en' ? 'Please sign in to comment' : 'Veuillez vous connecter pour commenter');
      return;
    }

    if (!newComment.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('business_comments')
        .insert([
          {
            business_id: businessId,
            user_id: user.id,
            content: newComment.trim()
          }
        ]);

      if (error) throw error;

      setNewComment('');
      fetchComments();
      onCommentAdded();
    } catch (err) {
      setError(language === 'en' ? 'Error posting comment' : 'Erreur lors de la publication du commentaire');
      console.error('Error posting comment:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={language === 'en' ? 'Write a comment...' : 'Écrire un commentaire...'}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
          rows={3}
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !newComment.trim()}
            className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            <Send className="h-4 w-4 mr-2" />
            {loading ? (
              language === 'en' ? 'Posting...' : 'Publication...'
            ) : (
              language === 'en' ? 'Post Comment' : 'Publier'
            )}
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <p className="text-sm text-gray-600">
                {comment.user_email || 'Anonymous'}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(comment.created_at).toLocaleDateString()}
              </p>
            </div>
            <p className="mt-2 text-gray-700">{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}