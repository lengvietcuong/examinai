'use client';

import React, { useState, useEffect } from "react";
import Message from "./Message";
import SkillSelection from "../SkillSelection";
import useConversationStore from "@/stores/conversationStore";
import styles from './Greeting.module.css';

const Greeting: React.FC = () => {
	const text = `Hi! I'm your IELTS examiner, here to help you prepare for your test.\nI'm an imperfect AI, so mistakes are possible.\n\nWhat would you like to practice?`;
	const delay = 3.5;
	const [currentIndex, setCurrentIndex] = useState(0);
	const isNewConversation = useConversationStore(state => state.isNewConversation);

	useEffect(() => {
		if (currentIndex < text.length) {
			const timeout = setTimeout(() => {
				setCurrentIndex(prevIndex => prevIndex + 1);
			}, delay);

			return () => clearTimeout(timeout);
		}
	}, [currentIndex]);

	const visibleText = text.slice(0, currentIndex);
	const hiddenText = text.slice(currentIndex);

	return isNewConversation && (
		<Message role="assistant">
			<p>
				<span>{visibleText}</span>
				<span className={styles.hiddenText}>{hiddenText}</span>
			</p>
			{currentIndex === text.length && <SkillSelection />}
		</Message>
	);
}

export default Greeting;