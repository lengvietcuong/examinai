import React from 'react';
import Message from './Message';
import styles from './TextMessage.module.css';

export interface EssaySubmissionMessageProps {
    essayQuestion: string;
    essay: string;
}

const EssaySubmissionMessage: React.FC<EssaySubmissionMessageProps> = ({ essayQuestion, essay }) => {
    const formattedEssay = essay.split('\n').map((item, key) => {
        return <React.Fragment key={key}>{item}<br /></React.Fragment>
    });

    return (
        <Message role='user'>
            <p className={styles.content}>
                <strong><em>{essayQuestion}</em></strong>
                <br />
                <br />
                {formattedEssay}
            </p>
        </Message>
    );
};

export default EssaySubmissionMessage;
