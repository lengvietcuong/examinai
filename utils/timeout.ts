function timeout(ms: number): Promise<never> {
    return new Promise((_, reject) => {
        setTimeout(() => {
            reject(new Error("Request timed out."));
        }, ms);
    });
}

export default timeout;