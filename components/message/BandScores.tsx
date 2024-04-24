import React from 'react';
import Message from './Message';
import styles from './BandScores.module.css';

export interface BandScoresProps {
    bandScores: { criterion: string, score: number }[];
}

const BandScores: React.FC<BandScoresProps> = ({ bandScores }) => {
    return (
        <Message role='assistant'>
            
        </Message>
    );
};

export default BandScores;