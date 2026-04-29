import { GoogleGenAI, Modality, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function generateSandboxPreset(theme: string, type: 'image' | 'audio' | 'experiment') {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        You are a creative director for a top-tier generative AI lab. 
        Generate a highly specific, professional-grade prompt for a ${type} generation based on the theme: "${theme}".
        
        The goal is to create something that would look impressive in a technical AI portfolio.
        
        Provide a JSON response with:
        - "prompt": The generated prompt string.
        - "parameters": A brief description of suggested parameters or settings (max 10 words).
        - "explanation": Why this prompt is technically or artistically significant (max 20 words).

        Output only the JSON.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            prompt: { type: Type.STRING },
            parameters: { type: Type.STRING },
            explanation: { type: Type.STRING },
          },
          required: ["prompt", "parameters", "explanation"],
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Preset Generation Error:", error);
    throw error;
  }
}

export async function getEssayStrategy(prompt: string, collegeName: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        You are an expert AI Career Coach and Technical Recruiter for elite AI institutions.
        
        PROGRAM: ${collegeName}
        PORTFOLIO PROMPT: "${prompt}"
        
        The institution's core operational philosophy revolves around:
        1. Concurrency Conflict Resolution
        2. Temporal Dossier Archiving
        3. High-Fidelity Algorithmic Alignment
        
        Provide a strategic plan for a candidate to tackle this prompt. Focus on:
        1. Institutional Alignment: How to weave the three core principles into the technical narrative.
        2. 3 Specific "Technical Hooks" or projects that demonstrate expertise in these principles.
        3. Advanced technical vocabulary (specific to these three pillars).
        
        Format the response in clear technical sections.
      `,
    });

    return response.text || "No strategy generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Failed to generate strategy. Please try again later.";
  }
}

export async function analyzeEssayDraft(draft: string, collegeName: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        You are an elite AI Technical Editor and Portfolio Strategist specializing in high-fidelity institutional alignment.
        
        LAB/PROGRAM: ${collegeName}
        
        Your analysis must focus EXCLUSIVELY and DEEPLY on how the provided text addresses the following three technical pillars:
        
        1. CONCURRENCY CONFLICT RESOLUTION: 
           - Does the content explain how overlapping logic branches or competing AI processes are managed? 
           - Look for mentions of race conditions, mutex locks in latent space, or multi-agent synchronization.
        
        2. TEMPORAL DOSSIER ARCHIVING: 
           - Does the content describe robust versioning of AI state and historical data management? 
           - Look for mentions of immutability, state snapshots, time-series dossier reconstruction, or historical provenance.
        
        3. HIGH-FIDELITY ALGORITHMIC ALIGNMENT: 
           - Does the content demonstrate ensuring AI outputs strictly adhere to moral, technical, and architectural constraints? 
           - Look for mentions of loss function tuning, reinforcement learning with human feedback (RLHF) specialized for alignment, or objective function precision.

        DRAFT FOR ANALYSIS:
        "${draft}"
        
        Provide a rigorous, high-stakes technical audit with:
        1. THEMATIC DEPTH REPORT: For each of the three principles, evaluate the DEPTH of technical understanding shown. Use a scale of 0-10.
        2. CRITICAL VOIDS: Identify exactly what is missing from each principle's narrative to reach institutional "Apex" standards.
        3. TERMINOLOGY CALIBRATION: List 3 advanced technical terms for each principle that the candidate SHOULD have used to strengthen their dossier.
        4. ALIGNMENT SYTHESIS: Provide 3 direct, actionable rewrites for specific sentences in the draft that would immediately elevate the dossier's resonance with these pillars.
        5. ANOMALY DETECTION: Point out any technical inaccuracies or "shallow jargon" usage that fails to demonstrate true mastery of these specific concepts.
        
        The tone should be cold, professional, and hyper-technical.
      `,
    });

    return response.text || "Analysis failed.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Analysis failed. Please check your draft and try again.";
  }
}

export async function summarizeObservation(content: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        Summarize the following observation from a technical AI researcher into a single, concise sentence (max 15 words). 
        Focus on the core technical anomaly or insight.
        
        OBSERVATION:
        "${content}"
        
        SUMMARY:
      `,
    });

    return response.text.trim() || "Summary unavailable.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating summary.";
  }
}

export async function generateSandboxImage(prompt: string, style?: string) {
  try {
    const styleString = style ? `Style: ${style}. ` : "Style: Dark cyberpunk, technical blueprint accents, ethereal glow, high contrast. ";
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `Create a highly technical, futuristic, and artistic representation of the following concept for an AI student's portfolio: ${prompt}. ${styleString}`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Generation Error:", error);
    throw error;
  }
}

