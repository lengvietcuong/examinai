import React from 'react';

export function stylize(text: string): JSX.Element {
    // Split the text into parts by double asterisks or underscores
    const parts = text.split(/(\*\*.*?\*\*|_.*?_)/g);

    // Map each part to a JSX element
    const elements = parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            // If the part is wrapped in double asterisks, return it as bold text
            return <strong key={index}>{part.slice(2, -2)}</strong>;
        } else if (part.startsWith('_') && part.endsWith('_')) {
            // If the part is wrapped in underscores, return it as italic text
            return <em key={index}>{part.slice(1, -1)}</em>;
        } else {
            // Otherwise, return the part as normal text
            return part;
        }
    });

    // Return the elements as a single JSX element
    return <>{elements}</>;
}