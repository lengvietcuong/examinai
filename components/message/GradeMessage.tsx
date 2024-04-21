import React from 'react';
import Message from './Message';
import styles from './GradeMessage.module.css';

export interface GradeMessageProps {
    role: 'user' | 'assistant';
    bandScores: { criterion: string, score: number }[];
}

const GradeMessage: React.FC<GradeMessageProps> = ({ role, bandScores }) => {
    return (
        <Message role={role}>
            
        </Message>
    );
};

export default GradeMessage;