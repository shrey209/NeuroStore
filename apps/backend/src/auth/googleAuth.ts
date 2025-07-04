import axios from "axios";
import { createJWT } from "../auth/jwtutils";
import User from "../models/users";
import mongoose from "mongoose";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  id_token: string;
}

interface GoogleUser {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
}

export async function loginWithGoogle(code: string): Promise<{ token: string; user_id: string }> {
  const tokenRes = await axios.post<GoogleTokenResponse>(
    "https://oauth2.googleapis.com/token",
    {
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
    },
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  const idToken = tokenRes.data.id_token;

  const userRes = await axios.get<GoogleUser>(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
  );

  const googleUser = userRes.data;
  const sub = googleUser.sub;

  let user = await User.findOne({ google_sub_id: sub });

  if (!user) {
    user = await new User({
      user_id: `google:${sub}`,
      user_name: googleUser.name,
      provider: "google",
      gmail: googleUser.email,
      profile_picture: googleUser.picture,
      email_verified: googleUser.email_verified,
      google_sub_id: sub,
    }).save();
  }

const mongoUserId = (user._id as mongoose.Types.ObjectId).toString();
   const token = createJWT({ id: mongoUserId });
 return { token, user_id: mongoUserId };
}
