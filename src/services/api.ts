import axios from "axios";
import type { AccessRequest, AuthResponse, LoginRequest, MyRole, SignupRequest, TokenResponse, User } from "../types/auth";
import type { BibleBook, ChapterSummary, DashboardSummary, Pericope, PericopeCreate, PericopeWithStatus } from "../types/bible";
import type { MeaningMap, MeaningMapData, MeaningMapFeedback } from "../types/meaningMap";
import type { BHSAPassageData, BHSAStatus } from "../types/bhsa";
import { ACCESS_TOKEN_KEY, API_BASE_URL, REFRESH_TOKEN_KEY } from "../constants/app";

const client = axios.create({ baseURL: API_BASE_URL });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        try {
          const { data } = await axios.post<TokenResponse>(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
          localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
          original.headers.Authorization = `Bearer ${data.access_token}`;
          return client(original);
        } catch {
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          window.location.href = "/login";
        }
      } else {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  signup: (data: SignupRequest) =>
    client.post<AuthResponse>("/auth/signup", data).then((r) => r.data),
  login: (data: LoginRequest) =>
    client.post<AuthResponse>("/auth/login", data).then((r) => r.data),
  me: () => client.get<User>("/auth/me").then((r) => r.data),
  myRoles: (appKey?: string) =>
    client
      .get<MyRole[]>("/auth/my-roles", { params: appKey ? { app_key: appKey } : undefined })
      .then((r) => r.data),
  logout: () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    if (refreshToken) {
      return client.post("/auth/logout", { refresh_token: refreshToken });
    }
  },
};

export const booksAPI = {
  list: () => client.get<BibleBook[]>("/books").then((r) => r.data),
  dashboardSummary: () =>
    client.get<DashboardSummary>("/books/dashboard-summary").then((r) => r.data),
  getChapters: (bookId: string) =>
    client.get<ChapterSummary[]>(`/books/${bookId}/chapters`).then((r) => r.data),
  getPericopes: (bookId: string, chapter: number) =>
    client
      .get<PericopeWithStatus[]>(`/books/${bookId}/chapters/${chapter}/pericopes`)
      .then((r) => r.data),
  getAllPericopes: (bookId: string) =>
    client
      .get<PericopeWithStatus[]>(`/books/${bookId}/pericopes`)
      .then((r) => r.data),
};

export const pericopesAPI = {
  create: (data: PericopeCreate) =>
    client.post<Pericope>("/pericopes", data).then((r) => r.data),
};

export const meaningMapsAPI = {
  list: (params?: { book_id?: string; chapter?: number; status?: string }) =>
    client.get<MeaningMap[]>("/meaning-maps", { params }).then((r) => r.data),
  get: (id: string) => client.get<MeaningMap>(`/meaning-maps/${id}`).then((r) => r.data),
  update: (id: string, data: Partial<MeaningMapData>) =>
    client.put<MeaningMap>(`/meaning-maps/${id}`, { data }).then((r) => r.data),
  updateStatus: (id: string, status: string) =>
    client.patch<MeaningMap>(`/meaning-maps/${id}/status`, { status }).then((r) => r.data),
  lock: (id: string) => client.post<MeaningMap>(`/meaning-maps/${id}/lock`).then((r) => r.data),
  unlock: (id: string) =>
    client.post<MeaningMap>(`/meaning-maps/${id}/unlock`).then((r) => r.data),
  delete: (id: string) => client.delete(`/meaning-maps/${id}`),
  generate: (data: { pericope_id: string }) =>
    client.post<MeaningMap>("/meaning-maps/generate", data).then((r) => r.data),
  exportJSON: (id: string) =>
    client.get<string>(`/meaning-maps/${id}/export/json`).then((r) => r.data),
  exportProse: (id: string) =>
    client.get<string>(`/meaning-maps/${id}/export/prose`).then((r) => r.data),
  addFeedback: (id: string, data: { section_key: string; content: string }) =>
    client.post<MeaningMapFeedback>(`/meaning-maps/${id}/feedback`, data).then((r) => r.data),
  listFeedback: (id: string) =>
    client.get<MeaningMapFeedback[]>(`/meaning-maps/${id}/feedback`).then((r) => r.data),
  resolveFeedback: (mapId: string, feedbackId: string) =>
    client
      .patch<MeaningMapFeedback>(`/meaning-maps/${mapId}/feedback/${feedbackId}`, {
        resolved: true,
      })
      .then((r) => r.data),
};

export const bhsaAPI = {
  getStatus: () => client.get<BHSAStatus>("/bhsa/status").then((r) => r.data),
  fetchPassage: (book: string, chapter: number, verseStart: number, verseEnd: number) =>
    client
      .get<BHSAPassageData>("/bhsa/passage", {
        params: { book, chapter, verse_start: verseStart, verse_end: verseEnd },
      })
      .then((r) => r.data),
};

export const ragAPI = {
  query: (question: string, namespace?: string) =>
    client
      .post<{ answer: string; sources: string[] }>("/rag/query", { question, namespace })
      .then((r) => r.data),
};

export const accessRequestsAPI = {
  create: (data: { app_key: string; note?: string }) =>
    client.post<AccessRequest>("/access-requests", data).then((r) => r.data),
  mine: (appKey: string) =>
    client
      .get<AccessRequest | null>("/access-requests/mine", { params: { app_key: appKey } })
      .then((r) => r.data),
};

export default client;
