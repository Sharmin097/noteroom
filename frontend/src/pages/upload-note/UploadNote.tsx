import React, { useState, useEffect, useRef } from "react";
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

let API_SERVER_URL = import.meta.env.VITE_API_SERVER_URL;
const ReactSwal = withReactContent(Swal);
interface MCQ {
  question: string;
  options: string[];
  correctAnswer: string | null;
}


enum SubNav { TEXT_IMAGES, LINKS, FILE, MCQ }
function SubNatigation({ activeTab: [activeTab, setActiveTab] }: any) {
  return (
    <>
      <nav className="upload-nav">
        <h2>Upload</h2>
        <div className="nav-options">
          <span
            className={activeTab === SubNav.TEXT_IMAGES ? "active" : ""}
            onClick={() => setActiveTab(SubNav.TEXT_IMAGES)}
          >
            Text & Images
          </span>
          <span
            className={activeTab === SubNav.LINKS ? "active" : ""}
            onClick={() => setActiveTab(SubNav.LINKS)}
          >
            Links
          </span>
          <span
            className={activeTab === SubNav.FILE ? "active" : ""}
            onClick={() => setActiveTab(SubNav.FILE)}
          >
            File
          </span>
          <span
            className={activeTab === SubNav.MCQ ? "active" : ""}
            onClick={() => setActiveTab(SubNav.MCQ)}
          >
            MCQ
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
  const [activeTab, setActiveTab] = useState<SubNav>(SubNav.TEXT_IMAGES);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [mcqs, setMcqs] = useState<MCQ[]>([]);

  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);

  //FIXME: I will handle the `drag and drop feature` and `handlePublish` function (@Rafi)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  async function handlePublish() {
    try {
      switch(activeTab) {
        case SubNav.TEXT_IMAGES:
          setIsLoading(true)
          const postData = new FormData()
          postData.append("postTitle", postTitle)
          postData.append("postDescription", quillRef?.current?.getSemanticHTML() || "")
          for (let file of stackFiles) {
            postData.append(`file-${crypto.randomUUID()}`, file)
          }
          const response = await fetch(`${API_SERVER_URL}/api/upload/content`, {
            credentials: "include",
            method: "post",
            body: postData
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
          break
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
        { activeTab === SubNav.TEXT_IMAGES && <ImageUploadContainer 
          handleDrag={[isDragging, handleDragOver, handleDragLeave]}
          refs={[fileInputRef]}
          stackFiles={[stackFiles, setStackFiles]}
        /> }

        { activeTab === SubNav.LINKS && <LinkContainer 
          youtubeLink={[youtubeLink, setYoutubeLink]}
        /> }

        { activeTab === SubNav.FILE && <FileContainer 
          handleDrag={[isDragging, handleDragOver, handleDragLeave]}
          refs={[pdfInputRef, pdfCanvasRef]}
          stackPdfs={[stackPdfs, setStackPdfs]}
        /> }

        { activeTab === SubNav.MCQ && <MCQContainer 
          mcqs={[mcqs, setMcqs]}
        /> }
      </div>

      <QuillEditor 
        editorRef={editorRef}
        quillRef={quillRef}
        rootClass="form-group description-group"
        style={{display: (activeTab === SubNav.TEXT_IMAGES || activeTab === SubNav.FILE) ? "" : "none" }}
      />

      <div className="button-group">
        <button className="save-draft-btn" disabled={isLoading}>
          Save Draft
        </button>
        <button
          className="publish-note-btn"
          disabled={isLoading}
          onClick={handlePublish}
        >
          {isLoading ? "Publishing..." : "Publish"}
        </button>
      </div>
    </div>
  );
};

export default UploadNote;