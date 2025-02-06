import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '../components/Editor';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Clock, Type } from 'lucide-react';

const EXPIRATION_OPTIONS = [
  { value: 1, label: '1 hour', hours: 1 },
  { value: 12, label: '12 hours', hours: 12 },
  { value: 24, label: '1 day', hours: 24 },
  { value: 120, label: '5 days', hours: 120 },
  { value: 240, label: '10 days', hours: 240 },
  { value: 2400, label: '100 days', hours: 2400 },
  { value: 0, label: 'Forever', hours: 0 },
];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isRichText, setIsRichText] = useState(false);
  const [expiration, setExpiration] = useState(EXPIRATION_OPTIONS[0].value);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const expirationHours = EXPIRATION_OPTIONS.find(opt => opt.value === expiration)?.hours || 0;
    const expirationDate = expirationHours
      ? new Date(Date.now() + expirationHours * 60 * 60 * 1000)
      : null;

    const { data, error } = await supabase
      .from('pastes')
      .insert({
        title,
        content,
        is_rich_text: isRichText,
        user_id: user?.id,
        expiration: expirationDate,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating paste:', error);
      return;
    }

    navigate(`/paste/${data.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Paste</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title (optional)
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Type className="h-5 w-5 text-gray-400" />
              <label className="ml-2 text-sm text-gray-700">Rich Text</label>
              <input
                type="checkbox"
                checked={isRichText}
                onChange={(e) => setIsRichText(e.target.checked)}
                className="ml-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center">
              <Clock className="h-5 w-5 text-gray-400" />
              <select
                value={expiration}
                onChange={(e) => setExpiration(Number(e.target.value))}
                className="ml-2 block rounded-md border-gray-300 py-1.5 pl-3 pr-10 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              >
                {EXPIRATION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Editor
            content={content}
            onChange={setContent}
            isRichText={isRichText}
          />

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Create Paste
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}