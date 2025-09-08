import { PrismaClient } from '@prisma/client';
import languages from './list.json';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing languages first
  console.log('🧹 Clearing existing languages...');

  await prisma.language.deleteMany({});
  console.log('✅ Existing languages cleared');

  // Seed languages - comprehensive list of world languages
  console.log('📚 Seeding languages...');

  for (const language of languages) {
    try {
      await prisma.language.create({
        data: language,
      });
      console.log(`✅ Language ${language.name} (${language.code}) seeded`);
    } catch (error) {
      console.error(`❌ Failed to seed language ${language.name}:`, error);
      throw error;
    }
  }

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
