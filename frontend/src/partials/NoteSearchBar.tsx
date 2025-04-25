import { useEffect, useRef, useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { Link, useNavigate } from 'react-router-dom';
import { NotificationType } from "../../../types/notification.types"
import AvatarImage from "../assets/avatars/avatar-1.png"

let API_SERVER_URL = import.meta.env.VITE_API_SERVER_URL

interface Post {
  postID: string;
  title: string;
}
export default function NoteSearchBar({ notiModalState }: { notiModalState: [any, any] }) {
  const { notification: [notifs,], userProfile: [, , currentUsername] } = useAppData()!
  const [unreadNotiCount, setUnreadNotiCount] = useState<number>(0)
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debounceQuery, setDebounceQuery] = useState<string>("")
  const navigate = useNavigate()
  const { userProfile: [profile] } = useAppData()!

  function handleClick() {
    setIsSearchFocused(true)
  }

  useEffect(() => {
    window.addEventListener("click", event => {
      const noHide = (event.target as Element).classList.contains("no-hide")
      setIsSearchFocused(noHide)
    })
  }, [])

  useEffect(() => {
    const unreadNoti = notifs.filter((noti: NotificationType) => noti.isRead === false)
    setUnreadNotiCount(unreadNoti.length)
  }, [notifs])

  useEffect(() => {
    async function handleSearch() {
      if (debounceQuery.length === 0) return

      const response = await fetch(`${API_SERVER_URL}/api/search?q=${debounceQuery}&type=posts&countDoc=false`, {
        credentials: "include"
      })
      if (response.ok) {
        setIsLoading(false)
        const data = await response.json()
        if (data.ok) {
          setResults(data.posts)
        }
      }
    }
    handleSearch()

  }, [debounceQuery])

  useEffect(() => {
    if (results.length !== 0) {
      setResults([])
    }
    setIsLoading(query.length !== 0)
    const handler = setTimeout(() => {
      setDebounceQuery(query)
    }, 1500)

    return () => clearTimeout(handler)
  }, [query])

  return (
    <div className="search-container">
      <div className="search-bar-container">
        <div className="search-input-wrapper no-hide">
          <input
            type="text"
            className="search-input no-hide"
            placeholder="Search Notes"
            aria-label="Search Notes"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
            onFocus={handleClick}
          />
          <button className="search-button no-hide" aria-label="Search">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 30 30"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className='no-hide'
            >
              <path d="M 13 3 C 7.4889971 3 3 7.4889971 3 13 C 3 18.511003 7.4889971 23 13 23 C 15.396508 23 17.597385 22.148986 19.322266 20.736328 L 25.292969 26.707031 A 1.0001 1.0001 0 1 0 26.707031 25.292969 L 20.736328 19.322266 C 22.148986 17.597385 23 15.396508 23 13 C 23 7.4889971 18.511003 3 13 3 z M 13 5 C 17.430123 5 21 8.5698774 21 13 C 21 17.430123 17.430123 21 13 21 C 8.5698774 21 5 17.430123 5 13 C 5 8.5698774 8.5698774 5 13 5 z" />
            </svg>
          </button>
        </div>
        <div className="notification-wrapper">
          <svg
            className="notification-button"
            onClick={() => notiModalState[1](!notiModalState[0])}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {unreadNotiCount > 0 ? <span className="notification-badge" id="notification-count">
            {unreadNotiCount}
          </span> : null}
        </div>
        <img src={profile?.profile_pic || AvatarImage} className="profile-avatar" alt="Profile" onClick={() => navigate(`/user/${currentUsername}`)} />
      </div>
      <div className={`search-results-container ${isSearchFocused ? 'visible' : ''} no-hide`} >
        <div className="search-results-list no-hide">
          {isLoading ? (
            <div className="search-status no-hide" style={{ display: 'flex' }}>
              <div className="search-loading-indicator no-hide"></div>
            </div>
          ) : results.length === 0 ? (
            <div className="no-results-message no-hide">
              No results
            </div>
          ) : (
            results.map((post) => (
              <Link to={`/post/${post.postID}`}>
                <div className="search-result-item" key={post.postID}>
                  {post.title}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}