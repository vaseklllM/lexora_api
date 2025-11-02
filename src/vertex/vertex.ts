import { ResponseSchema, VertexAI } from '@google-cloud/vertexai';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { readFileSync } from 'fs';

@Injectable()
export class VertexProvider implements OnModuleInit {
  private readonly _keyFile: string = process.env.GOOGLE_VERTEX_AI_JSON_PATH!;
  private readonly _location: string =
    process.env.GOOGLE_VERTEX_AI_JSON_PATH_REGION || 'europe-west4';

  private _vertex: VertexAI;

  private getProjectId(): string {
    const credentials = JSON.parse(readFileSync(this._keyFile, 'utf8'));
    return credentials.project_id;
  }

  onModuleInit() {
    this._vertex = new VertexAI({
      project: this.getProjectId(),
      location: this._location,
      googleAuthOptions: { keyFile: this._keyFile },
    });
  }

  public async generate<T>(options: {
    model?: 'gemini-2.5-flash' | 'gemini-2.5-pro';
    responseSchema: ResponseSchema;
    prompt: string;
  }): Promise<T> {
    const result = await this._vertex
      .getGenerativeModel({
        model: options.model || 'gemini-2.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: options.responseSchema,
        },
      })
      .generateContent({
        contents: [{ role: 'user', parts: [{ text: options.prompt }] }],
      });

    const text: string =
      result.response.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';

    return JSON.parse(text) as T;
  }
}
