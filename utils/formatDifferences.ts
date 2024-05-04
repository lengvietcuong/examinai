import { diffWords } from "diff";

const formatDifferences = (original: string, modified: string) => {
    const changes = diffWords(original, modified);
    const removals = changes.map(change => {
        if (change.removed && change.value !== '\n') {
            return `#${change.value}#`;
        }
        if (change.added) {
            return '';
        }
        return change.value;
    }).join('').replace(/# #/g, ' ');

    const additions = changes.map(change => {
        if (change.added && change.value !== '\n') {
            return `*${change.value}*`;
        }
        if (change.removed) {
            return '';
        }
        return change.value;
    }).join('').replace(/\* \*/g, ' ');

    return { removals, additions };
}

export default formatDifferences;