import { api } from "./api";

export const sendTestEmail = async (
  to: string,
  subject: string,
): Promise<void> => {
  await api.post("/email/send", { to, subject });
};
