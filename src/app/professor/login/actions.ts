"use server";

import { redirect } from "next/navigation";
import {
  checkCode,
  createProfessorSession,
  destroyProfessorSession,
} from "@/lib/auth";

export interface LoginState {
  error?: string;
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const code = String(formData.get("code") ?? "");
  if (!checkCode(code)) {
    return { error: "Código incorreto. Tente de novo." };
  }
  await createProfessorSession();
  redirect("/professor");
}

export async function logoutAction(): Promise<void> {
  await destroyProfessorSession();
  redirect("/");
}
