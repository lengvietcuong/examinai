import bandDescriptors from '@/public/bandDescriptors.json';

function toTitleCase(str: string): string {
    return str
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export default function getBandDescriptorsString(skill: 'writing', taskType: 'task_2'): string {
    const skillCriteria = bandDescriptors[skill][taskType];
    let formattedString = "";

    for (const [criterion, bands] of Object.entries(skillCriteria)) {
        formattedString += `${toTitleCase(criterion)}:`;
        for (const [band, description] of Object.entries(bands)) {
            formattedString += `\n${toTitleCase(band)}\n${description}:`;
        }
        formattedString += '\n\n';
    }

    return formattedString;
}