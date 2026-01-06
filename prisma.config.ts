import { defineConfig } from 'prisma/config';
import { loadEnvConfig } from '@next/env';

const projectDir = process.cwd();
loadEnvConfig(projectDir);



export default defineConfig({
  datasource: {
    url: process.env.POSTGRES_PRISMA_URL,
  },
  migrations: {
    seed: 'npx tsx ./scripts/seed-admin.ts',
  },
});


