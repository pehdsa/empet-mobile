import { api } from "./client";
import type { Characteristic } from "@/types/characteristic";

export const characteristicsApi = {
  list: () => api.get<{ data: Characteristic[] }>("/characteristics"),
};
