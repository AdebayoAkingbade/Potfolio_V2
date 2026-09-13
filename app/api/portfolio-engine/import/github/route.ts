import { NextResponse } from "next/server";

import {
  importGithubIntoDraft,
  type GitHubProfileImport,
  type GitHubRepositoryImport,
} from "@/lib/portfolio-engine/importers";
import { coercePortfolioDraft } from "@/lib/portfolio-engine/validation";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function githubHeaders() {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

async function fetchGitHubJson<T>(url: string) {
  const response = await fetch(url, {
    headers: githubHeaders(),
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    return {
      ok: false as const,
      status: response.status,
      data: null,
    };
  }

  return {
    ok: true as const,
    status: 200,
    data: (await response.json()) as T,
  };
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const username =
    body && typeof body === "object" && typeof body.username === "string"
      ? body.username.replace(/^@/, "").trim()
      : "";
  const draft = coercePortfolioDraft(
    body && typeof body === "object" && "draft" in body ? body.draft : null,
  );

  if (!draft) return errorResponse("Invalid portfolio draft payload.", 400);
  if (!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(username)) {
    return errorResponse("Enter a valid GitHub username.", 400);
  }

  const profile = await fetchGitHubJson<GitHubProfileImport>(
    `https://api.github.com/users/${encodeURIComponent(username)}`,
  );
  if (!profile.ok || !profile.data) {
    return errorResponse("GitHub profile was not found.", profile.status === 404 ? 404 : 502);
  }

  const repos = await fetchGitHubJson<GitHubRepositoryImport[]>(
    `https://api.github.com/users/${encodeURIComponent(
      username,
    )}/repos?sort=updated&per_page=12&type=owner`,
  );
  if (!repos.ok || !repos.data) {
    return errorResponse("Could not import GitHub repositories.", 502);
  }

  return NextResponse.json({
    draft: importGithubIntoDraft(profile.data, repos.data, draft),
  });
}
