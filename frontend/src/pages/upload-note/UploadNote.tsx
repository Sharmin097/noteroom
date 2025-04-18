import React, { useState, useEffect, useRef, useReducer } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "../../public/css/upload-note.css";
import ImageUploadContainer from "./ImageContainer";
import MCQContainer from "./MCQContainer";
import FileContainer from "./FileContainer";
import LinkContainer from "./YoutubeLinkContainer";
import QuillEditor from "../../partials/QuillEditor";
import mcqReducer, { MCQActions } from "../../reducers/mcqReducer";
import DraftPostContainer from "./DraftPost";
import { useGlobalComponentController } from "../../context/GlobalComponentContext";

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

export interface DraftPost {
  postID: string,
  title: string,
  type: SubNav,
  description?: string,
  images?: File[],
  files?: File[],
  mcqs?: MCQ[]
}


export enum SubNav { TEXT_IMAGE="content", LINK="link", FILE="file", MCQ="mcq" }
export const mapPostTypesTitles = {
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
  const [draftPosts, setDraftPosts] = useState<DraftPost[]>([])
  const [showDraftContainer, setShowDraftContainer] = useState<boolean>(false)
  const [applyDraft, setApplyDraft] = useState<{ apply: boolean, draft: DraftPost | null}>({ apply: false, draft: null })
  const [isDraftsLoaded, setIsDraftsLoaded] = useState<boolean>(false)

  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);

  const dexieModule = useRef<any>(null)
  const [dexieLoaded, setDexieLoaded] = useState<boolean>(false)

  const { toast: [, setToast] } = useGlobalComponentController()!

  const MAX_DRAFT_LIMIT = 20

  useEffect(() => {
    setDisableButton(postTitle.trim().length === 0)
  }, [postTitle])

  useEffect(() => {
    if (applyDraft.apply) {
      const { draft } = applyDraft
      const { type } = draft!

      setActiveTab(type as SubNav)
      setPostTitle(draft!.title || "")
      if (type === SubNav.TEXT_IMAGE || type === SubNav.FILE) {
        quillRef.current?.clipboard.dangerouslyPasteHTML(draft!.description || "")
      }

      if (type === SubNav.TEXT_IMAGE) {
        setStackFiles(draft!.images || [])   
      } else if (type === SubNav.FILE) {
        setStackPdfs(draft!.files || [])
      } else if (type === SubNav.MCQ) {
        dispatch({ type: MCQActions.ADD, payload: { mcqs: draft?.mcqs } })
      }
    }
  }, [applyDraft])

  useEffect(() => {
    async function loadDraftsFromDB() {
      const fromDB = await dexieModule.current.getAllDrafts()
      setDraftPosts(fromDB)
    }
    if (dexieLoaded) {
      loadDraftsFromDB()
      setIsDraftsLoaded(true)
    }
  }, [dexieLoaded])

  useEffect(() => {
    async function loadDexieModule() {
      const module = await import("./dexieDB")
      dexieModule.current = module
      setDexieLoaded(true)
    }

    loadDexieModule()
  }, [])

	async function addDraft() {
		try {
      if (draftPosts.length < MAX_DRAFT_LIMIT) {
        let post: DraftPost = {
          postID: crypto.randomUUID(),
          title: postTitle,
          type: activeTab,
          ...((activeTab === SubNav.TEXT_IMAGE || activeTab === SubNav.FILE) && { description: quillRef?.current?.getSemanticHTML() }),
          ...(activeTab === SubNav.TEXT_IMAGE && { images: stackFiles} ),
          ...(activeTab === SubNav.FILE && { files: stackPdfs} ),
          ...(activeTab === SubNav.MCQ && { mcqs: mcqs } ),
        }
  
        const response = await dexieModule.current.addDraft(activeTab, post)
        if (response) {
          setDraftPosts(prev => [...prev, ...[post]])
          setToast({ show: true, data: { message: "Post saved as a draft" } })
        }
      } else {
        setToast({ show: true, data: { message: `Oops! You can only have up to ${MAX_DRAFT_LIMIT} drafts` } })
      }
		} catch (error) {
			console.error(error)
		}
	}

  // useEffect(() => {
  //   if (activeTab !== SubNav.TEXT_IMAGE) {
  //     ReactSwal.fire({
  //       title: "Only Text/Images Section is supported. Others will be implemented soon!"
  //     })
  //   }
  // }, [activeTab])

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

      <DraftPostContainer 
        showContainer={[showDraftContainer, setShowDraftContainer]} 
        drafts={[draftPosts, setDraftPosts]}
        applyDraft={[applyDraft, setApplyDraft]}
        dexieModule={dexieModule}
        setToast={setToast}
        MAX_DRAFT_LIMIT={MAX_DRAFT_LIMIT}
      />

      <div className="button-group">
        <button className="save-draft-btn" disabled={isLoading || disableButton || activeTab === SubNav.LINK} onClick={addDraft}>
          Save Draft
        </button>
        <button
          className="publish-note-btn"
          disabled={isLoading || disableButton}
          onClick={handlePublish}
        >
          {isLoading ? "Publishing..." : "Publish"}
        </button>
        <button onClick={() => setShowDraftContainer(true)} className="save-draft-btn" disabled={isLoading || !isDraftsLoaded}>Show drafts</button>
      </div>
    </div>
  );
};

export default UploadNote;