export async function generateSandboxAudio(text: string, style?: string, params?: { pitch?: number, tempo?: number }) {
  try {
    const { pitch = 1.0, tempo = 1.0 } = params || {};
    if (style === 'Atmospheric Soundscape') {
      const response = await ai.models.generateContentStream({
        model: "lyria-3-clip-preview",
        contents: `Generate a 30-second immersive soundscape based on: ${text}. Focus on futuristic, ambient, and technical textures. Pitch factor: ${pitch}x, Tempo factor: ${tempo}x.`,
      });

      let audioBase64 = "";
      let mimeType = "audio/wav";

      for await (const chunk of response) {
        const parts = chunk.candidates?.[0]?.content?.parts;
        if (!parts) continue;
        for (const part of parts) {
          if (part.inlineData?.data) {
            if (!audioBase64 && part.inlineData.mimeType) {
              mimeType = part.inlineData.mimeType;
            }
            audioBase64 += part.inlineData.data;
          }
        }
      }

      if (audioBase64) {
        const binary = atob(audioBase64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: mimeType });
        return URL.createObjectURL(blob);
      }
      return null;
    }

    // Default to TTS
    const voiceMap: Record<string, string> = {
      'Zephyr': 'Zephyr',
      'Puck': 'Puck',
      'Charon': 'Charon',
      'Kore': 'Kore'
    };
    const voiceName = voiceMap[style || 'Zephyr'] || 'Zephyr';

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName as any },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return `data:audio/wav;base64,${base64Audio}`;
    }
    return null;
  } catch (error) {
    console.error("Audio Generation Error:", error);
    throw error;
  }
}

export async function runAlgorithmicExperiment(logic: string, params?: { chaosFactor?: number, temporalDrift?: number, ethicalGovernor?: boolean }) {
  try {
    const { chaosFactor = 0.5, temporalDrift = 0, ethicalGovernor = true } = params || {};
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `
        Analyze the following algorithmic concept and simulate a highly detailed "Latent Space Experiment".
        
        CONCEPT: ${logic}

        EXPERIMENTAL PARAMETERS:
        - Chaos Factor: ${chaosFactor} (0-1 scale, affects unpredictability of the simulation)
        - Temporal Drift: ${temporalDrift}s (affects synchronization shifts in the latent stream)
        - Ethical Governor: ${ethicalGovernor ? "ENABLED" : "DISABLED"} (affects adherence to safety and alignment protocols)
        
        Provide a comprehensive JSON response with:
        1. "findings": A high-level technical summary of the experiment's results and theoretical implications.
        2. "anomalies": A detailed breakdown of unexpected behaviors, edge cases, or potential failure points identified during the run.
        3. "predictedImpact": A numerical score (1-100) representing the potential effect on neural stability.
        4. "simulationLogs": An array of at least 8 highly detailed step-by-step technical logs. Each log entry must follow a [PHASE] [TIMESTAMP] [DENSITY] format (e.g., "[INIT] [T+0.04s] [0.982] Initializing manifold projection...").
        5. "parameterBreakdown": An object describing key variables and their calculated values/impact. Include at least:
           - "entropy": Measure of system disorder.
           - "resonance": Manifold vibration state.
           - "convergence": Rate of objective function stabilization.
           - "utility": Practical application score.
           - "stabilityIndex": Measure of long-term architectural durability.
           - "alignmentBuffer": Capacity for corrective alignment adjustments.
        
        Output only valid JSON.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            findings: { type: Type.STRING },
            anomalies: { type: Type.STRING },
            predictedImpact: { type: Type.NUMBER },
            simulationLogs: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            parameterBreakdown: {
              type: Type.OBJECT,
              properties: {
                entropy: { type: Type.STRING },
                resonance: { type: Type.STRING },
                convergence: { type: Type.STRING },
                utility: { type: Type.STRING },
                stabilityIndex: { type: Type.STRING },
                alignmentBuffer: { type: Type.STRING }
              },
              required: ["entropy", "resonance", "convergence", "utility", "stabilityIndex", "alignmentBuffer"]
            }
          },
          required: ["findings", "anomalies", "predictedImpact", "simulationLogs", "parameterBreakdown"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Algorithmic Experiment Error:", error);
    throw error;
  }
}

export async function generateDiscoveryStyles() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: `
        Generate a list of 6 unique, avant-garde, and diverse image styles for an AI image generator.
        Each style must have a "label" (the name of the style) and a "description" (a short, evocative technical or artistic detail).
        
        Examples of high-quality styles:
        - Quantum Impressionism: Shimmering probability clouds and pixelated brushstrokes.
        - Bio-luminescent Circuitry: Glowing organic paths intertwined with deep-sea neural architecture.
        - Kinetic Sculpture: Frozen motion captured in metallic shards and glass reflections.
        
        Provide only JSON in this format:
        {
          "styles": [
            { "id": "string-slug", "label": "String", "description": "String" }
          ]
        }
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            styles: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  label: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["id", "label", "description"]
              }
            }
          },
          required: ["styles"]
        }
      }
    });

    const parsed = JSON.parse(response.text || '{"styles": []}');
    return parsed.styles;
  } catch (error) {
    console.error("Error generating styles:", error);
    return [];
  }
}
