import React from 'react';
import TargetIcon from '../icons/TargetIcon';
import StructureIcon from '../icons/StructureIcon';
import BookIcon from '../icons/BookIcon';
import LinkIcon from '../icons/LinkIcon';
import SigmaIcon from '../icons/SigmaIcon';
import QuestionIcon from '../icons/QuestionIcon';
import { montserrat } from '@/fonts/fonts';
import styles from './BandScores.module.css';

export interface BandScoresProps {
    bandScores: { [key: string]: number }
}

const BandScores: React.FC<BandScoresProps> = ({ bandScores }) => {
    const totalScore = Object.values(bandScores).reduce((a, b) => a + b, 0);
    const rawOverallScore = totalScore / Object.keys(bandScores).length;
    const remainder = rawOverallScore % 1;
    let overallScore;

    if (remainder <= 0.25) {
        overallScore = Math.floor(rawOverallScore);
    } else if (remainder <= 0.75) {
        overallScore = Math.floor(rawOverallScore) + 0.5;
    } else {
        overallScore = Math.ceil(rawOverallScore);
    }

    const criteriaOrder = ['Task Response', 'Task Achievement', 'Coherence & Cohesion', 'Lexical Resource', 'Grammatical Range & Accuracy'];

    return (
        <div className={`${styles.bandScoresContainer} ${montserrat.className}`}>
            <div className={styles.criteria}>
                {criteriaOrder.map((criterion, index) => (
                    bandScores[criterion] !== undefined && (
                        <div key={index} className={styles.criterion}>
                            {criterion === 'Task Response' || criterion === 'Task Achievement' ? (
                                <TargetIcon className={`${styles.icon} ${styles.fill}`} />
                            ) : criterion === 'Coherence & Cohesion' ? (
                                <StructureIcon className={`${styles.icon} ${styles.fill}`} />
                            ) : criterion === 'Lexical Resource' ? (
                                <BookIcon className={`${styles.icon} ${styles.fill}`} />
                            ) : criterion === 'Grammatical Range & Accuracy' ? (
                                <LinkIcon className={`${styles.icon} ${styles.stroke}`} />
                            ) : null}
                            <h3 className={styles.title}>{criterion}</h3>
                            <span className={styles.score}>{bandScores[criterion].toFixed(1)}</span>
                            <a href="https://takeielts.britishcouncil.org/sites/default/files/ielts_writing_band_descriptors.pdf" target="_blank" rel="noopener noreferrer">
                                <QuestionIcon className={`${styles.icon} ${styles.questionIcon} ${styles.fill}`} />
                            </a>
                        </div>
                    )
                ))}
            </div>
            <hr className={styles.separator} />
            <div className={`${styles.criterion} ${styles.overallScore}`}>
                <SigmaIcon className={`${styles.icon} ${styles.fill}`} />
                <h3 className={styles.title}>Overall</h3>
                <span className={styles.score}>{overallScore.toFixed(1)}</span>
                <a href="https://www.youtube.com/watch?v=IiPMWo4Z9Qs" target="_blank" rel="noopener noreferrer">
                    <QuestionIcon className={`${styles.icon} ${styles.questionIcon} ${styles.fill}`} />
                </a>
            </div>
        </div>
    );
};

export default BandScores;