'use server';

import { createClient } from '@deepgram/sdk';

export async function getDeepgramTemporaryKey() {
    if (!process.env.DEEPGRAM_API_KEY) {
        throw new Error('DEEPGRAM_API_KEY is not set');
    }

    const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
    const { result: projectsResult, error: projectsError } = await deepgram.manage.getProjects();
    if (projectsError) {
        throw new Error(`Failed to get projects: ${projectsError.message}`);
    }

    const project = projectsResult?.projects[0];
    if (!project) {
        throw new Error('No projects found');
    }

    const { result: newKeyResult, error: newKeyError } = await deepgram.manage.createProjectKey(project.project_id, {
        comment: "Temporary API key",
        scopes: ["usage:write"],
        tags: ["next.js"],
        time_to_live_in_seconds: 60,
    });
    if (newKeyError) {
        throw new Error(`Failed to create temporary key: ${newKeyError.message}`);
    }

    return newKeyResult.key;
}
