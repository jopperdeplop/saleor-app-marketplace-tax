"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

async function callPortalApi(path: string, method: string, body: any) {
  const portalUrl = process.env.PORTAL_API_URL;
  const secret = process.env.PORTAL_API_SECRET;

  if (!portalUrl || !secret) {
    throw new Error("Missing PORTAL_API_URL or PORTAL_API_SECRET");
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${secret}`,
  };

  const fetchOptions: RequestInit = {
    method,
    headers,
  };

  // Only add body for non-GET methods
  if (method !== "GET" && method !== "HEAD" && body !== null) {
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(`${portalUrl}${path}`, fetchOptions);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Portal API error: ${response.status} ${text}`);
  }

  return response.json();
}

export async function processApplication(id: number, action: 'approve' | 'reject') {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  await callPortalApi("/api/admin/applications", "POST", { id, action });
  revalidatePath("/dashboard/applications");
}

export async function updateFeatureStatus(id: number, status: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  await callPortalApi("/api/admin/feature-requests", "PATCH", { id, status });
  revalidatePath("/dashboard/feature-requests");
}

export async function getPortalUsers() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  return callPortalApi("/api/admin/users", "GET", null);
}

export async function triggerPortalPasswordReset(email: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  await callPortalApi("/api/admin/users/reset-password", "POST", { email });
}
