import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { MCQ } from "./UploadNote";
import { MCQActions } from "../../reducers/mcqReducer";

const ReactSwal = withReactContent(Swal);

function MCQItem({ mcq, index, handlers: [handleDeleteMcq, handleQuestionTextChange, handleOptionTextChange, handleCorrectAnswerChange] }: { mcq: MCQ, index: number, handlers: any[] }) {
	return (
		<div className="mcq-item">
			<div className="mcq-header">
				<h3>Question { index + 1 } </h3>
				<button
					className="mcq-delete-btn"
					onClick={() => handleDeleteMcq(mcq.questionID)}
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
					onChange={(e) => handleQuestionTextChange(mcq.questionID, e.target.value)}
					maxLength={500}
				/>
			</div>
			<div className="mcq-options">
				{mcq.options.map((option) => (
					<div key={option.optionID} className="mcq-option">
						<label>{option.optionType}.</label>
						<input
							key={`option-text-${option.optionID}`}
							type="text"
							placeholder={`Option ${option.optionType}`}
							value={option.optionText}
							onChange={(e) => handleOptionTextChange(mcq.questionID, option.optionID, e.target.value)}
							maxLength={200}
						/>
					</div>
				))}
			</div>
			<div className="mcq-correct-answer">
				<label>Correct Answer:</label>
				<select 
					value={mcq.correctAnswer || ""} 
					onChange={(e) => handleCorrectAnswerChange(mcq.questionID, e.target.value)}
				>
				<option value="" disabled>Select correct answer</option>
				{ mcq.options.map(option => {
					return <option key={`option-${option.optionID}`} value={option.optionType}>{ option.optionType }</option>
				}) }
				</select>
			</div>
        </div>
	)
}

export default function MCQContainer({ mcqs: [mcqs, dispatch] }: { mcqs: [MCQ[], any]}) {
    const handleAddMcq = () => {
        if (mcqs.length >= 30) {
            ReactSwal.fire({
                icon: "error",
                title: "Limit Reached",
                text: "You can only add up to 30 MCQs.",
            });
            return;
        }

        const questionID = crypto.randomUUID()

        dispatch({ type: MCQActions.ADD, payload: { mcqs: [
          {
            question: "",
            questionID: questionID,
            options: Array.from(["A", "B", "C", "D"], optionType => {
				return { optionType: optionType, optionText: "", optionID: `${questionID}:${optionType}`}
			}),
            correctAnswer: null
          }
        ] } })
    };

    const handleQuestionTextChange = (questionID: string, value: string) => {
		dispatch({ type: MCQActions.CHANGE_QUESTION_TEXT, payload: { questionID: questionID, question: value } })
	}

	const handleOptionTextChange = (questionID: string, optionID: string, value: string) => {
		dispatch({ type: MCQActions.CHANGE_OPTION_TEXT, payload: { questionID: questionID, optionID: optionID, optionText: value } })
	}

	const handleCorrectAnswerChange = (questionID: string, correctAnswer: string) => {
		dispatch({ type: MCQActions.CHANGE_CORRECT_ANSWER, payload: { questionID: questionID, correctAnswer: correctAnswer } })
	}

    const handleDeleteMcq = (questionID: string) => {
        dispatch({ type: MCQActions.DELETE, payload: { questionID: questionID } })
    };

    return (
        <div className="mcq-container">
			{mcqs.length === 0 ? (
				<div className="mcq-placeholder">
					<span>No MCQs added yet. Click below to add a question.</span>
				</div>
			) : (
				mcqs.map((mcq, index) => (
					<MCQItem key={`mcq-${mcq.questionID}`} mcq={mcq} index={index} handlers={[handleDeleteMcq, handleQuestionTextChange, handleOptionTextChange, handleCorrectAnswerChange]} />
				))
			)}
			<button className="add-mcq-btn" onClick={handleAddMcq}>Add Question</button>
		</div>
    )
  }
  