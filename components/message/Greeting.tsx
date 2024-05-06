'use client';

import React, { useState, useEffect } from "react";
import Message from "./Message";
import SkillSelection from "../SkillSelection";
import useConversationStore from "@/stores/conversationStore";

const Greeting: React.FC = () => {
    const text = `Hi! I'm your IELTS examiner, here to help you prepare for your test.\nI'm an imperfect AI, so mistakes are possible.\n\nPlease select what you'd like to practice:`;
    const delay = 7.5;
    const [currentText, setCurrentText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const isNewConversation = useConversationStore(state => state.isNewConversation);

    useEffect(() => {
        if (currentIndex < text.length) {
          const timeout = setTimeout(() => {
            setCurrentText(prevText => prevText + text[currentIndex]);
            setCurrentIndex(prevIndex => prevIndex + 1);
          }, delay);
      
          return () => clearTimeout(timeout);
        }
      }, [currentIndex]);

    return isNewConversation && (
        <Message role="assistant">
            <p>{currentText}</p>
            {currentIndex === text.length && <SkillSelection />}
        </Message>
    );
}

export default Greeting;