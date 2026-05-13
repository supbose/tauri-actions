import { getOctokit, context } from "@actions/github";
import { Octokit } from '@octokit/core';
import { safeJsonStringify } from './utils';
let GITHUB_TOKEN;
export function initializeToken() {
    GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
    if (!GITHUB_TOKEN) {
        console.log('Warning: GITHUB_TOKEN not found in environment variables');
    }
}
export function getRepositoryInfo() {
    const repo = context.repo;
    return {
        owner: repo.owner,
        repo: repo.repo
    };
}
export async function getReleaseByTag(repoInfo, tagName) {
    if (!GITHUB_TOKEN) {
        console.log("GITHUB_TOKEN is required for GitHub API calls");
        return undefined;
    }
    const octokit = getOctokit(GITHUB_TOKEN);
    try {
        const response = await octokit.rest.repos.getReleaseByTag({
            owner: repoInfo.owner,
            repo: repoInfo.repo,
            tag: tagName
        });
        return response.data;
    }
    catch (error) {
        console.error(`Error fetching release for tag ${tagName}:`, error);
        return undefined;
    }
}
export async function getLatestRelease(repoInfo) {
    if (!GITHUB_TOKEN) {
        console.log("GITHUB_TOKEN is required for GitHub API calls");
        return undefined;
    }
    const octokit = getOctokit(GITHUB_TOKEN);
    try {
        const response = await octokit.rest.repos.getLatestRelease({
            owner: repoInfo.owner,
            repo: repoInfo.repo
        });
        return response.data;
    }
    catch (error) {
        console.error("Error fetching latest release:", error);
        return undefined;
    }
}
export async function getReleaseAssetContent(repoInfo, asset) {
    if (!GITHUB_TOKEN) {
        throw new Error("GITHUB_TOKEN is required for GitHub API calls");
    }
    const octokit = new Octokit({ auth: GITHUB_TOKEN });
    try {
        const response = await octokit.request('GET /repos/{owner}/{repo}/releases/assets/{asset_id}', {
            owner: repoInfo.owner,
            repo: repoInfo.repo,
            asset_id: asset.id,
            headers: {
                accept: 'application/json'
            }
        });
        const data = response.data;
        console.log(`Asset content type: ${typeof data}, constructor: ${data?.constructor?.name}`);
        if (data instanceof ArrayBuffer) {
            console.log('Converting ArrayBuffer to string');
            return Buffer.from(data).toString('utf-8');
        }
        else if (Buffer.isBuffer(data)) {
            console.log('Converting Buffer to string');
            return data.toString('utf-8');
        }
        else if (typeof data === 'string') {
            console.log('Data is already string');
            return data;
        }
        else if (typeof data === 'object') {
            console.log('Data is object, stringifying');
            return safeJsonStringify(data, '{}');
        }
        else {
            console.warn(`Unexpected data type for asset ${asset.name}: ${typeof data}`);
            return String(data);
        }
    }
    catch (error) {
        console.error(`Error fetching asset content for ${asset.name}:`, error);
        throw error;
    }
}
export async function getGitCommitMessage(repoInfo) {
    if (!GITHUB_TOKEN) {
        console.log("GITHUB_TOKEN is required for GitHub API calls");
        return '';
    }
    const octokit = getOctokit(GITHUB_TOKEN);
    try {
        const response = await octokit.rest.repos.listCommits({
            owner: repoInfo.owner,
            repo: repoInfo.repo,
            per_page: 1
        });
        if (response.data.length > 0) {
            const commit = response.data[0];
            const message = commit.commit.message.split('\n')[0];
            console.log(`Latest commit message: ${message}`);
            return message;
        }
    }
    catch (error) {
        console.error("Error fetching commit message:", error);
    }
    return '';
}
//# sourceMappingURL=github.js.map