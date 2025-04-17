import React, { useEffect, useState } from "react";

type ToastProps = {
	message: string;
	duration?: number; 
	onClose?: () => void;
	toast: [any, any]
};

const toastStyles = {
	wrapper: {
		position: "fixed" as const,
		bottom: "40px", 
		left: "50%",
		transform: "translateX(-50%)",
		backgroundColor: "#06192d",
		borderRadius: "12px",
		padding: "14px 24px",
		boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
		zIndex: 9999,
		minWidth: "300px",
		maxWidth: "90%",
		textAlign: "center" as const,
		fontSize: "15px",
		fontWeight: 500,
		color: "white",
		transition: "bottom 0.3s ease-in-out",
	} as React.CSSProperties,
};

export const CustomToast = ({ message, duration = 3000, onClose, toast: [toast, setToast] }: ToastProps) => {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const checkMobile = () => setIsMobile(window.innerWidth < 640); // < 640px = mobile
		checkMobile();
		window.addEventListener("resize", checkMobile);

		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	useEffect(() => {
		const timer = setTimeout(() => {
			setToast({ show: false, data: { message: "" } })
			setTimeout(() => onClose?.(), 300);
		}, duration);

		return () => clearTimeout(timer);
	}, [duration, onClose]);

  if (!toast.show) return null;

  return (
    <div style={{...toastStyles.wrapper, bottom: isMobile ? "80px" : "40px" }}>
      {message}
    </div>
  );
};
