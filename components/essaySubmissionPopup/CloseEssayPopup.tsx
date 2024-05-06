'use client';

import React from 'react';
import CloseIcon from '../icons/CloseIcon';
import { useSkillStore } from '@/stores/skillStore';
import styles from './CloseEssayPopup.module.css';

const CloseEssayPopup: React.FC = () => {
    const setSelectedSkill = useSkillStore((state) => state.setSelectedSkill);

    return (
        <button onClick={() => setSelectedSkill(null)} className={styles.closeButton}>
            <CloseIcon className={styles.closeIcon} />
        </button>
    );
}

export default CloseEssayPopup;