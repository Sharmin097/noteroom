import { useState } from "react";
import { FaRotateRight, FaRotateLeft } from "react-icons/fa6";

export default function ImageUploadContainer({ 
    refs: [fileInputRef],
    stackFiles: [stackFiles, setStackFiles],
    handleDrag: [isDragging, handleDragOver, handleDragLeave, handleDrop]
}: any) {

    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
    const [imageRotations, setImageRotations] = useState<number[]>([]);
    const [showEditOptions, setShowEditOptions] = useState<boolean>(false);

    const rotateClockwise = () => {
        setImageRotations((prev) => {
            const newRotations = [...prev];
            newRotations[currentImageIndex] = (newRotations[currentImageIndex] + 90) % 360;
            return newRotations;
        });
    };

    const rotateCounterClockwise = () => {
        setImageRotations((prev) => {
            const newRotations = [...prev];
            newRotations[currentImageIndex] = (newRotations[currentImageIndex] - 90 + 360) % 360;
            return newRotations;
        });
    };

    const toggleEditOptions = () => {
        setShowEditOptions(!showEditOptions);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : [];
        setStackFiles((prev) => [...prev, ...files]);
        setImageRotations(prev => [...prev, ...Array(files.length).fill(0)]);
        setCurrentImageIndex(0);

        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleDeleteImage = (index: number) => {
        setStackFiles((prev) => prev.filter((_, i) => i !== index));
        if (currentImageIndex >= stackFiles.length - 1) {
            setCurrentImageIndex(Math.max(0, stackFiles.length - 2));
        }
        if(stackFiles.length <= 1){
            setShowEditOptions(false);

        }
    };

    return (
      <>
        <div className="upload-container">
            { stackFiles.length === 0 ? (
              <div
                className={`upload-placeholder ${isDragging ? "dragging" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
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
                    <button className="action-btn add-btn" onClick={() => fileInputRef.current?.click()} disabled={showEditOptions}>
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
                    <button
                      className={`action-btn ${showEditOptions ? 'close-btn' : 'edit-btn'}`}
                      onClick={toggleEditOptions}
                    >
                      {showEditOptions ? (
                        <>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Close
                        </>
                      ) : (
                        <>
                          <svg width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                              d="M12.75 2.75023C12.947 2.55324 13.1808 2.39699 13.4382 2.29038C13.6956 2.18378 13.9714 2.12891 14.25 2.12891C14.5286 2.12891 14.8044 2.18378 15.0618 2.29038C15.3192 2.39699 15.553 2.55324 15.75 2.75023C15.947 2.94721 16.1032 3.18106 16.2098 3.43843C16.3165 3.6958 16.3713 3.97165 16.3713 4.25023C16.3713 4.5288 16.3165 4.80465 16.2098 5.06202C16.1032 5.31939 15.947 5.55324 15.75 5.75023L5.625 15.8752L1.5 17.0002L2.625 12.8752L12.75 2.75023Z"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Edit
                        </>
                      )}
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
                    onClick={() => setCurrentImageIndex((prev) => Math.max(0, prev - 1))}
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
                    style={{ transform: `rotate(${imageRotations[currentImageIndex] || 0}deg)` }}
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
                    onClick={() => setCurrentImageIndex((prev) => Math.min(stackFiles.length - 1, prev + 1)) }
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
            ) }
        </div>
        {showEditOptions && (
          <div className="edit-options">
            <button className="rotate-btn rotate-left" onClick={rotateCounterClockwise}>
              <FaRotateLeft />
            </button>
            <button className="rotate-btn rotate-right" onClick={rotateClockwise}>
              <FaRotateRight />
            </button>
          </div>
        )}
      </>
    )
  }