import axios from "axios";
import { createJWT } from "../auth/jwtutils";
import User from "../models/users";
import { User as SharedUser } from "@neurostore/shared/types";

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
  avatar_url: string;
}

export async function loginWithGitHub(code: string): Promise<{ token: string; user_id: string }> {
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

  const githubIdStr = githubUser.id.toString();

  // Step 1: Check if user exists by GitHub ID
  let user = await User.findOne({ github_id: githubIdStr });

  if (!user) {
    // Step 2: If user doesn't exist, create one
    const newUser = new User({
      user_id: `github:${githubIdStr}`,
      user_name: githubUser.login,
      provider: "github",
      gmail: githubUser.email || undefined,
      profile_picture: githubUser.avatar_url,
      email_verified: !!githubUser.email,
      github_id: githubIdStr,
    });

    user = await newUser.save();
  }

  
  const jwt = createJWT({ id: user.user_id });

  return { token: jwt, user_id: user.user_id };
}
