import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const ReactSwal = withReactContent(Swal);

const extractYoutubeVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
};
export default function LinkContainer({ youtubeLink: [youtubeLink, setYoutubeLink] }: any) {
    const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);

    useEffect(() => {
        if (youtubeLink.trim().length === 0) setYoutubeVideoId(null)
    }, [youtubeLink])

    const handleYoutubeLinkSubmit = () => {
        if (!youtubeLink) {
            ReactSwal.fire({
                icon: "error",
                title: "No Link Provided",
                text: "Please enter a YouTube link.",
            });
            return;
        }

        const videoId = extractYoutubeVideoId(youtubeLink);
        if (!videoId) {
            ReactSwal.fire({
                icon: "error",
                title: "Invalid YouTube Link",
                text: "Please enter a valid YouTube link.",
            });
            return;
        }

        setYoutubeVideoId(videoId);
    };

    return (
      <div className="youtube-link-container">
        <div className="youtube-link-input-wrapper">
          <input
            type="text"
            className="youtube-link-input"
            placeholder="Insert embedded YouTube link"
            value={youtubeLink}
            onChange={(e) => setYoutubeLink(e.target.value)}
          />
          <button className="youtube-link-submit-btn" onClick={handleYoutubeLinkSubmit}>
            Add Link
          </button>
        </div>
        {youtubeVideoId && (
          <div className="youtube-preview">
            <iframe
              width="100%"
              height="315"
              src={`https://www.youtube.com/embed/${youtubeVideoId}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        )}
      </div>
    )
  }