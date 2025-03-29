import { useCallback, useState } from "react"
import { useAppData } from "../context/AppDataContext"
import { RequestsActions } from "../reducers/requestReducer"
import TextEditor from "./PopupTextEditor"
import withReactContent from "sweetalert2-react-content"
import Swal from "sweetalert2"

const API_SERVER_URL = import.meta.env.VITE_API_SERVER_URL

function fireToast(title: string, icon: any) {
    return withReactContent(Swal).fire({
        toast: true,
        icon: icon,
        position: "bottom-right",
        title: title,
        showConfirmButton: true,
        timer: 3000,
        timerProgressBar: true
    })
}

function Request({ 
    request: [request, dispatchRequest], 
    showEditor: [showEditor, setShowEditor], 
    recID: [recID, setRecID], 
    senderDisplayName: [senderDisplayName, setSenderDisplayName],
    inputOptions, 
}: any) {
    const [isReqExpanded, setIsReqExpanded] = useState(false)

    const acceptRequest = useCallback(async () => {
        const result = await withReactContent(Swal).fire({
            title: "Share a resource that you own",
            input: "select",
            inputOptions: inputOptions,
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonText: "Send Resource"
        })
        if (result.isConfirmed) {
            const postID = result.value
            if (postID && postID.trim().length !== 0) {
                const requestForm = new FormData()
                requestForm.append("postID", postID)
                const response = await fetch(`${API_SERVER_URL}/api/requests/${request.recID}/accept`, {
                    method: "post",
                    credentials: "include",
                    body: requestForm
                })
                if (response.ok) {
                    const data = await response.json()
                    if (data.ok) {
                        fireToast("Resource sent!", "success")
                        dispatchRequest({ type: RequestsActions.DELETE, payload: { recID: request.recID } })
                    } else {
                        fireToast(data.message || "Couldn't send the resource! Please try again a bit later", "error")
                    }
                } else {
                    fireToast("Something went wrong! Please try again a bit later", "error")
                }
            }
        }
    }, [])

    const handleDecline = useCallback(() => {
        setShowEditor((prev: boolean) => !prev)
        setRecID(request.recID)
        setSenderDisplayName(request.senderDisplayName)
    }, [])


    return (
        <div className="request" id={"request-" + request.recID}>
            <div className="request__fr">
                <span className="open-request-card" onClick={() => setIsReqExpanded(!isReqExpanded)}>
                    <svg width="15" className="request-chevron-icon" viewBox="0 0 60 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 4.5L30 29.5L55 4.5" stroke="#1E1E1E" strokeWidth="8.33333" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </span>
                <span className="request__fr--requester-name">{request.senderDisplayName}'s Request</span>
                <span className="request__fr--requested-date">{(new Date(request.createdAt)).toLocaleDateString()}</span>
            </div>
            <div className={"request__sr " + (isReqExpanded ? "request__sr--expanded" : "")}>
                <p className="request__sr--request-desc">{request.message}</p>
                <div className="request__sr--request-action-update">
                    <button className="btn-request btn-accept-request" onClick={acceptRequest}>
                        Accept
                        <svg className="req-accept-icon" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="15" height="15" viewBox="0 0 30 30">
                            <path d="M 26.980469 5.9902344 A 1.0001 1.0001 0 0 0 26.292969 6.2929688 L 11 21.585938 L 4.7070312 15.292969 A 1.0001 1.0001 0 1 0 3.2929688 16.707031 L 10.292969 23.707031 A 1.0001 1.0001 0 0 0 11.707031 23.707031 L 27.707031 7.7070312 A 1.0001 1.0001 0 0 0 26.980469 5.9902344 z"></path>
                        </svg>
                    </button>
                    <button className="btn-request btn-reject-request" onClick={() => handleDecline()}>
                        Decline
                        <svg className="req-reject-icon" width="12" height="12" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 3L67 67" stroke="black" strokeWidth="6" strokeLinejoin="round" />
                            <path d="M67 3L3 67" stroke="black" strokeWidth="6" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function RequestsContainer() {
    const [loading, setLoading] = useState<boolean>(false)
    const [text, setText] = useState<string>("")
    const [showEditor, setShowEditor] = useState<boolean>(false)
    const [recID, setRecID] = useState<string>("")
    const [senderDisplayName, setSenderDisplayName] = useState<string>("")

    const { requests: [requests, dispatchRequest] } = useAppData()
    const { userProfile: [profile,] } = useAppData()

    const posts = profile?.owned_posts?.reduce((inputOptions: Record<string, string>, post: any) => {
        inputOptions[post.noteID] = post.noteTitle;
        return inputOptions;
    }, {});

    async function declineRequest() {
        try {
            if (recID.length !== 0) {
                const requestForm = new FormData()
                requestForm.append("message", text)
                const response = await fetch(`${API_SERVER_URL}/api/requests/${recID}/decline`, {
                    method: "post",
                    credentials: "include",
                    body: requestForm
                })
                if (response.ok) {
                    const data = await response.json()
                    if (data.ok) {
                        fireToast("Request declined", "success")
                        dispatchRequest({ type: RequestsActions.DELETE, payload: { recID: recID } })
                    } else {
                        fireToast(data.message || "Something went wrong! Please try again a bit later", "error")
                    }
                } else {
                    fireToast("Something went wrong! Please try again a bit later", "error")
                }
            }
        } catch (error) {
            fireToast("Something went wrong! Please try again a bit later", "error")
        } finally {
            setShowEditor(false)
            setText("")
        }
    }

    return (
        <>
            <TextEditor 
                showState={[showEditor, setShowEditor]} 
                text={[text, setText]} 
                action={declineRequest} 
                loading={[loading, setLoading]} 
                title={"Declining Request"}
                subTitle={""}
                inputPlaceHolder={`Let ${senderDisplayName} know why you are unable to give the requested resource`}
                buttonText={"Send"}
            />
            <div className="right-panel__requests-component">
                <div className="requests-component__header">
                    <h4 className="requests-component__header-label">Requests</h4>
                </div>
                <div className="requests-container">
                    {requests?.map((request: any) => {
                        return (
                            <Request 
                                request={[request, dispatchRequest]} 
                                inputOptions={posts} 
                                showEditor={[showEditor, setShowEditor]} 
                                recID={[recID, setRecID]} 
                                senderDisplayName={[senderDisplayName, setSenderDisplayName]}
                                key={request.recID} 
                            />
                        )
                    })}
                </div>
            </div>
        </>
    )
}