export interface TokenPayload {
  sub: string;
  username: string;
  roles: string[];
  permissions: string[];
}
