import { User } from '../../system/entities/user.entity';

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: string;
  user: {
    id: string;
    username: string;
    nickname: string;
    email: string | null;
    roles: string[];
  };
}
