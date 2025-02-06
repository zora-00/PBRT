import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { Clock, Copy } from 'lucide-react';

interface Paste {
  id: string;
  title: string;
  content: string;
  created_at: string;
  expiration: string | null;
  is_rich_text: boolean;
}

export default function ViewPaste() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paste, setPaste] = useState<Paste | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPaste = async () => {
      const { data, error } = await supabase
        .from('pastes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching paste:', error);
        navigate('/');
        return;
      }

      setPaste(data);
    };

    fetchPaste();
  }, [id, navigate]);

  const copyToClipboard = async () => {
    if (!paste) return;

    try {
      await navigator.clipboard.writeText(paste.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!paste) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {paste.title || 'Untitled Paste'}
            </h1>
            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
              <span>Created {formatDistanceToNow(new Date(paste.created_at))} ago</span>
              {paste.expiration && (
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Expires {formatDistanceToNow(new Date(paste.expiration))}
                </span>
              )}
              {paste.is_rich_text && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                  Rich Text
                </span>
              )}
            </div>
          </div>
          <button
            onClick={copyToClipboard}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Copy className="h-4 w-4 mr-2" />
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <div className="mt-4">
          {paste.is_rich_text ? (
            <div
              className="prose max-w-none p-4 border rounded-lg bg-gray-50"
              dangerouslySetInnerHTML={{ __html: paste.content }}
            />
          ) : (
            <pre className="p-4 bg-gray-50 rounded-lg overflow-x-auto">
              <code>{paste.content}</code>
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}