import React, { useEffect } from 'react';
import useSkillStore from '@/stores/skillStore';
import EssayForm from './EssayForm';
import CloseIcon from '../icons/CloseIcon';
import styles from './EssaySubmissionPopup.module.css';

const EssaySubmissionPopup: React.FC = () => {
    const { selectedSkill, setSelectedSkill } = useSkillStore((state) => ({ selectedSkill: state.selectedSkill, setSelectedSkill: state.setSelectedSkill }));
    const [closeButtonClicked, setCloseButtonClicked] = React.useState(false);
    const fade = closeButtonClicked ? styles.fadeOut : styles.fadeIn;

    useEffect(() => {
        if (closeButtonClicked) {
            setTimeout(() => {
                setSelectedSkill(null);
                setCloseButtonClicked(false);
            }, 150);
        }
    }, [closeButtonClicked]);

    return selectedSkill?.startsWith('Writing') && (
        <>
            <div className={`${styles.popupContainer} ${fade}`}>
                <button onClick={() => setCloseButtonClicked(true)} className={styles.closeButton}>
                    <CloseIcon className={styles.closeIcon} />
                </button>
                <p className={styles.instructions}>
                    Please submit the essay question and your essay. I will assess it and provide detailed feedback.
                    <br />
                    Don't know where to find {selectedSkill} questions? Check out <a href="https://study4.com/tests/?term=IELTS+Writing" target="_blank" rel="noopener noreferrer">Study4</a>.
                </p>
                <EssayForm />
            </div>
            <div className={`${styles.overlay} ${fade}`}></div>
        </>
    );
}

export default EssaySubmissionPopup;