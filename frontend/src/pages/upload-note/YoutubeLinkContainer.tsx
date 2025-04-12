import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const ReactSwal = withReactContent(Swal);

const extractYoutubeVideoId = (url: string): string | null => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  return url.match(regex)?.[1] || null;
};

export default function LinkContainer({ youtubeLink: [youtubeLink, setYoutubeLink], youtubeLinks: [youtubeLinks, setYoutubeLinks] }: any) {
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);
  const [videoList, setVideoList] = useState<string[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  useEffect(() => {
    if (youtubeLink.trim().length === 0) {
      if (videoList.length === 0) {
        setYoutubeVideoId(null);
      }
    } else {
      const videoId = extractYoutubeVideoId(youtubeLink);
      setYoutubeVideoId(videoId);
    }
  }, [youtubeLink, videoList]);

  const handleAddVideo = () => {
    if (youtubeVideoId && !videoList.includes(youtubeVideoId)) {
      const updatedList = [...videoList, youtubeVideoId];
      setVideoList(updatedList);
      setYoutubeLinks((prev: string) => [...prev, youtubeLink])
      setCurrentVideoIndex(updatedList.length - 1);
      setYoutubeLink(""); 
      ReactSwal.fire({
        icon: "success",
        title: "Video Added!",
        text: "This video has been saved to your list.",
      });
    } else if (videoList.includes(youtubeVideoId!)) {
      ReactSwal.fire({
        icon: "error",
        title: "Already Exists",
        text: "This video is already in your list.",
      });
    }
  };

  const handleDeleteAll = () => {
    setYoutubeLink(""); 
    setYoutubeVideoId(null); 
    setVideoList([]); 
    setCurrentVideoIndex(0); 
    setVideoList([])
    ReactSwal.fire({
      icon: "success",
      title: "Cleared!",
      text: "All videos have been removed.",
    });
  };

  const handleCarouselPrev = () => {
    if (currentVideoIndex > 0) {
      const prevIndex = currentVideoIndex - 1;
      setCurrentVideoIndex(prevIndex);
      setYoutubeVideoId(videoList[prevIndex]);
      setYoutubeLink(`https://www.youtube.com/watch?v=${videoList[prevIndex]}`);
    }
  };

  const handleCarouselNext = () => {
    if (currentVideoIndex < videoList.length - 1) {
      const nextIndex = currentVideoIndex + 1;
      setCurrentVideoIndex(nextIndex);
      setYoutubeVideoId(videoList[nextIndex]);
      setYoutubeLink(`https://www.youtube.com/watch?v=${videoList[nextIndex]}`);
    }
  };

  return (
    <div className="youtube-link-container">
      {/* youtube link input */}
      <div className="youtube-link-input-wrapper">
        <input
          type="text"
          className="youtube-link-input"
          placeholder="Enter YouTube Link"
          value={youtubeLink}
          onChange={(e) => setYoutubeLink(e.target.value)}
        />
      </div>

      {/* video preview */}
      {youtubeVideoId && (
        <div className="youtube-preview-container">
          <div className="video-controls-top">
            <button className="add-btn" onClick={handleAddVideo}>
            <svg width="75" height="36" viewBox="0 0 75 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="75" height="36" rx="7.31429" fill="#F2F4F7"/>
                <path d="M19.0002 10.582V23.4154M12.5835 16.9987H25.4168" stroke="#303030" strokeWidth="1.76" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M37.7131 22.9023H36.3013L39.4736 14.0872H41.0102L44.1824 22.9023H42.7706L40.2785 15.6884H40.2096L37.7131 22.9023ZM37.9498 19.4503H42.5296V20.5694H37.9498V19.4503ZM46.9933 23.0315C46.4596 23.0315 45.9832 22.8952 45.5643 22.6226C45.1482 22.3471 44.8211 21.9554 44.5829 21.4475C44.3476 20.9367 44.2299 20.3241 44.2299 19.6096C44.2299 18.8951 44.349 18.2839 44.5872 17.776C44.8282 17.268 45.1582 16.8792 45.5772 16.6095C45.9961 16.3398 46.471 16.2049 47.0019 16.2049C47.4122 16.2049 47.7422 16.2738 47.9919 16.4115C48.2444 16.5464 48.4395 16.7042 48.5773 16.885C48.7179 17.0657 48.8269 17.225 48.9044 17.3627H48.9819V14.0872H50.2688V22.9023H49.012V21.8736H48.9044C48.8269 22.0142 48.715 22.1749 48.5687 22.3557C48.4252 22.5365 48.2272 22.6943 47.9747 22.8292C47.7221 22.964 47.395 23.0315 46.9933 23.0315ZM47.2774 21.9339C47.6475 21.9339 47.9603 21.8363 48.2157 21.6412C48.474 21.4432 48.6691 21.1692 48.8011 20.8191C48.936 20.469 49.0034 20.0615 49.0034 19.5967C49.0034 19.1375 48.9374 18.7358 48.8054 18.3915C48.6734 18.0471 48.4797 17.7788 48.2243 17.5866C47.9689 17.3943 47.6533 17.2982 47.2774 17.2982C46.89 17.2982 46.5672 17.3986 46.3089 17.5995C46.0507 17.8003 45.8555 18.0744 45.7235 18.4216C45.5944 18.7688 45.5298 19.1605 45.5298 19.5967C45.5298 20.0386 45.5958 20.436 45.7278 20.7889C45.8598 21.1419 46.055 21.4217 46.3132 21.6283C46.5743 21.832 46.8957 21.9339 47.2774 21.9339ZM53.8534 23.0315C53.3197 23.0315 52.8433 22.8952 52.4244 22.6226C52.0083 22.3471 51.6812 21.9554 51.443 21.4475C51.2077 20.9367 51.0901 20.3241 51.0901 19.6096C51.0901 18.8951 51.2091 18.2839 51.4473 17.776C51.6884 17.268 52.0183 16.8792 52.4373 16.6095C52.8562 16.3398 53.3312 16.2049 53.862 16.2049C54.2724 16.2049 54.6023 16.2738 54.852 16.4115C55.1045 16.5464 55.2996 16.7042 55.4374 16.885C55.578 17.0657 55.687 17.225 55.7645 17.3627H55.842V14.0872H57.129V22.9023H55.8721V21.8736H55.7645C55.687 22.0142 55.5751 22.1749 55.4288 22.3557C55.2853 22.5365 55.0873 22.6943 54.8348 22.8292C54.5823 22.964 54.2551 23.0315 53.8534 23.0315ZM54.1375 21.9339C54.5077 21.9339 54.8204 21.8363 55.0758 21.6412C55.3341 21.4432 55.5292 21.1692 55.6612 20.8191C55.7961 20.469 55.8635 20.0615 55.8635 19.5967C55.8635 19.1375 55.7975 18.7358 55.6655 18.3915C55.5335 18.0471 55.3398 17.7788 55.0844 17.5866C54.829 17.3943 54.5134 17.2982 54.1375 17.2982C53.7501 17.2982 53.4273 17.3986 53.169 17.5995C52.9108 17.8003 52.7156 18.0744 52.5836 18.4216C52.4545 18.7688 52.3899 19.1605 52.3899 19.5967C52.3899 20.0386 52.4559 20.436 52.5879 20.7889C52.7199 21.1419 52.9151 21.4217 53.1733 21.6283C53.4345 21.832 53.7558 21.9339 54.1375 21.9339Z" fill="#303030"/>
             </svg>
            </button>
            <button className="delete-btn" onClick={handleDeleteAll}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <path d="M19.5 5.5L18.8803 15.5251C18.7219 18.0864 18.6428 19.3671 18.0008 20.2879C17.6833 20.7431 17.2747 21.1273 16.8007 21.416C15.8421 22 14.559 22 11.9927 22C9.42312 22 8.1383 22 7.17905 21.4149C6.7048 21.1257 6.296 20.7408 5.97868 20.2848C5.33688 19.3626 5.25945 18.0801 5.10461 15.5152L4.5 5.5" stroke="#FF0000" strokeWidth="1.72881" strokeLinecap="round"/>
                 <path d="M3 5.5H21M16.0557 5.5L15.3731 4.09173C14.9196 3.15626 14.6928 2.68852 14.3017 2.39681C14.215 2.3321 14.1231 2.27454 14.027 2.2247C13.5939 2 13.0741 2 12.0345 2C10.9688 2 10.436 2 9.99568 2.23412C9.8981 2.28601 9.80498 2.3459 9.71729 2.41317C9.32164 2.7167 9.10063 3.20155 8.65861 4.17126L8.05292 5.5" stroke="#FF0000" strokeWidth="1.72881" strokeLinecap="round"/>
               <path d="M9.50244 16.5V10.5" stroke="#FF0000" strokeWidth="1.72881" strokeLinecap="round"/>
                 <path d="M14.4976 16.5V10.5" stroke="#FF0000" strokeWidth="1.72881" strokeLinecap="round"/>
               </svg>
            </button>
          </div>

          <div className="video-wrapper">
            {videoList.length > 1 && (
              <button className="carousel-btn-link left" onClick={handleCarouselPrev}>
                 <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
               <rect x="30" y="30" width="30" height="30" rx="15" transform="rotate(180 30 30)" fill="#E2E5E9"/>
                <path d="M17.25 10.5L12.75 15L17.25 19.5" stroke="#1E1E1E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            )}
            
            <div className="youtube-preview">
              <iframe
                width="100%"
                height="400"
                src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>

            {videoList.length > 1 && (
              <button className="carousel-btn-link right" onClick={handleCarouselNext}>
                
 <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <path d="M0 15C0 6.71573 6.71573 0 15 0C23.2843 0 30 6.71573 30 15C30 23.2843 23.2843 30 15 30C6.71573 30 0 23.2843 0 15Z" fill="#E2E5E9"/>
                  <path d="M12.75 19.5L17.25 15L12.75 10.5" stroke="#1E1E1E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}