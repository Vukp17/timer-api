export interface Tokens {
  access_token: string;
  refresh_token: string;
}

export interface JwtPayload {
  username: string;
  sub: number;
}

export interface JwtPayloadWithRt extends JwtPayload {
  refreshToken: string;
}
