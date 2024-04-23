import React from 'react';
import Message from './Message';
import OriginalEssayIcon from '../icons/OriginalEssayIcon';
import CorrectedEssayIcon from '../icons/CorrectedEssayIcon';
import { montserrat } from '@/fonts/fonts';
import styles from './SideBySideMessage.module.css';

export interface SideBySideMessageProps {
    leftContent: string;
    rightContent: string;
}

const SideBySideMessage: React.FC<SideBySideMessageProps> = ({ leftContent, rightContent }) => {
    const applyStyles = (text: string) => {
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
            return <React.Fragment key={key}>{applyStyles(item)}<br /></React.Fragment>
        });
    }

    return (
        <Message role='assistant'>
            <div className={styles.sideBySideContainer}>
                <div>
                    <div className={styles.labelContainer}>
                        <OriginalEssayIcon className={`${styles.icon} ${styles.stroke}`} />
                        <h2 className={`${styles.title} ${montserrat.className}`}>Original</h2>
                    </div>
                    <p className={styles.content}>{formatContent(leftContent)}</p>
                </div>
                <hr className={styles.separator} />
                <div>
                    <div className={styles.labelContainer}>
                        <CorrectedEssayIcon className={`${styles.icon} ${styles.fill}`} />
                        <h2 className={`${styles.title} ${montserrat.className}`}>Corrected</h2>
                    </div>
                    <p className={styles.content}>{formatContent(rightContent)}</p>
                </div>
            </div>
        </Message>
    );
};

export default SideBySideMessage;
