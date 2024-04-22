import React from 'react';
import Message from './Message';
import styles from './GradeMessage.module.css';

export interface GradeMessageProps {
    bandScores: { criterion: string, score: number }[];
}

const GradeMessage: React.FC<GradeMessageProps> = ({ bandScores }) => {
    return (
        <Message role='assistant'>
            
        </Message>
    );
};

export default GradeMessage;