export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { registerAllListeners } = await import(
      "@/core/events/register-listeners"
    );
    registerAllListeners();
  }
}
