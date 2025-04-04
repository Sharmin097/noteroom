import React, { useState, useEffect, useRef } from "react";
import Quill, { QuillOptions } from "quill";
import "quill/dist/quill.snow.css";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "../../public/css/upload-note.css";
import "mathlive";
import { FaBold, FaItalic, FaUnderline, FaCode, FaLink, FaSuperscript, FaSubscript } from "react-icons/fa";

let API_SERVER_URL = import.meta.env.VITE_API_SERVER_URL;
const ReactSwal = withReactContent(Swal);

interface MathfieldElement extends HTMLElement {
  value: string;
  getValue: () => string;
  setValue: (value: string) => void;
  textContent: string;
}

interface MCQ {
  question: string;
  options: string[];
  correctAnswer: string | null;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "math-field": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          ref?: React.Ref<MathfieldElement>;
          value?: string;
          placeholder?: string;
          "virtual-keyboard-mode"?: string;
        },
        HTMLElement
      >;
    }
  }
}

const UploadNote: React.FC = () => {
  const [noteSubject, setNoteSubject] = useState<string>("");
  const [noteTitle, setNoteTitle] = useState<string>("");
  const [stackFiles, setStackFiles] = useState<File[]>([]);
  const [stackPdfs, setStackPdfs] = useState<File[]>([]);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isMathPopupOpen, setIsMathPopupOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("Text & Images");
  const [youtubeLink, setYoutubeLink] = useState<string>("");
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [mcqs, setMcqs] = useState<MCQ[]>([]);

  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const mathFieldRef = useRef<MathfieldElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";
    script.async = true;
    document.body.appendChild(script);

    (window as any).MathJax = {
      tex: {
        inlineMath: [
          ["$", "$"],
          ["\\(", "\\)"],
        ],
      },
      startup: {
        ready: () => {
          (window as any).MathJax.startup.defaultReady();
          (window as any).MathJax.typesetPromise();
        },
      },
    };

    const pdfJsScript = document.createElement("script");
    pdfJsScript.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.9.359/pdf.min.js";
    pdfJsScript.async = true;
    document.body.appendChild(pdfJsScript);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      if (pdfJsScript.parentNode) {
        pdfJsScript.parentNode.removeChild(pdfJsScript);
      }
    };
  }, []);

  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
      const toolbar = document.createElement("div");
      toolbar.id = "custom-toolbar";
      toolbar.innerHTML = `
        <button class="ql-bold" title="Bold"><span class="ql-icon"><svg viewBox="0 0 24 24"><FaBold /></svg></span></button>
        <button class="ql-italic" title="Italic"><span class="ql-icon"><svg viewBox="0 0 24 24"><FaItalic /></svg></span></button>
        <button class="ql-underline" title="Underline"><span class="ql-icon"><svg viewBox="0 0 24 24"><FaUnderline /></svg></span></button>
        <button class="ql-code-block" title="Code Block"><span class="ql-icon"><svg viewBox="0 0 24 24"><FaCode /></svg></span></button>
        <button class="ql-link" title="Link"><span class="ql-icon"><svg viewBox="0 0 24 24"><FaLink /></svg></span></button>
        <button class="ql-script" value="sub" title="Subscript"><span class="ql-icon"><svg viewBox="0 0 24 24"><FaSubscript /></svg></span></button>
        <button class="ql-script" value="super" title="Superscript"><span class="ql-icon"><svg viewBox="0 0 24 24"><FaSuperscript /></svg></span></button>
      `;
      editorRef.current.parentElement?.insertBefore(toolbar, editorRef.current);

      quillRef.current = new Quill(editorRef.current, {
        theme: "snow",
        placeholder:
          "Describe your note's key insights, unique takeaways, or how it aids learning.",
        modules: {
          toolbar: "#custom-toolbar",
        },
      } as QuillOptions);

      const BlockEmbed = Quill.import("blots/block/embed") as unknown as {
        new(...args: any[]): {
          domNode: HTMLElement;
        };
        create(value: string): HTMLElement;
        value(node: HTMLElement): string;
        scope?: number;
      };
      class MathBlot extends BlockEmbed {
        static blotName = "math";
        static tagName = "div";
        static scope = (Quill.import("blots/block/embed") as any).scope;

        static create(value: string) {
          const node = super.create(value);
          node.setAttribute("data-latex", value);
          node.innerHTML = `\\(${value}\\)`;
          setTimeout(() => {
            if ((window as any).MathJax) {
              (window as any).MathJax.typesetPromise([node]);
            }
          }, 0);
          return node;
        }
        static value(node: HTMLElement) {
          return node.getAttribute("data-latex") || "";
        }
      }
      Quill.register("formats/math", MathBlot);

      if (editorRef.current) {
        editorRef.current.style.height = "250px";
      }
    }

    if (mathFieldRef.current) {
      mathFieldRef.current.setValue("");
      mathFieldRef.current.setAttribute("virtual-keyboard-mode", "manual");
      mathFieldRef.current.setAttribute("placeholder", "Enter math here (e.g., x^2 + 3)");
    }

    return () => {
      quillRef.current = null;
      mathFieldRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (stackPdfs.length > 0 && pdfCanvasRef.current) {
      const renderPdfPreview = async () => {
        const pdfFile = stackPdfs[0];
        const pdfUrl = URL.createObjectURL(pdfFile);
        setPdfPreviewUrl(pdfUrl);

        const pdfJsLib = (window as any).pdfjsLib;
        pdfJsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.9.359/pdf.worker.min.js";

        const pdf = await pdfJsLib.getDocument(pdfUrl).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.0 });

        const canvas = pdfCanvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        const scale = Math.min(200 / viewport.width, 300 / viewport.height);
        const scaledViewport = page.getViewport({ scale });

        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        await page.render({
          canvasContext: context,
          viewport: scaledViewport,
        }).promise;
      };

      renderPdfPreview();
    }
  }, [stackPdfs]);

  const handleInsertMath = () => {
    if (mathFieldRef.current && quillRef.current) {
      const latex = mathFieldRef.current.getValue();
      if (latex) {
        const range = quillRef.current.getSelection(true);
        const index = range ? range.index : quillRef.current.getLength();
        quillRef.current.insertEmbed(index, "math", latex, "user");
        mathFieldRef.current.setValue("");
        setIsMathPopupOpen(false);
      } else {
        ReactSwal.fire({
          icon: "warning",
          title: "No Math Content",
          text: "Please enter a mathematical expression before inserting.",
        });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    const validTypes = ["image/png", "image/jpeg"];

    const validFiles = files.filter((file) => {
      if (!validTypes.includes(file.type)) {
        ReactSwal.fire({
          icon: "error",
          title: "Invalid File Type",
          text: `${file.name} is not a supported format (PNG or JPG only).`,
        });
        return false;
      }

      if (file.size > 10 * 1024 * 1024) {
        ReactSwal.fire({
          icon: "error",
          title: "File Too Large",
          text: `${file.name} exceeds the 10MB limit.`,
        });
        return false;
      }

      return true;
    });

    setStackFiles((prev) => [...prev, ...validFiles]);
    setCurrentImageIndex(0);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    const validTypes = ["application/pdf"];

    const validFiles = files.filter((file) => {
      if (!validTypes.includes(file.type)) {
        ReactSwal.fire({
          icon: "error",
          title: "Invalid File Type",
          text: `${file.name} is not a supported format (PDF only).`,
        });
        return false;
      }

      if (file.size > 10 * 1024 * 1024) {
        ReactSwal.fire({
          icon: "error",
          title: "File Too Large",
          text: `${file.name} exceeds the 10MB limit.`,
        });
        return false;
      }

      return true;
    });

    if (validFiles.length > 0) {
      setStackPdfs([validFiles[0]]);
    }

    if (pdfInputRef.current) pdfInputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (activeTab === "Text & Images") {
      const files = e.dataTransfer.files ? Array.from(e.dataTransfer.files) : [];
      const validTypes = ["image/png", "image/jpeg"];

      const validFiles = files.filter((file) => {
        if (!validTypes.includes(file.type)) {
          ReactSwal.fire({
            icon: "error",
            title: "Invalid File Type",
            text: `${file.name} is not a supported format (PNG or JPG only).`,
          });
          return false;
        }

        if (file.size > 10 * 1024 * 1024) {
          ReactSwal.fire({
            icon: "error",
            title: "File Too Large",
            text: `${file.name} exceeds the 10MB limit.`,
          });
          return false;
        }

        return true;
      });

      setStackFiles((prev) => [...prev, ...validFiles]);
      setCurrentImageIndex(0);
    } else if (activeTab === "File") {
      const files = e.dataTransfer.files ? Array.from(e.dataTransfer.files) : [];
      const validTypes = ["application/pdf"];

      const validFiles = files.filter((file) => {
        if (!validTypes.includes(file.type)) {
          ReactSwal.fire({
            icon: "error",
            title: "Invalid File Type",
            text: `${file.name} is not a supported format (PDF only).`,
          });
          return false;
        }

        if (file.size > 10 * 1024 * 1024) {
          ReactSwal.fire({
            icon: "error",
            title: "File Too Large",
            text: `${file.name} exceeds the 10MB limit.`,
          });
          return false;
        }

        return true;
      });

      if (validFiles.length > 0) {
        setStackPdfs([validFiles[0]]);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDeleteImage = (index: number) => {
    setStackFiles((prev) => prev.filter((_, i) => i !== index));
    if (currentImageIndex >= stackFiles.length - 1) {
      setCurrentImageIndex(Math.max(0, stackFiles.length - 2));
    }
  };

  const handleDeletePdf = () => {
    setStackPdfs([]);
    setPdfPreviewUrl(null);
    if (pdfCanvasRef.current) {
      const context = pdfCanvasRef.current.getContext("2d");
      if (context) {
        context.clearRect(0, 0, pdfCanvasRef.current.width, pdfCanvasRef.current.height);
      }
    }
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => Math.min(stackFiles.length - 1, prev + 1));
  };

  const extractYoutubeVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

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

  const handleAddMcq = () => {
    if (mcqs.length >= 30) {
      ReactSwal.fire({
        icon: "error",
        title: "Limit Reached",
        text: "You can only add up to 30 MCQs.",
      });
      return;
    }
    setMcqs([...mcqs, { question: "", options: ["", "", "", ""], correctAnswer: null }]);
  };

  const handleMcqChange = (index: number, field: keyof MCQ, value: string | string[] | null) => {
    setMcqs((prev) =>
      prev.map((mcq, i) =>
        i === index ? { ...mcq, [field]: value } : mcq
      )
    );
  };

  const handleOptionChange = (mcqIndex: number, optionIndex: number, value: string) => {
    setMcqs((prev) =>
      prev.map((mcq, i) =>
        i === mcqIndex
          ? { ...mcq, options: mcq.options.map((opt, j) => (j === optionIndex ? value : opt)) }
          : mcq
      )
    );
  };

  const handleDeleteMcq = (index: number) => {
    setMcqs((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePublish = async () => {
    const descriptionText = quillRef.current?.getText().trim() || "";
    const noteDescription = quillRef.current?.root.innerHTML || "";

    if (!noteTitle || !descriptionText) {
      ReactSwal.fire({
        icon: "error",
        title: "Incomplete Form",
        text: "Please share all the details before publishing",
      });
      return;
    }

    if (activeTab === "Links" && !youtubeVideoId) {
      ReactSwal.fire({
        icon: "error",
        title: "No YouTube Link",
        text: "Please insert a valid YouTube link before publishing.",
      });
      return;
    }

    if (activeTab === "File" && stackPdfs.length === 0) {
      ReactSwal.fire({
        icon: "error",
        title: "No PDF Uploaded",
        text: "Please upload a PDF before publishing.",
      });
      return;
    }

    if (activeTab === "MCQ" && mcqs.length === 0) {
      ReactSwal.fire({
        icon: "error",
        title: "No MCQs Added",
        text: "Please add at least one MCQ before publishing.",
      });
      return;
    }

    if (activeTab === "MCQ") {
      const invalidMcq = mcqs.find(
        (mcq) =>
          !mcq.question.trim() ||
          mcq.options.some((opt) => !opt.trim()) ||
          !mcq.correctAnswer
      );
      if (invalidMcq) {
        ReactSwal.fire({
          icon: "error",
          title: "Incomplete MCQ",
          text: "Please fill in all questions, options, and select a correct answer for each MCQ.",
        });
        return;
      }
    }

    setIsLoading(true);

    const formData = new FormData();
    if (activeTab === "Text & Images") {
      stackFiles.forEach((file, index) =>
        formData.append(`image-${index}`, file)
      );
    } else if (activeTab === "Links" && youtubeVideoId) {
      formData.append("youtubeLink", `https://www.youtube.com/watch?v=${youtubeVideoId}`);
    } else if (activeTab === "File" && stackPdfs.length > 0) {
      formData.append("pdf", stackPdfs[0]);
    } else if (activeTab === "MCQ") {
      formData.append("mcqs", JSON.stringify(mcqs));
    }
    formData.append("postSubject", noteSubject);
    formData.append("postTitle", noteTitle);
    formData.append("postDescription", noteDescription);

    try {
      ReactSwal.fire({
        icon: "success",
        title: "Processing...",
        text: "Your post is being processed to upload",
      });
      async function simulateUpload(): Promise<{ ok: boolean, json: any }> {
        return { ok: true, async json() { return { ok: true } } }
      }

      const response = await simulateUpload()
      if (response.ok) {
        const data = await response.json();
        if (data.ok) {
          setStackFiles([]);
          setStackPdfs([]);
          setCurrentImageIndex(0);
          setYoutubeLink("");
          setYoutubeVideoId(null);
          setPdfPreviewUrl(null);
          setMcqs([]);

          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          if (pdfInputRef.current) {
            pdfInputRef.current.value = "";
          }
          if (quillRef.current) {
            quillRef.current.root.innerHTML = "";
          }

          ReactSwal.fire({
            icon: "success",
            title: "You're good to go!",
            text: "Your post has been uploaded successfully!",
          });
        } else {
          ReactSwal.fire({
            icon: "error",
            title: "Upload failure",
            text: data.message || "Something went wrong! Please try again a bit later",
          });
        }
      } else {
        ReactSwal.fire({
          icon: "error",
          title: "Upload failure",
          text: "Something went wrong! Please try again a bit later",
        });
      }
    } catch (error) {
      ReactSwal.fire({
        icon: "error",
        title: "Connection Error",
        text: "Please check your internet connection and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="middle-section-upload">
      <nav className="upload-nav">
        <h2>Upload</h2>
        <div className="nav-options">
          <span
            className={activeTab === "Text & Images" ? "active" : ""}
            onClick={() => setActiveTab("Text & Images")}
          >
            Text & Images
          </span>
          <span
            className={activeTab === "Links" ? "active" : ""}
            onClick={() => setActiveTab("Links")}
          >
            Links
          </span>
          <span
            className={activeTab === "File" ? "active" : ""}
            onClick={() => setActiveTab("File")}
          >
            File
          </span>
          <span
            className={activeTab === "MCQ" ? "active" : ""}
            onClick={() => setActiveTab("MCQ")}
          >
            MCQ
          </span>
        </div>
      </nav>

      <div className="form-group">
        <span className="char-count">{noteTitle.length}/300</span>
        <input
          type="text"
          id="noteTitle"
          className="note-title"
          placeholder="Enter a concise title (max 300 characters)"
          name="noteTitle"
          maxLength={300}
          value={noteTitle}
          onChange={(e) => setNoteTitle(e.target.value)}
        />
      </div>

      <div className="form-group description-group">
        <span className="char-count">
          {(quillRef.current?.getText().trim().length || 0)}/5000
        </span>
        <div className="text-editor-wrapper">
          <div ref={editorRef} />
        </div>
        <div className="math-editor-container">
          <label className="math-label">Add Mathematical Expression</label>
          <button
            className="add-math-btn"
            onClick={() => setIsMathPopupOpen(true)}
            title="Add Mathematical Expression"
            aria-label="Add Mathematical Expression"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="12" fill="var(--squid-ink)" />
              <path
                d="M12 7V17M7 12H17"
                stroke="var(--neon-blue)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="upload-container">
        {activeTab === "Text & Images" ? (
          stackFiles.length === 0 ? (
            <div
              className={`upload-placeholder ${isDragging ? "dragging" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="fileInput"
                className="file-input"
                name="images"
                multiple
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg"
              />
              <label htmlFor="fileInput" className="upload-label">
                <span>Drag and Drop or Upload Images</span>
                <svg width="26" height="26" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="24" height="24" rx="12" fill="#D9D9D9" />
                  <path d="M13.866 14.6797L11.5025 12.3162M11.5025 12.3162L9.13913 14.6797M11.5025 12.3162V17.6339M16.4598 16.0918C17.0361 15.7776 17.4914 15.2805 17.7537 14.6788C18.0161 14.0772 18.0706 13.4053 17.9087 12.7692C17.7468 12.1332 17.3777 11.5691 16.8596 11.1661C16.3416 10.7631 15.704 10.5441 15.0477 10.5437H14.3032C14.1244 9.85193 13.791 9.20972 13.3283 8.66534C12.8655 8.12097 12.2853 7.68858 11.6314 7.40069C10.9775 7.1128 10.2668 6.9769 9.5528 7.00321C8.83879 7.02951 8.14004 7.21734 7.50907 7.55257C6.8781 7.8878 6.33134 8.36171 5.90989 8.93867C5.48844 9.51562 5.20327 10.1806 5.07581 10.8836C4.94836 11.5867 4.98194 12.3095 5.17403 12.9976C5.36612 13.6858 5.71173 14.3215 6.18486 14.8569" stroke="#6A6A6A" strokeWidth="1.18171" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </label>
            </div>
          ) : (
            <div className="carousel-container">
              <div className="carousel-actions">
                <div className="carousel-right-actions">
                  <button className="action-btn add-btn" onClick={() => fileInputRef.current?.click()}>
                    <svg width="21" height="22" viewBox="0 0 21 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="0.5" y="1.35156" width="16.5" height="16.5" rx="2" stroke="black" />
                      <path
                        d="M17.9167 4.60156H5.52083C4.54283 4.60156 3.75 5.39439 3.75 6.3724V18.7682C3.75 19.7462 4.54283 20.5391 5.52083 20.5391H17.9167C18.8947 20.5391 19.6875 19.7462 19.6875 18.7682V6.3724C19.6875 5.39439 18.8947 4.60156 17.9167 4.60156Z"
                        fill="white"
                      />
                      <path
                        d="M8.61979 10.7995C9.35329 10.7995 9.94792 10.2049 9.94792 9.47135C9.94792 8.73785 9.35329 8.14323 8.61979 8.14323C7.88629 8.14323 7.29167 8.73785 7.29167 9.47135C7.29167 10.2049 7.88629 10.7995 8.61979 10.7995Z"
                        fill="white"
                      />
                      <path d="M19.6875 15.2266L15.2604 10.7995L5.52083 20.5391" fill="white" />
                      <path
                        d="M5.52083 20.5391H17.9167C18.8947 20.5391 19.6875 19.7462 19.6875 18.7682V6.3724C19.6875 5.39439 18.8947 4.60156 17.9167 4.60156H5.52083C4.54283 4.60156 3.75 5.39439 3.75 6.3724V18.7682C3.75 19.7462 4.54283 20.5391 5.52083 20.5391ZM5.52083 20.5391L15.2604 10.7995L19.6875 15.2266M9.94792 9.47135C9.94792 10.2049 9.35329 10.7995 8.61979 10.7995C7.88629 10.7995 7.29167 10.2049 7.29167 9.47135C7.29167 8.73785 7.88629 8.14323 8.61979 8.14323C9.35329 8.14323 9.94792 8.73785 9.94792 9.47135Z"
                        stroke="#1E1E1E"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Add
                  </button>
                  <button className="action-btn edit-btn">
                    <svg width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12.75 2.75023C12.947 2.55324 13.1808 2.39699 13.4382 2.29038C13.6956 2.18378 13.9714 2.12891 14.25 2.12891C14.5286 2.12891 14.8044 2.18378 15.0618 2.29038C15.3192 2.39699 15.553 2.55324 15.75 2.75023C15.947 2.94721 16.1032 3.18106 16.2098 3.43843C16.3165 3.6958 16.3713 3.97165 16.3713 4.25023C16.3713 4.5288 16.3165 4.80465 16.2098 5.06202C16.1032 5.31939 15.947 5.55324 15.75 5.75023L5.625 15.8752L1.5 17.0002L2.625 12.8752L12.75 2.75023Z"
                        stroke="#1E1E1E"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Edit
                  </button>
                  <input
                    type="file"
                    id="fileInput"
                    className="file-input"
                    name="images"
                    multiple
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg"
                  />
                </div>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteImage(currentImageIndex)}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M19.5 5.5L18.8803 15.5251C18.7219 18.0864 18.6428 19.3671 18.0008 20.2879C17.6833 20.7431 17.2747 21.1273 16.8007 21.416C15.8421 22 14.559 22 11.9927 22C9.42312 22 8.1383 22 7.17905 21.4149C6.7048 21.1257 6.296 20.7408 5.97868 20.2848C5.33688 19.3626 5.25945 18.0801 5.10461 15.5152L4.5 5.5"
                      stroke="#FF0000"
                      strokeWidth="1.72881"
                      strokeLinecap="round"
                    />
                    <path
                      d="M3 5.5H21M16.0557 5.5L15.3731 4.09173C14.9196 3.15626 14.6928 2.68852 14.3017 2.39681C14.215 2.3321 14.1231 2.27454 14.027 2.2247C13.5939 2 13.0741 2 12.0345 2C10.9688 2 10.436 2 9.99568 2.23412C9.8981 2.28601 9.80498 2.3459 9.71729 2.41317C9.32164 2.7167 9.10063 3.20155 8.65861 4.17126L8.05292 5.5"
                      stroke="#FF0000"
                      strokeWidth="1.72881"
                      strokeLinecap="round"
                    />
                    <path d="M9.50244 16.5V10.5" stroke="#FF0000" strokeWidth="1.72881" strokeLinecap="round" />
                    <path d="M14.4976 16.5V10.5" stroke="#FF0000" strokeWidth="1.72881" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <button
                className="carousel-btn prev"
                onClick={handlePrevImage}
                disabled={currentImageIndex === 0}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M11.25 4.5L6.75 9L11.25 13.5"
                    stroke="#1E1E1E"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <div className="carousel-image-wrapper">
                <img
                  src={URL.createObjectURL(stackFiles[currentImageIndex])}
                  alt={`Uploaded Image ${currentImageIndex + 1}`}
                  className="carousel-image"
                  onLoad={(e) => URL.revokeObjectURL(e.currentTarget.src)}
                />
                <div className="carousel-indicators">
                  <span className="indicator-text">
                    {currentImageIndex + 1} of {stackFiles.length}
                  </span>
                </div>
              </div>
              <button
                className="carousel-btn next"
                onClick={handleNextImage}
                disabled={currentImageIndex === stackFiles.length - 1}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M6.75 13.5L11.25 9L6.75 4.5"
                    stroke="#1E1E1E"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          )
        ) : activeTab === "Links" ? (
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
        ) : activeTab === "File" ? (
          stackPdfs.length === 0 ? (
            <div
              className={`upload-placeholder ${isDragging ? "dragging" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="pdfInput"
                className="file-input"
                name="pdf"
                ref={pdfInputRef}
                onChange={handlePdfChange}
                accept="application/pdf"
              />
              <label htmlFor="pdfInput" className="upload-label">
                <span>Drag and Drop or Upload DOC/DOCX/PDF</span>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="24" height="24" rx="12" fill="#D9D9D9" />
                  <path d="M13.866 14.6797L11.5025 12.3162M11.5025 12.3162L9.13913 14.6797M11.5025 12.3162V17.6339M16.4598 16.0918C17.0361 15.7776 17.4914 15.2805 17.7537 14.6788C18.0161 14.0772 18.0706 13.4053 17.9087 12.7692C17.7468 12.1332 17.3777 11.5691 16.8596 11.1661C16.3416 10.7631 15.704 10.5441 15.0477 10.5437H14.3032C14.1244 9.85193 13.791 9.20972 13.3283 8.66534C12.8655 8.12097 12.2853 7.68858 11.6314 7.40069C10.9775 7.1128 10.2668 6.9769 9.5528 7.00321C8.83879 7.02951 8.14004 7.21734 7.50907 7.55257C6.8781 7.8878 6.33134 8.36171 5.90989 8.93867C5.48844 9.51562 5.20327 10.1806 5.07581 10.8836C4.94836 11.5867 4.98194 12.3095 5.17403 12.9976C5.36612 13.6858 5.71173 14.3215 6.18486 14.8569" stroke="#6A6A6A" stroke-width="1.18171" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </label>
            </div>
          ) : (
            <div className="pdf-preview-container">
              <div className="pdf-preview-wrapper">
                <canvas ref={pdfCanvasRef} className="pdf-preview-canvas" />
                <button className="pdf-delete-btn" onClick={handleDeletePdf}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                      fill="#d9534f"
                    />
                  </svg>
                </button>
              </div>
              <div className="pdf-file-name">
                {stackPdfs[0].name}
              </div>
            </div>
          )
        ) : activeTab === "MCQ" ? (
          <div className="mcq-container">
            {mcqs.length === 0 ? (
              <div className="mcq-placeholder">
                <span>No MCQs added yet. Click below to add a question.</span>
              </div>
            ) : (
              mcqs.map((mcq, index) => (
                <div key={index} className="mcq-item">
                  <div className="mcq-header">
                    <h3>Question {index + 1}</h3>
                    <button
                      className="mcq-delete-btn"
                      onClick={() => handleDeleteMcq(index)}
                      title="Delete Question"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19.5 5.5L18.8803 15.5251C18.7219 18.0864 18.6428 19.3671 18.0008 20.2879C17.6833 20.7431 17.2747 21.1273 16.8007 21.416C15.8421 22 14.559 22 11.9927 22C9.42312 22 8.1383 22 7.17905 21.4149C6.7048 21.1257 6.296 20.7408 5.97868 20.2848C5.33688 19.3626 5.25945 18.0801 5.10461 15.5152L4.5 5.5" stroke="#FF0000" stroke-width="1.72881" stroke-linecap="round"/>
                      <path d="M3 5.5H21M16.0557 5.5L15.3731 4.09173C14.9196 3.15626 14.6928 2.68852 14.3017 2.39681C14.215 2.3321 14.1231 2.27454 14.027 2.2247C13.5939 2 13.0741 2 12.0345 2C10.9688 2 10.436 2 9.99568 2.23412C9.8981 2.28601 9.80498 2.3459 9.71729 2.41317C9.32164 2.7167 9.10063 3.20155 8.65861 4.17126L8.05292 5.5" stroke="#FF0000" stroke-width="1.72881" stroke-linecap="round"/>
                      <path d="M9.50244 16.5V10.5" stroke="#FF0000" stroke-width="1.72881" stroke-linecap="round"/>
                      <path d="M14.4976 16.5V10.5" stroke="#FF0000" stroke-width="1.72881" stroke-linecap="round"/>
                      </svg>

                    </button>
                  </div>
                  <div className="mcq-question">
                    <textarea
                      placeholder="Enter your question here"
                      value={mcq.question}
                      onChange={(e) =>
                        handleMcqChange(index, "question", e.target.value)
                      }
                      maxLength={500}
                    />
                    <span className="char-count">
                      {mcq.question.length}/500
                    </span>
                  </div>
                  <div className="mcq-options">
                    {mcq.options.map((option, optIndex) => (
                      <div key={optIndex} className="mcq-option">
                        <label>{String.fromCharCode(65 + optIndex)}.</label>
                        <input
                          type="text"
                          placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                          value={option}
                          onChange={(e) =>
                            handleOptionChange(index, optIndex, e.target.value)
                          }
                          maxLength={200}
                        />
                        <span className="char-count">
                          {option.length}/200
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mcq-correct-answer">
                    <label>Correct Answer:</label>
                    <select
                      value={mcq.correctAnswer || ""}
                      onChange={(e) =>
                        handleMcqChange(index, "correctAnswer", e.target.value || null)
                      }
                    >
                      <option value="" disabled>
                        Select correct answer
                      </option>
                      {mcq.options.map((_, optIndex) => (
                        <option key={optIndex} value={String.fromCharCode(65 + optIndex)}>
                          {String.fromCharCode(65 + optIndex)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))
            )}
            <button className="add-mcq-btn" onClick={handleAddMcq}>
              Add Question
            </button>
          </div>
        ) : null}
      </div>

      <div className="button-group">
        <button className="save-draft-btn" disabled={isLoading}>
          Save Draft
        </button>
        <button
          className="publish-note-btn"
          onClick={handlePublish}
          disabled={isLoading}
        >
          {isLoading ? "Publishing..." : "Publish"}
        </button>
      </div>

      {isMathPopupOpen && (
        <>
          <div className="overlay" onClick={() => setIsMathPopupOpen(false)} />
          <div className="math-popup">
            <div className="popup-header">
              <h2>Add Mathematical Expression</h2>
              <button className="discard-btn" onClick={() => setIsMathPopupOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 18L18 6M6 6l12 12" stroke="#333" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="math-editor-wrapper">
              {React.createElement("math-field", {
                ref: mathFieldRef,
                placeholder: "Enter math here (e.g., x^2 + 3)",
              })}
            </div>
            <button className="insert-math-btn-popup" onClick={handleInsertMath}>
              Insert
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UploadNote;