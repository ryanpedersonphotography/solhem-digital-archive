// API client for server-based data storage
export type DataType = 'hidden' | 'ratings' | 'tags' | 'flags';

class DataApi {
  private baseUrl: string;

  constructor() {
    // In production, this will be your Netlify site URL
    this.baseUrl = import.meta.env.PROD 
      ? '/.netlify/functions'
      : 'http://localhost:8888/.netlify/functions';
  }

  async get<T>(dataType: DataType): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}/data-store/${dataType}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${dataType}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error(`Error fetching ${dataType}:`, error);
      throw error;
    }
  }

  async save<T>(dataType: DataType, data: T): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/data-store/${dataType}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: '1.0',
          lastUpdated: new Date().toISOString(),
          ...data
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save ${dataType}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`${dataType} saved successfully:`, result);
    } catch (error) {
      console.error(`Error saving ${dataType}:`, error);
      throw error;
    }
  }

  // Helper method to check if the API is available
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/data-store/hidden`, {
        method: 'GET',
      });
      return response.status !== 404; // Function exists
    } catch (error) {
      return false; // Function not available
    }
  }
}

export const dataApi = new DataApi();