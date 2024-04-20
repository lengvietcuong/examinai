'use client';

import React from 'react';
import SpeakingPart1Icon from './icons/SpeakingPart1Icon';
import SpeakingPart2Icon from './icons/SpeakingPart2Icon';
import SpeakingPart3Icon from './icons/SpeakingPart3Icon';
import WritingTask1Icon from './icons/WritingTask1Icon';
import WritingTask2Icon from './icons/WritingTask2Icon';
import { useSkillStore } from '@/stores/skillStore';
import styles from './SkillSelection.module.css';


const SkillSelection: React.FC = () => {
    const { selectedSkill, setSelectedSkill } = useSkillStore((state) => ({ selectedSkill: state.selectedSkill, setSelectedSkill: state.setSelectedSkill }));
    const handleTabChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!selectedSkill) {
            setSelectedSkill(event.target.value);
        }
    };

    return (
        <div className={styles.skillsContainer}>
            <input
                className={styles.skillInput}
                id="speakingPart1"
                type="radio"
                name="skill"
                value="Speaking Part 1"
                checked={selectedSkill === 'Speaking Part 1'}
                onChange={handleTabChange}
            />
            <input
                className={styles.skillInput}
                id="speakingPart2"
                type="radio"
                name="skill"
                value="Speaking Part 2"
                checked={selectedSkill === 'Speaking Part 2'}
                onChange={handleTabChange}
            />
            <input
                className={styles.skillInput}
                id="speakingPart3"
                type="radio"
                name="skill"
                value="Speaking Part 3"
                checked={selectedSkill === 'Speaking Part 3'}
                onChange={handleTabChange}
            />
            <input
                className={styles.skillInput}
                id="writingTask1"
                type="radio"
                name="skill"
                value="Writing Task 1"
                checked={selectedSkill === 'Writing Task 1'}
                onChange={handleTabChange}
            />
            <input
                className={styles.skillInput}
                id="writingTask2"
                type="radio"
                name="skill"
                value="Writing Task 2"
                checked={selectedSkill === 'Writing Task 2'}
                onChange={handleTabChange}
            />

            <div className={styles.labelsContainer}>
                <label className={`${styles.label} ${selectedSkill === 'Speaking Part 1' ? styles.selected : selectedSkill ? styles.unselected : ''}`} htmlFor="speakingPart1">
                    <SpeakingPart1Icon className={styles.skillIcon} />
                    Speaking Part 1
                </label>
                <label className={`${styles.label} ${selectedSkill === 'Speaking Part 2' ? styles.selected : selectedSkill ? styles.unselected : ''}`} htmlFor="speakingPart2">
                    <SpeakingPart2Icon className={styles.skillIcon} />
                    Speaking Part 2
                </label>
                <label className={`${styles.label} ${selectedSkill === 'Speaking Part 3' ? styles.selected : selectedSkill ? styles.unselected : ''}`} htmlFor="speakingPart3">
                    <SpeakingPart3Icon className={styles.skillIcon} />
                    Speaking Part 3
                </label>
                <label className={`${styles.label} ${selectedSkill === 'Writing Task 1' ? styles.selected : selectedSkill ? styles.unselected : ''}`} htmlFor="writingTask1">
                    <WritingTask1Icon className={styles.skillIcon} />
                    Writing Task 1
                </label>
                <label className={`${styles.label} ${selectedSkill === 'Writing Task 2' ? styles.selected : selectedSkill ? styles.unselected : ''}`} htmlFor="writingTask2">
                    <WritingTask2Icon className={styles.skillIcon} />
                    Writing Task 2
                </label>
            </div>
        </div>
    );
};

export default SkillSelection;