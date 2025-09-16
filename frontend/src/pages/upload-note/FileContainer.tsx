import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

const handlePreviewPdf = async (file: File) => {
  const fileURL = URL.createObjectURL(file);

  const canvas = document.createElement("canvas");
  canvas.width = 450;
  canvas.height = 600;


  try {
    const pdf = await pdfjsLib.getDocument(fileURL).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1.5 });

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      await page.render({
        canvasContext: ctx,
        viewport,
      }).promise;

      ReactSwal.fire({
        title: <span style={{ fontSize: '0.8rem', marginTop: "10px" }}>{file.name}</span>,
        html: `<canvas id="pdf-preview-canvas" width="${canvas.width}" height="${canvas.height}"></canvas>`,
        // width: `${canvas.width + 50}px`,
        width: `450px`,
        showCloseButton: true,
        showConfirmButton: false,
        didOpen: () => {
          const modalCanvas = document.getElementById("pdf-preview-canvas") as HTMLCanvasElement;
          if (modalCanvas) {
            const modalCtx = modalCanvas.getContext("2d");
            if (modalCtx) {
              modalCtx.drawImage(canvas, 0, 0);
            }
          }
        },
      });
    }
  } catch (err) {
    ReactSwal.fire({
      icon: "error",
      title: "Error",
      text: "Could not load the PDF preview.",
    });
    console.error(err);
  }
};


const ReactSwal = withReactContent(Swal);

export default function FileContainer({ 
    handleDrag: [isDragging, handleDragOver, handleDragLeave], 
    stackPdfs: [stackPdfs, setStackPdfs],
    refs: [pdfInputRef, pdfCanvasRef] 
}: any) {

    const handleDeletePdf = () => {
        setStackPdfs([]);
        if (pdfCanvasRef.current) {
            const context = pdfCanvasRef.current.getContext("2d");
            if (context) {
            context.clearRect(0, 0, pdfCanvasRef.current.width, pdfCanvasRef.current.height);
            }
        }
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
        setStackPdfs((prev) => [...prev, ...validFiles]);
      }
    
      if (pdfInputRef.current) pdfInputRef.current.value = "";
    };

    return (
      <>
        {stackPdfs.length === 0 ? (
              <div
                className={`upload-placeholder ${isDragging ? "dragging" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
               <input
                 type="file"
                 id="pdfInput"
                 className="file-input"
                 name="pdf"
                 ref={pdfInputRef}
                 onChange={handlePdfChange}
                 accept="application/pdf"
                 multiple // ← This enables selecting multiple files
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
                <div className="addButton">             
                <button className="pdfAddBtn">
                <div
                className={`upload-placeholder-pdf ${isDragging ? "dragging" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                >
             <input
               type="file"
               id="pdfInput"
               className="file-input"
               name="pdf"
               ref={pdfInputRef}
               onChange={handlePdfChange}
               accept="application/pdf"
               multiple // ← This enables selecting multiple files
             />

            <label htmlFor="pdfInput" className="upload-label ">
                <svg 
                version="1.1" 
                xmlns="http://www.w3.org/2000/svg" 
                width="14" 
                height="14">
                <path d="M0 0 C0.66 0 1.32 0 2 0 C2 1.98 2 3.96 2 6 C3.98 6 5.96 6 8 6 C8 6.66 8 7.32 8 8 C6.02 8 4.04 8 2 8 C2 9.98 2 11.96 2 14 C1.34 14 0.68 14 0 14 C0 12.02 0 10.04 0 8 C-1.98 8 -3.96 8 -6 8 C-6 7.34 -6 6.68 -6 6 C-4.02 6 -2.04 6 0 6 C0 4.02 0 2.04 0 0 Z " 
                fill="#494949" 
                transform="translate(6,0)"
                />
                </svg>
                </label>
              </div>
              Add
              </button>
              </div>       

              {stackPdfs.map((file, idx) => (
              <div  className="pdf-file-name">
            
       <div className="pdf-Icon-Name">
         <svg
            className="PdfIcon"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path
              d="M8.267 14.68c-.184 0-.308.018-.372.036v1.178c.076.018.171.023.302.023.479 0 .774-.242.774-.651 0-.366-.254-.586-.704-.586zm3.487.012c-.2 0-.33.018-.407.036v2.61c.077.018.201.018.313.018.817.006 1.349-.444 1.349-1.396.006-.83-.479-1.268-1.255-1.268z"
            ></path>
            <path
            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM9.498 16.19c-.309.29-.765.42-1.296.42a2.23 2.23 0 0 1-.308-.018v1.426H7v-3.936A7.558 7.558 0 0 1 8.219 14c.557 0 .953.106 1.22.319.254.202.426.533.426.923-.001.392-.131.723-.367.948zm3.807 1.355c-.42.349-1.059.515-1.84.515-.468 0-.799-.03-1.024-.06v-3.917A7.947 7.947 0 0 1 11.66 14c.757 0 1.249.136 1.633.426.415.308.675.799.675 1.504 0 .763-.279 1.29-.663 1.615zM17 14.77h-1.532v.911H16.9v.734h-1.432v1.604h-.906V14.03H17v.74zM14 9h-1V4l5 5h-4z"
            fill="#d9534f"
          ></path>
        </svg>
        <div  key={idx} 
              onClick={() => handlePreviewPdf(file)} 
              style={{ cursor: "pointer" }}
              className="File-Name">{file.name.split('.')[0]}</div>
        </div>
       <div>
        <small>{(Math.round((file.size / 1024 / 1024) * 100) / 100)} MB</small>
       </div>
     <div>
        <progress className="Progress-Bar" value={1} />
     </div>
    <div>
     <button
       className="pdf-Delete-Btn"
       onClick={() => {
       setStackPdfs((prev) => prev.filter((_, i) => i !== idx));
       }}
        >
       <svg
       width="21"
       height="21"
       viewBox="0 0 21 21"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
      >
    <path
       d="M16.9747 5.4375L16.4661 13.6655C16.3361 15.7677 16.2711 16.8188 15.7442 17.5745C15.4836 17.9481 15.1483 18.2635 14.7593 18.5004C13.9725 18.9797 12.9194 18.9797 10.8131 18.9797C8.70418 18.9797 7.64968 18.9797 6.86238 18.4995C6.47314 18.2621 6.13762 17.9462 5.87719 17.572C5.35044 16.8151 5.28689 15.7625 5.1598 13.6574L4.66357 5.4375"
       stroke="#FF0000"
       strokeWidth="1.41891"
       strokeLinecap="round"
    />
    <path
       d="M3.43262 5.439H18.206M14.148 5.439L13.5877 4.28317C13.2155 3.5154 13.0294 3.1315 12.7084 2.89208C12.6372 2.83897 12.5618 2.79173 12.4829 2.75083C12.1275 2.56641 11.7008 2.56641 10.8476 2.56641C9.97294 2.56641 9.53565 2.56641 9.17426 2.75856C9.09417 2.80115 9.01774 2.8503 8.94577 2.90551C8.62104 3.15463 8.43965 3.55257 8.07687 4.34845L7.57975 5.439"
       stroke="#FF0000"
       strokeWidth="1.41891"
       strokeLinecap="round"
    />
    <path
       d="M8.76562 14.4655V9.54102"
       stroke="#FF0000"
       strokeWidth="1.41891"
       strokeLinecap="round"
    />
    <path
       d="M12.8726 14.4655V9.54102"
       stroke="#FF0000"
       strokeWidth="1.41891"
       strokeLinecap="round"
      />
      </svg>
     </button>
    </div>
  </div>
  ))}
</div>
)}
</>

    )
  }