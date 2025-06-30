
// src/auth/githubAuth.ts
import axios from "axios";
import { createJWT } from "../auth/jwtutils";

const CLIENT_ID = process.env.CLIENT_ID!;
const CLIENT_SECRET = process.env.CLIENT_SECRET!;

interface GitHubAccessTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

interface GitHubUser {
  id: number;
  login: string;
  email: string | null;
}

export async function loginWithGitHub(code: string): Promise<{ token: string; fakeUserId: string }> {
  const tokenRes = await axios.post<GitHubAccessTokenResponse>(
    "https://github.com/login/oauth/access_token",
    {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
    },
    {
      headers: {
        Accept: "application/json",
      },
    }
  );

  const accessToken = tokenRes.data.access_token;
  if (!accessToken) {
    throw new Error("GitHub token exchange failed");
  }

  const userRes = await axios.get<GitHubUser>("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
    },
  });

  const githubUser = userRes.data;
  if (!githubUser || !githubUser.id) {
    throw new Error("Failed to fetch GitHub user");
  }

  console.log("🔍 GitHub User Info:");
  console.log({
    id: githubUser.id,
    login: githubUser.login,
    email: githubUser.email,
  });

  const fakeUserId = `test-${Math.floor(Math.random() * 10000)}`;
  console.log("🧪 Using Fake User ID:", fakeUserId);

  const jwt = createJWT({ id: fakeUserId });

  return { token: jwt, fakeUserId };
}
