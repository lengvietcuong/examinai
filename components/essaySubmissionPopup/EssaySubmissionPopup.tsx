import React from 'react';
import EssayForm from './EssayForm';
import CloseEssayPopup from './CloseEssayPopup';
import styles from './EssaySubmissionPopup.module.css';

interface EssaySubmissionPopupProps {
    taskType: string;
}

const EssaySubmissionPopup: React.FC<EssaySubmissionPopupProps> = ({ taskType }) => {
    return (
        <>
            <div className={styles.popupContainer}>
                <CloseEssayPopup />
                <p className={styles.instructions}>
                    Please submit the essay question and your essay. I will assess it and provide detailed feedback.
                    <br />
                    Don't know where to find {taskType} questions? Check out <a href="https://study4.com/tests/?term=IELTS+Writing" target="_blank" rel="noopener noreferrer">Study4</a>.
                </p>
                <EssayForm />
            </div>
            <div className={styles.overlay}></div>
        </>
    );
}

export default EssaySubmissionPopup;