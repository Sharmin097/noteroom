import { useEffect, useState } from "react";
import { useGlobalComponentController } from "../../context/globaldata.context";

const API = import.meta.env.VITE_YOUTUBE_API_KEY

const extractYoutubeVideoId = (url: string): string | null => {
	const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
	return url.match(regex)?.[1] || null;
};

function SavedVideo({ video, isMobile, controller: [showVideo, deleteVideo] }) {
	return (
		<div
			style={{
				display: "flex",
				flexDirection: isMobile ? "column" : "row",
				alignItems: isMobile ? "flex-start" : "center",
				padding: "12px",
				border: "1px solid #ddd",
				borderRadius: "8px",
				width: "100%",
				maxWidth: "600px",
				margin: "5px auto",
				boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
				background: "#fff",
				gap: "12px"
			}}
		>
			<div style={{
				width: isMobile ? "100%" : "160px",
				aspectRatio: "16/9",
				overflow: "hidden",
				borderRadius: "6px",
				flexShrink: 0
			}}
			>
				<img
					src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
					alt="YouTube thumbnail"
					style={{
						width: "100%",
						height: "100%",
						objectFit: "cover",
						borderRadius: "6px"
					}}
				/>
			</div>

			<div style={{
				flex: 1,
				width: "100%",
				display: "flex",
				flexDirection: "column",
				gap: "8px"
			}}
			>
				<div style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: isMobile ? "flex-start" : "center",
					gap: "12px"
				}}
				>
					<div style={{
						fontSize: "16px",
						fontWeight: "500",
						color: "#333",
						lineHeight: "1.4",
						flex: 1,
						wordBreak: "break-word"
					}}
					>
						{video.details.title}
					</div>

					<div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
						<button className="edit-btn" onClick={() => showVideo(video.id)}>
							<svg viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg" fill="none" width="20" height="20">
								<path d="M104.175 90.97 L99.923 129.354 L138.306 125.102 L247.923 15.427 V2.497 L226.78 -18.646 H213.85 Z M312.339 -6.313 L344.01 25.357" transform="translate(-77.923 40.646)" style={{ fill: "none", stroke: "#000", strokeWidth: 12, strokeLinecap: "round", strokeLinejoin: "round" }} />
								<path d="M195.656 33.271 L142.774 86.153" transform="translate(-77.923 40.646)" style={{ fill: "none", stroke: "#000", strokeWidth: 12, strokeLinecap: "round", strokeLinejoin: "round" }} />
							</svg>
						</button>

						<button className="delete-btn" onClick={() => deleteVideo(video.id)}>
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M19.5 5.5L18.8803 15.5251C18.7219 18.0864 18.6428 19.3671 18.0008 20.2879C17.6833 20.7431 17.2747 21.1273 16.8007 21.416C15.8421 22 14.559 22 11.9927 22C9.42312 22 8.1383 22 7.17905 21.4149C6.7048 21.1257 6.296 20.7408 5.97868 20.2848C5.33688 19.3626 5.25945 18.0801 5.10461 15.5152L4.5 5.5" stroke="#FF0000" strokeWidth="1.72881" strokeLinecap="round" />
								<path d="M3 5.5H21M16.0557 5.5L15.3731 4.09173C14.9196 3.15626 14.6928 2.68852 14.3017 2.39681C14.215 2.3321 14.1231 2.27454 14.027 2.2247C13.5939 2 13.0741 2 12.0345 2C10.9688 2 10.436 2 9.99568 2.23412C9.8981 2.28601 9.80498 2.3459 9.71729 2.41317C9.32164 2.7167 9.10063 3.20155 8.65861 4.17126L8.05292 5.5" stroke="#FF0000" strokeWidth="1.72881" strokeLinecap="round" />
								<path d="M9.50244 16.5V10.5" stroke="#FF0000" strokeWidth="1.72881" strokeLinecap="round" />
								<path d="M14.4976 16.5V10.5" stroke="#FF0000" strokeWidth="1.72881" strokeLinecap="round" />
							</svg>
						</button>
					</div>
				</div>

				<div style={{ fontSize: "13px", color: "#666" }}>Uploaded by <b>{video.details.channelTitle}</b></div>
			</div>
		</div>
	)
}

