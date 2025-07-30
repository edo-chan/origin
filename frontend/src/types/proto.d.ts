// Type declarations for proto imports
declare module '@/proto/*' {
  export interface HelloRequest {
    name: string;
  }

  export interface HelloResponse {
    message: string;
  }
}