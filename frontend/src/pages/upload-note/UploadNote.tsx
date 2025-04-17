import React, { useState, useEffect, useRef, useReducer, act } from "react";
import Quill, { QuillOptions } from "quill";
import "quill/dist/quill.snow.css";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "../../public/css/upload-note.css";
import ImageUploadContainer from "./ImageContainer";
import MCQContainer from "./MCQContainer";
import FileContainer from "./FileContainer";
import LinkContainer from "./YoutubeLinkContainer";
import QuillEditor from "../../partials/QuillEditor";
import mcqReducer from "../../reducers/mcqReducer";
import { dexieDB, getAllDrafts } from "./dexieDB";
import { useLiveQuery } from "dexie-react-hooks"

let API_SERVER_URL = import.meta.env.VITE_API_SERVER_URL;
const ReactSwal = withReactContent(Swal);
export interface MCQ {
  question: string;
  questionID: string,
  options: {
    optionType: string,
    optionText: string,
    optionID: string
  }[],
  correctAnswer: string | null;
}


export enum SubNav { TEXT_IMAGE="content", LINK="link", FILE="file", MCQ="mcq" }
const mapPostTypesTitles = {
  [SubNav.TEXT_IMAGE]: "Text and Images",
  [SubNav.FILE]: "Files",
  [SubNav.LINK]: "Links",
  [SubNav.MCQ]: "MCQs"
}
function SubNatigation({ activeTab: [activeTab, setActiveTab] }: any) {
  return (
    <>
      <nav className="upload-nav">
        <h2>Upload</h2>
        <div className="nav-options">
          <span
            className={activeTab === SubNav.TEXT_IMAGE ? "active" : ""}
            onClick={() => setActiveTab(SubNav.TEXT_IMAGE)}
          >
            { mapPostTypesTitles[SubNav.TEXT_IMAGE] }
          </span>
          <span
            className={activeTab === SubNav.LINK ? "active" : ""}
            onClick={() => setActiveTab(SubNav.LINK)}
          >
            { mapPostTypesTitles[SubNav.LINK] }
          </span>
          <span
            className={activeTab === SubNav.FILE ? "active" : ""}
            onClick={() => setActiveTab(SubNav.FILE)}
          >
            { mapPostTypesTitles[SubNav.FILE] }
          </span>
          <span
            className={activeTab === SubNav.MCQ ? "active" : ""}
            onClick={() => setActiveTab(SubNav.MCQ)}
          >
            { mapPostTypesTitles[SubNav.MCQ] }
          </span>
        </div>
      </nav>
    </>
  )
}

function PostTitle({ postTitle: [postTitle, setPostTitle] }: any) {
  return (
    <div className="form-group">
        <span className="char-count">{postTitle.length}/300</span>
        <label className="Note-Title">
        <input
          type="text"
          id="noteTitle"
          className="note-title"
          placeholder=""
          name="noteTitle"
          maxLength={300}
          value={postTitle}
          onChange={(e) => setPostTitle(e.target.value)}
        />
        <span className="Title-placeholder">Title*</span>
        </label>

      </div>
  )
}

function Draft({ draftPosts, controller: [editDraft, deleteDraft] }: any) {
  return (
    <div className="draft-posts-container" style={{minHeight: "300px", width: "100%"}}>
            <div className="draft-posts-scrollable" style={{maxHeight: "250px", overflowY: "auto", paddingRight: "8px", scrollbarWidth: "thin"}}>
              {draftPosts.map((post: any, idx) => (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #ddd' }}>
                    <div style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', marginRight: '10px', textAlign: "left" }}>
                      <strong>{post.postTitle}</strong>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => editDraft(post.postID)}
                        style={{ padding: '6px 12px', fontSize: '14px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px',cursor: 'pointer',}}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => deleteDraft(post.postID)}
                        style={{ padding: '6px 12px', fontSize: '14px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', }} 
                      >
                        Delete
                      </button>
                    </div>
                  </div>
              ))}
            </div>
          </div>

  )
}

