import { getVoiceQuality } from './init-languages/getVoiceQuality';
import { loadGoogleVoices } from './init-languages/loadGoogleVoices';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

(async () => {
  const voices = await loadGoogleVoices();

  const languages = await prisma.language.findMany({});

  console.log('📚 Seeding languages voices...');
  for (const language of languages) {
    const languageVoices = voices.filter((voice) => {
      return voice.languageCodes.includes(language.code);
    });

    const googleTtsVoiceFemaleName = languageVoices.filter(
      (voice) => voice.ssmlGender === 'FEMALE',
    );

    const googleTtsVoiceMaleName = languageVoices.filter(
      (voice) => voice.ssmlGender === 'MALE',
    );

    if (
      googleTtsVoiceFemaleName.length <= 0 &&
      googleTtsVoiceMaleName.length <= 0
    ) {
      console.log(`🧹 Skip language ${language.name} (${language.code})`);
      continue;
    }

    try {
      await prisma.language.update({
        where: { code: language.code },
        data: {
          googleTtsVoiceFemaleName: getVoiceQuality(googleTtsVoiceFemaleName),
          googleTtsVoiceMaleName: getVoiceQuality(googleTtsVoiceMaleName),
        },
      });
      console.log(`✅ Language ${language.name} (${language.code}) updated`);
    } catch (error) {
      console.error(`❌ Failed to update language ${language.name}:`, error);
      throw error;
    }
  }
})()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
