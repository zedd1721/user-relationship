import { useId, useMemo, useState } from 'react';
import type { UserGraphData } from './types';

interface UserSearchProps {
  users: UserGraphData[];
  onSelect: (user: UserGraphData) => void;
}

export default function UserSearch({ users, onSelect }: UserSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listboxId = useId();

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return users.filter((u) => u.username.toLowerCase().includes(q));
  }, [query, users]);

  const handleSelect = (user: UserGraphData) => {
    onSelect(user);
    setQuery(user.username);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || matches.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % matches.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev <= 0 ? matches.length - 1 : prev - 1));
        break;
      case 'Enter':
        if (activeIndex >= 0 && activeIndex < matches.length) {
          e.preventDefault();
          handleSelect(matches[activeIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  };

  const isExpanded = isOpen && matches.length > 0;

  return (
    <div className="relative w-full max-w-md">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        onKeyDown={handleKeyDown}
        placeholder="Search username..."
        role="combobox"
        aria-label="Search username"
        aria-autocomplete="list"
        aria-expanded={isExpanded}
        aria-controls={listboxId}
        aria-activedescendant={activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
        className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-gray-100 placeholder-gray-500 outline-none focus:border-purple-500"
      />
      {isOpen && query.trim() && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Matching users"
          className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-gray-700 bg-gray-900 shadow-lg"
        >
          {matches.length === 0 ? (
            <li className="px-4 py-2 text-sm text-gray-500">No matching users</li>
          ) : (
            matches.map((user, index) => (
              <li key={user.userId} id={`${listboxId}-option-${index}`} role="option" aria-selected={index === activeIndex}>
                <button
                  type="button"
                  onMouseDown={() => handleSelect(user)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`block w-full px-4 py-2 text-left text-gray-200 ${
                    index === activeIndex ? 'bg-gray-800' : 'hover:bg-gray-800'
                  }`}
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
