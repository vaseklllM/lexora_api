export type IVoice = {
  name: string;
  languageCodes: string[];
  ssmlGender: string;
  naturalSampleRateHertz: number;
};

export async function loadGoogleVoices() {
  const res = await fetch(
    `https://texttospeech.googleapis.com/v1/voices?key=${process.env.GOOGLE_API}`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    },
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Get voices failed: ${errorText}`);
  }

  const data: {
    voices: Array<IVoice>;
  } = await res.json();

  return data.voices;
}
