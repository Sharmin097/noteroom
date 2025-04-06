import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const ReactSwal = withReactContent(Swal);

export default function MCQContainer({ mcqs: [mcqs, setMcqs] }: any) {
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

    const handleMcqChange = (index: number, field: any, value: string | string[] | null) => {
        setMcqs((prev) =>
            prev.map((mcq, i) =>
                i === index ? { ...mcq, [field]: value } : mcq
            )
        );
    };

    const handleDeleteMcq = (index: number) => {
        setMcqs((prev) => prev.filter((_, i) => i !== index));
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

    return (
      <>
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
      </>
    )
  }
  