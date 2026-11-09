// src/services/api.ts
import axios, { AxiosError, AxiosInstance } from 'axios';
import { useAppStore } from '../store/useAppStore';

export interface ApiProfile {
  nom: string;
  echantillons: number;
  ajoute?: string;
}

export interface ApiError {
  detail: string;
  status?: number;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      timeout: 300000, // 5 min — les modèles IA peuvent être lents
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    this.client.interceptors.request.use((config) => {
      const baseUrl = useAppStore.getState().apiBaseUrl;
      config.baseURL = baseUrl;
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<{ detail?: string }>) => {
        const message =
          error.response?.data?.detail ||
          error.message ||
          'Erreur réseau inconnue';
        return Promise.reject({
          detail: message,
          status: error.response?.status,
        } as ApiError);
      },
    );
  }

  // ---- État du serveur ----
  async getStatus(): Promise<{
    pret: boolean;
    stt_disponible: boolean;
    classification_disponible: boolean;
    voix: number;
    mode: string;
    model_status: string;
  }> {
    const { data } = await this.client.get('/api/etat');
    return data;
  }

  // ---- Profils ----
  async getProfiles(): Promise<ApiProfile[]> {
    const { data } = await this.client.get('/api/personnes');
    return data;
  }

  async addProfile(
    nom: string,
    audioUri: string,
    fileName: string,
  ): Promise<{ nom: string; secondes: number; personnes: ApiProfile[] }> {
    const form = new FormData();
    form.append('nom', nom);
    form.append('audio', {
      uri: audioUri,
      name: fileName,
      type: 'audio/wav',
    } as any);

    const { data } = await this.client.post('/api/personnes', form);
    return data;
  }

  async deleteProfile(nom: string): Promise<ApiProfile[]> {
    const { data } = await this.client.delete(
      `/api/personnes/${encodeURIComponent(nom)}`,
    );
    return data;
  }

  async importProfiles(fileUri: string, fileName: string): Promise<ApiProfile[]> {
    const form = new FormData();
    form.append('fichier', {
      uri: fileUri,
      name: fileName,
      type: 'application/json',
    } as any);
    const { data } = await this.client.post('/api/voix/import', form);
    return data;
  }

  // ---- Analyse ----
  async analyse(
    audioUri: string,
    fileName: string,
    options: Record<string, any>,
  ): Promise<any> {
    const form = new FormData();
    form.append('audio', {
      uri: audioUri,
      name: fileName,
      type: 'audio/wav',
    } as any);

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        form.append(key, String(value));
      }
    });

    const { data } = await this.client.post('/api/analyse', form);
    return data;
  }

  // ---- Historique ----
  async getSessions(): Promise<{ id: string; date: string; duree: number }[]> {
    const { data } = await this.client.get('/api/sessions');
    return data;
  }

  async getSession(id: string): Promise<any> {
    const { data } = await this.client.get(`/api/sessions/${id}`);
    return data;
  }

  async deleteSession(id: string): Promise<{ deleted: boolean }> {
    const { data } = await this.client.delete(`/api/sessions/${id}`);
    return data;
  }

  // ---- Export ----
  async exportSession(
    id: string,
    format: 'json' | 'csv' | 'txt' | 'pdf',
  ): Promise<{ filePath: string; mimeType: string }> {
    const baseUrl = useAppStore.getState().apiBaseUrl;
    const url = `${baseUrl}/api/sessions/${id}/export/${format}`;

    // Utilise react-native-fs pour télécharger
    const RNFS = require('react-native-fs');
    const fileName = `voicescope-${id}.${format}`;
    const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

    const result = await RNFS.downloadFile({
      fromUrl: url,
      toFile: filePath,
    }).promise;

    if (result.statusCode !== 200) {
      throw { detail: `Erreur HTTP ${result.statusCode}` } as ApiError;
    }

    const mimeTypes = {
      json: 'application/json',
      csv: 'text/csv',
      txt: 'text/plain',
      pdf: 'application/pdf',
    };

    return { filePath, mimeType: mimeTypes[format] };
  }
}

export const api = new ApiClient();