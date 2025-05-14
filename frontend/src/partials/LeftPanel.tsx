import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Upload,
  Settings,
  FileText,
  HelpCircle
} from "lucide-react";


type SavedNote = {
  postID: string;
  title: string;
};

const SavedNoteItem = ({ note }: { note: SavedNote }) => {
  return (
    <div className="saved-note-item">
      <Link to={`/post/${note.postID}`} className="saved-note-link">
        {note.title}
      </Link>
    </div>
  );
};

const LeftPanel = () => {
  const location = useLocation();
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>([]);

  useEffect(() => {
    const dummyNotes = [
      { postID: "1", title: "Introduction to React Hooks" },
      { postID: "2", title: "Advanced TypeScript Patterns" },
      { postID: "3", title: "CSS Grid vs Flexbox" }
    ];
    setSavedNotes(dummyNotes);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { name: "Home", icon: <Home className="nav-item-icon" />, path: "/" },
    { name: "Videos", icon: <FileText className="nav-item-icon" />, path: "/videos" },
    { name: "Tests", icon: <FileText className="nav-item-icon" />, path: "/tests" },
    { name: "Resources", icon: <FileText className="nav-item-icon" />, path: "/resources" }
  ];

  const utilityItems = [
    { name: "Upload", icon: <Upload className="nav-item-icon" />, path: "/upload" },
    { name: "My space", icon: <FileText className="nav-item-icon" />, path: "/my-space" }
  ];

  const bottomItems = [
    { name: "Settings", icon: <Settings className="nav-item-icon" />, path: "/settings" },
    { name: "Blog", icon: <FileText className="nav-item-icon" />, path: "/blog" },
    { name: "Help & Support", icon: <HelpCircle className="nav-item-icon" />, path: "/help" }
  ];

  return (
    <aside className="left-panel">
      <div className="left-panel-header">
        <div className="logo-box">NR</div>
        <h1>NoteRoom</h1>
      </div>

      <nav className="left-panel-nav">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`nav-item ${isActive(item.path) ? "active" : ""}`}
          >
            {item.icon}
            <span className="nav-item-text">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="left-panel-utility">
        {utilityItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`nav-item ${isActive(item.path) ? "active" : ""}`}
          >
            {item.icon}
            <span className="nav-item-text">{item.name}</span>
          </Link>
        ))}
      </div>

      <div className="left-panel-communities">
        <h2>Communities</h2>
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      <div className="left-panel-bottom">
        {bottomItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`nav-item ${isActive(item.path) ? "active" : ""}`}
          >
            {item.icon}
            <span className="nav-item-text">{item.name}</span>
          </Link>
        ))}
      </div>

      <div className="left-panel-saved">
        <h2>Saved Notes</h2>
        <div>
          {savedNotes.length > 0 ? (
            savedNotes.map((note) => (
              <SavedNoteItem key={note.postID} note={note} />
            ))
          ) : (
            <div className="empty-saved-msg">
              It looks like you haven't saved any notes yet. Start saving them to read later.
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default LeftPanel;
