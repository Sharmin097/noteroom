import { MCQ } from "../pages/upload-note/UploadNote"

export enum MCQActions { ADD, DELETE, CHANGE_QUESTION_TEXT, CHANGE_OPTION_TEXT, CHANGE_CORRECT_ANSWER }
export default function mcqReducer(mcqs: MCQ[], actions: { type: MCQActions, payload?: any } ) {
    switch(actions.type) {
        case MCQActions.ADD:
            return [...mcqs, ...actions.payload.mcqs]
        case MCQActions.DELETE:
            return mcqs.filter(mcq => mcq.questionID !== actions.payload.questionID)
        case MCQActions.CHANGE_QUESTION_TEXT:
            return mcqs.map(mcq => {
                if (mcq.questionID === actions.payload.questionID) return { ...mcq, question: actions.payload.question }
                return mcq
            })
        case MCQActions.CHANGE_OPTION_TEXT:
            return mcqs.map(mcq => {
                if (mcq.questionID === actions.payload.questionID) {
                    const options = mcq.options.map(option => {
                        if (option.optionID === actions.payload.optionID) return { ...option, optionText: actions.payload.optionText }
                        return option
                    })
                    return { ...mcq, options: options }
                } 
                return mcq
            })
        case MCQActions.CHANGE_CORRECT_ANSWER:
            return mcqs.map(mcq => {
                if (mcq.questionID === actions.payload.questionID) return { ...mcq, correctAnswer: actions.payload.correctAnswer }
                return mcq
            })
        default:
            return mcqs
    }
}