import React from "react";
import ReactMarkdown from 'react-markdown';

interface StylizedTextProps {
	text: string;
}

const StylizedText: React.FC<StylizedTextProps> = ({ text }) => {
	return <div>
		<ReactMarkdown>{text}</ReactMarkdown>
	</div>
};

export default StylizedText;