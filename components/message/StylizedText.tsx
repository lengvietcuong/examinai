import React from "react";

interface StylizedTextProps {
  text: string;
}

const StylizedText: React.FC<StylizedTextProps> = ({ text }) => {
    const stylize = (text: string) => {
        const regex = /(\*\*[^*]+\*\*)|(_[^_]+_)|([^\*_]+)/g;
        let match;
        let result = [];

        while ((match = regex.exec(text)) !== null) {
            let segment = match[0];
            if (segment.startsWith('**') && segment.endsWith('**')) {
                const displayText = segment.slice(2, -2);
                result.push(<strong key={match.index}>{displayText}</strong>);
            } else if (segment.startsWith('_') && segment.endsWith('_')) {
                const cleanedSegment = segment.slice(1, -1);
                result.push(<em key={match.index}>{cleanedSegment}</em>);
            } else {
                result.push(segment);
            }
        }

        return result;
    };

    return <p>{stylize(text)}</p>;
};

export default StylizedText;