const UploadNote: React.FC = () => {
  const [postTitle, setPostTitle] = useState<string>("");
  const [stackFiles, setStackFiles] = useState<File[]>([]);
  const [stackPdfs, setStackPdfs] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [youtubeLink, setYoutubeLink] = useState<string>("");
  const [youtubeLinks, setYoutubeLinks] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<SubNav>(SubNav.TEXT_IMAGE);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [mcqs, dispatch] = useReducer(mcqReducer, []);
  const [disableButton, setDisableButton] = useState<boolean>(true)
  // const [draftPosts, setDraftPosts] = useState<any[]>([])

  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setDisableButton(postTitle.trim().length === 0)
  }, [postTitle])

  // useEffect(() => {
  //   async function loadDraftsFromDB() {
  //     const fromDB = await getAllDrafts()
  //     setDraftPosts(fromDB)
  //   }
  //   loadDraftsFromDB()
  // }, [])
  // function applyDraftPost(post: any) {
  //   if (post.type === SubNav.TEXT_IMAGE) {
  //     setPostTitle(post.title)
  //     quillRef.current?.clipboard.dangerouslyPasteHTML(post.description)
  //     setStackFiles(post.images)
  //   }
  // }

  // function deleteDraft(postID: string) {
  //   console.log(postID)
  //   setDraftPosts(prev => prev.filter(draft => draft.postID === postID))
  // }

	// async function draftPost() {
	// 	try {
	// 		let post = {
	// 			postID: crypto.randomUUID(),
	// 			title: postTitle,
	// 			type: activeTab,
  //       ...((activeTab === SubNav.TEXT_IMAGE || activeTab === SubNav.FILE) && { description: quillRef?.current?.getSemanticHTML() })
	// 		}
	// 		switch(activeTab) {
	// 			case SubNav.TEXT_IMAGE:
	// 				post["images"] = stackFiles
	// 				dexieDB[SubNav.TEXT_IMAGE].add(post)
	// 				break
	// 			case SubNav.FILE:
	// 				post["files"] = stackPdfs
	// 				dexieDB[SubNav.FILE].add(post)
	// 				break
	// 		}
	// 		ReactSwal.fire({
	// 			toast: true,
  //       backdrop: false,
	// 			icon: "success",
	// 			text: "Post saved as draft",
	// 			position: "bottom",
  //       showCancelButton: false,
  //       timer: 2000,
  //       timerProgressBar: true
	// 		})
	// 	} catch (error) {
	// 		console.error(error)
	// 	}
	// }

  // async function editDraft(postID: string) {
  //     ReactSwal.close()
  //     const allPosts = await getAllDrafts()
	// 		const draftPost = allPosts.filter((post: any) => post.postID === postID) as any
  //     if (draftPost.length !== 0) applyDraftPost(draftPost[0])
  // }

	// async function showDrafts() {
  //   if (draftPosts.length !== 0) {
  //     ReactSwal.fire({
  //       title: "Draft Posts",
  //       showCancelButton: true,
  //       html: <Draft draftPosts={draftPosts} controller={[editDraft, deleteDraft]} />
  //     })
  //   } else {
  //     ReactSwal.fire({
  //       title: "No draft posts!",
  //       text: "Save some drafts to edit them later"
  //     })
  //   }
	// }

  useEffect(() => {
    if (activeTab !== SubNav.TEXT_IMAGE) {
      ReactSwal.fire({
        title: "Only Text/Images Section is supported. Others will be implemented soon!"
      })
    }
  }, [activeTab])

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  async function handlePublish() {
    async function handleFetch(api: string, formData: FormData) {
      const response = await fetch(`${API_SERVER_URL}${api}`, {
        credentials: "include",
        method: "post",
        body: formData
      })
      if (response.ok) {
        const data = await response.json()
        setIsLoading(false)
        if (data.ok) {
          ReactSwal.fire({
            icon: "success",
            title: "You are good to go!",
            text: data.message,
          });
        } else {
          ReactSwal.fire({
            icon: "error",
            title: "Uh oh! Something went wrong",
            text: data.message,
          });
        }
      } else {
        ReactSwal.fire({
          icon: "error",
          title: "Uh oh! Something went wrong",
          text: "Couldn't upload! Please try again a bit later",
        });
      }
    }

    try {
      if (postTitle.trim().length === 0) {
        ReactSwal.fire({
          icon: "question",
          title: "Uh oh! Something went wrong",
          text: "Title is required, must be a string, and less than 100 characters.",
        })
        return
      }

      setIsLoading(true)
      const postData = new FormData()
	    postData.append("postTitle", postTitle)
      if (activeTab === SubNav.TEXT_IMAGE || activeTab === SubNav.FILE) postData.append("postDescription", quillRef?.current?.getSemanticHTML() || "")

      switch(activeTab) {
        case SubNav.TEXT_IMAGE:
          for (let file of stackFiles) {
            postData.append(`file-${crypto.randomUUID()}`, file)
          }
          return await handleFetch('/api/upload/content', postData)

        case SubNav.MCQ:
          postData.append("mcqStrings", JSON.stringify(mcqs))   
          return await handleFetch("/api/upload/mcq", postData) 

        case SubNav.FILE:
          for (let file of stackPdfs) {
            postData.append(`file-${crypto.randomUUID()}`, file)
          }
          return await handleFetch('/api/upload/file', postData)

        case SubNav.LINK:
          postData.append("linksString", JSON.stringify(youtubeLinks))
          for (let file of stackPdfs) {
            postData.append(`file-${crypto.randomUUID()}`, file)
          }
          return await handleFetch('/api/upload/link', postData)
      }
    } catch (error) {
      ReactSwal.fire({
        icon: "success",
        title: "Uh oh! Something went wrong",
        text: "Couldn't upload! Please try again a bit later",
      });
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="middle-section-upload">
      <SubNatigation activeTab={[activeTab, setActiveTab]} />

      <PostTitle postTitle={[postTitle, setPostTitle]} />      

      <div className="upload-container">
        { activeTab === SubNav.TEXT_IMAGE && <ImageUploadContainer 
          handleDrag={[isDragging, handleDragOver, handleDragLeave]}
          refs={[fileInputRef]}
          stackFiles={[stackFiles, setStackFiles]}
        /> }

        { activeTab === SubNav.LINK && <LinkContainer 
          youtubeLink={[youtubeLink, setYoutubeLink]}
          youtubeLinks={[youtubeLinks, setYoutubeLinks]}
        /> }

        { activeTab === SubNav.FILE && <FileContainer 
          handleDrag={[isDragging, handleDragOver, handleDragLeave]}
          refs={[pdfInputRef, pdfCanvasRef]}
          stackPdfs={[stackPdfs, setStackPdfs]}
        /> }

        { activeTab === SubNav.MCQ && <MCQContainer 
          mcqs={[mcqs, dispatch]}
        /> }
      </div>

      <QuillEditor 
        editorRef={editorRef}
        quillRef={quillRef}
        rootClass="form-group description-group"
        style={{display: (activeTab === SubNav.TEXT_IMAGE || activeTab === SubNav.FILE) ? "" : "none" }}
      />

      <div className="button-group">
        <button className="save-draft-btn" disabled={isLoading || disableButton}>
          Save Draft
        </button>
        <button
          className="publish-note-btn"
          disabled={isLoading || disableButton}
          onClick={handlePublish}
        >
          {isLoading ? "Publishing..." : "Publish"}
        </button>
        {/* <button>Show drafts</button> */}
      </div>
    </div>
  );
};

export default UploadNote;