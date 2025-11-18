export function formatError(e: unknown): string {
  try {
    const any = e as any;
    const data = any?.response?.data;

    if (typeof data?.detail === "string") return data.detail;
    if (Array.isArray(data?.detail)) {
      const msgs = data.detail.map((it: any) => {
        const loc = Array.isArray(it?.loc) ? it.loc.join(".") : it?.loc;
        return it?.msg
          ? loc
            ? `${loc}: ${it.msg}`
            : it.msg
          : JSON.stringify(it);
      });
      return msgs.join("\n");
    }
    if (typeof data?.message === "string") return data.message;
    if (typeof any?.message === "string") return any.message;
    return "Request failed.";
  } catch {
    return "Unexpected error.";
  }
}
