import React from 'react';
import OriginalEssayIcon from '../../icons/OriginalEssayIcon';
import CorrectedEssayIcon from '../../icons/CorrectedEssayIcon';
import { montserrat } from '@/fonts/fonts';
import styles from './SideBySideCorrection.module.css';

export interface SideBySideCorrectionProps {
    leftContent: string;
    rightContent: string;
}

const SideBySideCorrection: React.FC<SideBySideCorrectionProps> = ({ leftContent, rightContent }) => {
    const highlightChanges = (text: string) => {
        const regex = /(\*[^*]+\*)|(\#[^#]+\#)|([^\*#]+)/g;
        let match;
        let result = [];

        while ((match = regex.exec(text)) !== null) {
            let segment = match[0];
            if (segment.startsWith('#') && segment.endsWith('#')) {
                const displayText = segment.slice(1, -1);
                result.push(<span key={match.index} className={styles.mistake}>{displayText}</span>);
            } else if (segment.startsWith('*') && segment.endsWith('*')) {
                const cleanedSegment = segment.slice(1, -1);
                result.push(<span key={match.index} className={styles.correction}>{cleanedSegment}</span>);
            } else {
                result.push(segment);
            }
        }

        return result;
    };

    function formatContent(content: string) {
        return content.split('\n').map((item, key) => {
            return <React.Fragment key={key}>{highlightChanges(item)}<br /></React.Fragment>
        });
    }

    return (
        <div className={styles.sideBySideContainer}>
            <div>
                <div className={styles.labelContainer}>
                    <OriginalEssayIcon className={`${styles.icon} ${styles.stroke}`} />
                    <h3 className={`${styles.title} ${montserrat.className}`}>Original</h3>
                </div>
                <p className={styles.content}>{formatContent(leftContent)}</p>
            </div>
            <hr className={styles.separator} />
            <div>
                <div className={styles.labelContainer}>
                    <CorrectedEssayIcon className={`${styles.icon} ${styles.fill}`} />
                    <h3 className={`${styles.title} ${montserrat.className}`}>Corrected</h3>
                </div>
                <p className={styles.content}>{formatContent(rightContent)}</p>
            </div>
        </div>
    );
};

export default SideBySideCorrection;
