import { DashBoard } from "./pages/dashboard/index";
import { LeftPanel, NoteSearchBar, NotificationModal, RightPanel } from "./partials/index";
import MobileControlPanel from "./partials/MobileControlPanel";
import { useEffect, useState } from "react";
import PostView from "./pages/post-view/PostView";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import SearchProfile from "./pages/search-profile/SearchProfile";
import Settings from "./pages/settings/Settings";	
import UserProfile from "./pages/user-profile/UserProfile";
import SignUp from "./pages/sign-up/SignUp";
import { useUserAuth } from "./context/UserAuthContext";
import Login from "./pages/login/Login";
import nrLogo from "./assets/ng_logo.png"
import UploadNote from "./pages/upload-note/UploadNote";
import NotFound from "./pages/error-pages/NotFound";
import { useGlobalComponentController } from "./context/GlobalComponentContext";
import { CustomToast } from "./partials/Toast";

//TODO: A reddit like logo when the feed loads or the user auth loads

const gaTrackingID = import.meta.env.VITE_GOOGLE_ANALYTICS_DEVELOPMENT_TRACKING_KEY

function PublicRoute() {
	const { userAuth, loading } = useUserAuth()!
	if (loading) {
		return <>
			<img src={nrLogo} />
		</>
	}
	if (userAuth) {
		return <Navigate to="/" />
	}

	return <Outlet />
}

function ProtectedRoute() {
	const { userAuth, loading } = useUserAuth()!
	if (loading) {
		return <>
			<img src={nrLogo} />
		</>
	}
	if (!userAuth) {
		return <Navigate to="/login" />
	}

	return <Outlet />
}

function MainLayout({ userAuth }: { userAuth: any }) {
	const [showNotiModal, setShowNotiModal] = useState(false);
	const [showRightPanel, setShowRightPanel] = useState(false);

	return <>
		{userAuth && (
			<>
				<LeftPanel />
				<NoteSearchBar notiModalState={[showNotiModal, setShowNotiModal]} />
				<NotificationModal notiState={[showNotiModal, setShowNotiModal]} rightPanelState={[showRightPanel, setShowRightPanel]} />
				<RightPanel notiModalState={[showNotiModal, setShowNotiModal]} rightPanelState={showRightPanel} />
				<MobileControlPanel rightPanelState={[showRightPanel, setShowRightPanel]} />
			</>
		)}
		<Outlet />
	</>
}

function App() {	
	const { userAuth } = useUserAuth()!;
	const { pathname } = useLocation()
	const { toast: [toast, setToast] } = useGlobalComponentController()

	return (
		<Routes>
			<Route element={<PublicRoute />}>
				<Route path="/login" element={<Login />} />
				<Route path="/signup" element={<SignUp />} />
				<Route path="/profession" element={<ProfessionSelection/>} />
				<Route path="/checkout" element={<Checkout/>} />
				<Route path="/payment" element={<Payment/>} />
			</Route>

			<Route element={<ProtectedRoute />}>
				<Route element={<MainLayout userAuth={userAuth}/>}>
					<Route path="/" element={<DashBoard />} />
					<Route path="/post/:postID" element={<PostView />} />
					<Route path="/user/:username" element={<UserProfile />} />
					<Route path="/search-profile" element={<SearchProfile />} />
					<Route path="/settings" element={<Settings />} />
					<Route path="/upload" element={<UploadNote />} />
				</Route>
			</Route>

				<Route path="*" element={<Navigate to="/not-found" state={{ type: "page", route: pathname }} replace={true} />} />
				<Route path="/not-found" element={<NotFound />} />
			</Routes>
			{ toast?.show && <CustomToast message={toast?.data.message} toast={[toast, setToast]} /> }
		</>
	);
}

export default App;