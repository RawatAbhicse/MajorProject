export type Message = {
  role: "user" | "assistant" | "error";
  content: string;
};

export type ChatRequest = {
  message: string;
  location?: {
    lat: number;
    lng: number;
  };
};
