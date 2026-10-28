import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.electricalphase.app",
  appName: "Electrical Phase",
  webDir: "cap-www",
  server: { url: "https://electrical-phase-web.vercel.app/ruang", cleartext: false },
};
export default config;
