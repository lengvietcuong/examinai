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
    bandScores: string;
}

const BandScores: React.FC<BandScoresProps> = ({ bandScores }) => {
    function extractCriteriaAndScores(input: string): { [key: string]: number } {
        const result: { [key: string]: number } = {};
        const lines = input.split('\n');
        for (let line of lines) {
            const match = line.match(/^[^a-zA-Z]*(.*): (?:Band )?(\d)\D*$/);
            if (match) {
                const criterion = match[1].trim();
                const score = parseInt(match[2]);
                result[criterion] = score;
            }
        }
        return result;
    }
    const scores = extractCriteriaAndScores(bandScores);
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    const rawOverallScore = totalScore / Object.keys(scores).length;
    const remainder = rawOverallScore % 1;
    let overallScore;

    if (remainder <= 0.25) {
        overallScore = Math.floor(rawOverallScore);
    } else if (remainder <= 0.75) {
        overallScore = Math.floor(rawOverallScore) + 0.5;
    } else {
        overallScore = Math.ceil(rawOverallScore);
    }

    return (
        <div className={`${styles.bandScoresContainer} ${montserrat.className}`}>
            <div className={styles.criteria}>
                {Object.keys(scores).map((criterion, index) => (
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
                        <span className={styles.score}>{scores[criterion].toFixed(1)}</span>
                        <a href="https://takeielts.britishcouncil.org/sites/default/files/ielts_writing_band_descriptors.pdf" target="_blank" rel="noopener noreferrer">
                            <QuestionIcon className={`${styles.icon} ${styles.questionIcon} ${styles.fill}`} />
                        </a>
                    </div>
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