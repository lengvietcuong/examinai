import React from 'react';
import Message from './Message';


interface EssaySubmissionInstructionProps {
    taskType: string;
}

const EssaySubmissionInstruction: React.FC<EssaySubmissionInstructionProps> = ({ taskType }) => {
    return (
        <Message role="assistant">
            <p>
                Please submit the essay question and your essay. I will assess it and provide detailed feedback.
                <br />
                <br />
                Don't know where to find {taskType} questions? Check out <a href="https://study4.com/tests/?term=IELTS+Writing" target="_blank" rel="noopener noreferrer">Study4</a>.
            </p>
        </Message>
    );
}

export default EssaySubmissionInstruction;