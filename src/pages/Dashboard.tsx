import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { Clock, File, Trash2 } from 'lucide-react';

interface Paste {
  id: string;
  title: string;
  created_at: string;
  expiration: string | null;
  is_rich_text: boolean;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [pastes, setPastes] = useState<Paste[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchPastes = async () => {
      const { data, error } = await supabase
        .from('pastes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pastes:', error);
        return;
      }

      setPastes(data);
    };

    fetchPastes();
  }, [user]);

  const deletePaste = async (id: string) => {
    const { error } = await supabase
      .from('pastes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting paste:', error);
      return;
    }

    setPastes(pastes.filter(paste => paste.id !== id));
  };

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Pastes</h1>

        <div className="space-y-4">
          {pastes.map((paste) => (
            <div
              key={paste.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <File className="h-5 w-5 text-gray-400" />
                <div>
                  <Link
                    to={`/paste/${paste.id}`}
                    className="text-lg font-medium text-gray-900 hover:text-indigo-600"
                  >
                    {paste.title || 'Untitled Paste'}
                  </Link>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>
                      Created {formatDistanceToNow(new Date(paste.created_at))} ago
                    </span>
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
              </div>
              <button
                onClick={() => deletePaste(paste.id)}
                className="text-gray-400 hover:text-red-600"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}

          {pastes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">You haven't created any pastes yet.</p>
              <Link
                to="/"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create your first paste
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}