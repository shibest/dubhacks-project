/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TRAKT_CLIENT_ID: string
  readonly VITE_TRAKT_CLIENT_SECRET: string
  readonly VITE_SPOTIFY_CLIENT_ID: string
  readonly VITE_SPOTIFY_CLIENT_SECRET: string
  readonly VITE_STEAM_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
