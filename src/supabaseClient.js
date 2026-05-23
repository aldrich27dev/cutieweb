// TYPE: Custom REST-based Database & Storage Network Layer Middleware
// FILE PATH: src/supabaseClient.js

const DEFAULT_TABLE = "dates";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_PROJECT_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

function normalizeUrl(url) {
  return url?.replace(/\/$/, "") ?? "";
}

async function requestJson(baseUrl, anonKey, path, options = {}) {
  if (!baseUrl || !anonKey) {
    throw new Error("Supabase is not configured.");
  }

  const response = await fetch(`${baseUrl}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Supabase request failed with status ${response.status}.`);
  }

  if (response.status === 204) {
    return [];
  }

  return response.json();
}

function buildSelectQuery({ status, order = "date.asc,time.asc", limit } = {}) {
  const params = new URLSearchParams();
  params.set("select", "*");

  if (status) {
    params.set("status", `eq.${status}`);
  }

  if (order) {
    params.set("order", order);
  }

  if (typeof limit === "number") {
    params.set("limit", String(limit));
  }

  return params.toString();
}

// Binagong factory provider na may built-in file object handling systems
function createSupabaseClient({
  url = SUPABASE_URL,
  anonKey = SUPABASE_ANON_KEY,
  table = DEFAULT_TABLE,
} = {}) {
  const baseUrl = normalizeUrl(url);

  return {
    isConfigured: Boolean(baseUrl && anonKey),

    async listDates({ status, order, limit } = {}) {
      const query = buildSelectQuery({ status, order, limit });
      return requestJson(baseUrl, anonKey, `${table}?${query}`);
    },

    async insertDate(payload) {
      return requestJson(baseUrl, anonKey, table, {
        method: "POST",
        headers: {
          Prefer: "return=representation",
        },
        body: JSON.stringify(payload),
      });
    },

    async updateDate(id, payload) {
      return requestJson(baseUrl, anonKey, `${table}?id=eq.${id}`, {
        method: "PATCH",
        headers: {
          Prefer: "return=representation",
        },
        body: JSON.stringify(payload),
      });
    },

    // 🚀 NEW FEATURE: Mas pinadaling wrapper helper para sa pag-update ng workflow status tulad ng 'completed'
    async updateStatus(id, status) {
      return this.updateDate(id, { status });
    },

    async cancelDate(id, cancellationReason) {
      return this.updateDate(id, {
        status: "cancelled",
        cancellation_reason: cancellationReason,
      });
    },

    async deleteDate(id) {
      return requestJson(baseUrl, anonKey, `${table}?id=eq.${id}`, {
        method: "DELETE",
        headers: {
          Prefer: "return=representation",
        },
      });
    },

    // 🚀 NEW FEATURE: Native direct fetch implementation para sa Supabase Storage Bucket Upload engine
    async uploadMemoryFile(bucketName, filePath, fileObject) {
      if (!baseUrl || !anonKey) throw new Error("Supabase configuration block missing.");

      const uploadUrl = `${baseUrl}/storage/v1/object/${bucketName}/${filePath}`;
      
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
          "Content-Type": fileObject.type || "image/jpeg",
        },
        body: fileObject,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Storage transaction rejected with status ${response.status}`);
      }

      // I-return ang construction token path at ang full public URL string para sa direct schema linking
      const publicUrl = `${baseUrl}/storage/v1/object/public/${bucketName}/${filePath}`;
      return { filePath, publicUrl };
    }
  };
}

export const supabaseClient = createSupabaseClient();
export { createSupabaseClient };