export default function LinkContainer({ youtubeLinks: [videoList, setVideoList] }: any) {
	const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);
	const [youtubeLink, setYoutubeLink] = useState<string>("")
	const { toast: [, setToast] } = useGlobalComponentController()!
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth <= 600);
		};

		handleResize(); // initial check
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);


	useEffect(() => {
		if (youtubeLink.trim().length !== 0) {
			const ytVideoID = extractYoutubeVideoId(youtubeLink)
			setYoutubeVideoId(ytVideoID)
		} else {
			setYoutubeVideoId(null)
		}
	}, [youtubeLink])

	async function showVideo(ytVideoID: string) {
		const video = videoList.find(video => video.id === ytVideoID)
		setYoutubeLink(video.link)
	}

	function deleteVideo(ytVideoID: string) {
		setVideoList(prev => prev.filter(video => video.id !== ytVideoID))
	}

	async function addVideo() {
		if (!(videoList as { id: string, title: string }[]).find(video => video.id === youtubeVideoId)) {
			const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${youtubeVideoId}&key=${API}`)
			if (response.ok) {
				const data = await response.json()
				const title = data.items[0]?.snippet?.title
				const channelTitle = data.items[0]?.snippet?.channelTitle
				setVideoList(prev => [...prev, { link: youtubeLink, id: youtubeVideoId, details: { title: title, channelTitle } }])
				setToast({ show: true, data: { message: "Video added" } })
				setYoutubeLink("")
			}
		} else {
			setToast({ show: true, data: { message: "Video is already added" } })
		}
	}

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				gap: "24px",
				padding: "20px",
				width: "100%",
				maxWidth: "600px",
				margin: "0 auto",
				borderRadius: "12px",
				boxSizing: "border-box",
			}}
		>
			{/* Input Field */}
			<div style={{ width: "100%" }}>
				<input
					type="text"
					placeholder="Enter YouTube Link"
					value={youtubeLink}
					onChange={(e) => setYoutubeLink(e.target.value)}
					style={{
						width: "100%",
						padding: "14px 18px",
						border: "1px solid #ccc",
						borderRadius: "10px",
						fontSize: "16px",
						outline: "none",
						boxSizing: "border-box",
						boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)",
					}}
				/>
			</div>

			{/* Preview */}
			{youtubeVideoId && (
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: "12px",
						border: "1px solid #e0e0e0",
						padding: "16px",
						borderRadius: "10px",
						backgroundColor: "#fff",
					}}
				>
					<div style={{ display: "flex", justifyContent: "flex-end" }}>
						<button
							onClick={addVideo}
							style={{
								backgroundColor: "#e2e8f0",
								padding: "10px 16px",
								borderRadius: "8px",
								border: "none",
								cursor: "pointer",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								transition: "background 0.3s",
							}}
						>
							<svg
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<rect width="24" height="24" rx="6" fill="#475569" />
								<path
									d="M12 7V17M7 12H17"
									stroke="#fff"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</button>
					</div>

					<div style={{ width: "100%", aspectRatio: "16 / 9" }}>
						<div style={{ width: "100%", height: "100%" }}>
							<iframe
								width="100%"
								height="100%"
								src={`https://www.youtube.com/embed/${youtubeVideoId}`}
								title="YouTube video player"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
								allowFullScreen
								style={{
									borderRadius: "8px",
									border: "none",
									width: "100%",
									height: "100%",
								}}
							></iframe>
						</div>
					</div>
				</div>
			)}

			{/* Videos or Empty */}
			{videoList.length === 0 ? (
				<div
					style={{
						textAlign: "center",
						color: "#777",
						fontStyle: "italic",
						fontSize: "15px",
						paddingTop: "40px",
						flexGrow: 1,
					}}
				>
					No vidos added yet. Paste links and add them to upload!
				</div>
			) : (
				videoList.map((video) => (
					<SavedVideo
						key={video.id}
						video={video}
						isMobile={isMobile}
						controller={[showVideo, deleteVideo]}
					/>
				))
			)}

			{/* SPACER to avoid shrink */}
			<div style={{ flexGrow: 1 }} />
		</div>
	);

}