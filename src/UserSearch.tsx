import { useMemo, useState } from 'react';
import type { UserGraphData } from './types';

interface UserSearchProps {
  users: UserGraphData[];
  onSelect: (user: UserGraphData) => void;
}

export default function UserSearch({ users, onSelect }: UserSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return users.filter((u) => u.username.toLowerCase().includes(q));
  }, [query, users]);

  const handleSelect = (user: UserGraphData) => {
    onSelect(user);
    setQuery(user.username);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full max-w-md">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        placeholder="Search username..."
        className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-gray-100 placeholder-gray-500 outline-none focus:border-purple-500"
      />
      {isOpen && query.trim() && (
        <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-gray-700 bg-gray-900 shadow-lg">
          {matches.length === 0 ? (
            <li className="px-4 py-2 text-sm text-gray-500">No matching users</li>
          ) : (
            matches.map((user) => (
              <li key={user.userId}>
                <button
                  type="button"
                  onMouseDown={() => handleSelect(user)}
                  className="block w-full px-4 py-2 text-left text-gray-200 hover:bg-gray-800"
                >
                  {user.username}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
