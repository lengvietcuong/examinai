const extractBandScores = (input: string): { [key: string]: number } => {
    const result: { [key: string]: number } = {};
    const lines = input.split('\n');
    for (let line of lines) {
        const match = line.match(/^[^a-zA-Z]*(.*): (?:Band )?(\d)\D*$/);
        if (match) {
            const criterion = match[1].trim();
            const score = parseInt(match[2]);
            result[criterion] = score;
        }
    }
    return result;
}

export default extractBandScores;