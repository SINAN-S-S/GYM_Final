// AI Fitness Assistant Controller (Secure Backend Integration)

const DISCLAIMER = "\n\n⚠️ Disclaimer: AlphaFit AI provides general athletic training and nutritional education. It is not medical advice or diagnosis. Always consult a certified physician or healthcare professional before modifying diet or exercise protocols.";

// Knowledge Base of Evidence-Based Fitness Answers for Instant Response / Offline Fallback
const VERIFIED_FITNESS_KB = [
  {
    keywords: ["progressive overload", "overload", "progress"],
    answer: "Progressive overload is the gradual increase of physical stress placed upon the musculoskeletal system during training. You can achieve this by:\n1. Adding weight to the bar (even 0.5kg - 1kg increments).\n2. Performing extra repetitions with the same weight.\n3. Increasing training sets or total session volume.\n4. Decreasing rest periods between working sets while maintaining form."
  },
  {
    keywords: ["protein", "how much protein", "protein intake", "grams"],
    answer: "For active individuals and strength athletes, the evidence-backed recommendation is 1.6 to 2.2 grams of protein per kilogram of body weight (approx. 0.8 to 1.0g per pound). Distribute your protein evenly across 3 to 5 meals per day (approx. 25g–40g per meal) to maximize muscle protein synthesis."
  },
  {
    keywords: ["creatine", "monohydrate", "how to take creatine"],
    answer: "Creatine monohydrate is one of the most researched and effective sports supplements. It increases intracellular phosphocreatine stores, supporting ATP regeneration during explosive efforts. A standard dose of 3 to 5 grams taken daily at any time (with or without a loading phase) maintains full muscular saturation."
  },
  {
    keywords: ["fat loss", "cut", "calorie deficit", "lose weight"],
    answer: "Sustainable fat loss is governed by a consistent caloric deficit. Key guidelines:\n1. Maintain a moderate deficit of 300–500 kcal below your Total Daily Energy Expenditure (TDEE).\n2. Keep protein high (2.0g/kg) to protect lean muscle tissue.\n3. Continue resistance training with high intensity.\n4. Track steps and cardio for extra non-exercise activity thermogenesis (NEAT)."
  },
  {
    keywords: ["muscle gain", "bulk", "hypertrophy", "build muscle"],
    answer: "To maximize muscle hypertrophy:\n1. Eat in a slight caloric surplus of 200–300 kcal above maintenance.\n2. Train each muscle group 2 times per week with 10–20 hard working sets per week within 0–3 reps in reserve (RIR).\n3. Prioritize restorative sleep (7–9 hours nightly) where human growth hormone release peaks."
  },
  {
    keywords: ["soreness", "doms", "sore muscles", "recovery"],
    answer: "Delayed Onset Muscle Soreness (DOMS) usually peaks 24–48 hours after unaccustomed eccentric loading. Light active recovery (brisk walking, mobility drills), adequate hydration, electrolytes, and sufficient protein intake accelerate metabolic clearance and recovery."
  }
];

export const chatWithAIAssistant = async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message || typeof message !== "string" || message.trim() === "") {
      return res.status(400).json({ msg: "Please provide a valid question or fitness query." });
    }

    const query = message.trim();
    const queryLower = query.toLowerCase();

    // Check if user is asking about medical conditions
    if (queryLower.includes("chest pain") || queryLower.includes("heart attack") || queryLower.includes("broken") || queryLower.includes("fracture") || queryLower.includes("severe injury")) {
      return res.json({
        reply: "🚨 URGENT: The symptoms you described require immediate professional medical evaluation. Please contact local emergency services or consult a licensed physician immediately. AlphaFit cannot advise on acute injuries or emergency medical symptoms.",
        source: "safety_alert",
      });
    }

    // 1. Try Live Gemini API if GEMINI_API_KEY is configured
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: `You are the AlphaFit AI Fitness & Conditioning Specialist. Provide direct, evidence-based, concise workout and sports nutrition guidance for athletes. Do not provide medical diagnoses or prescribe medications.\n\nUser Question: ${query}`,
                    },
                  ],
                },
              ],
              generationConfig: {
                maxOutputTokens: 500,
                temperature: 0.4,
              },
            }),
          }
        );

        const data = await response.json();
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (aiText) {
          return res.json({
            reply: aiText.trim() + DISCLAIMER,
            source: "gemini_live",
          });
        }
      } catch (geminiErr) {
        console.warn("[AI Assistant] Gemini API request failed, utilizing verified fitness protocol:", geminiErr.message);
      }
    }

    // 2. Verified Evidence-Based Knowledge Match
    for (const item of VERIFIED_FITNESS_KB) {
      if (item.keywords.some((k) => queryLower.includes(k))) {
        return res.json({
          reply: item.answer + DISCLAIMER,
          source: "alphafit_verified_protocol",
        });
      }
    }

    // 3. Clear configuration message when query falls outside built-in FAQs and external API is not set
    if (!apiKey) {
      return res.json({
        reply: `Here is AlphaFit's guidance on "${query}":\n\nFor best athletic results, focus on consistent progressive resistance training, a protein-rich balanced whole-food diet, and proper sleep.\n\n💡 Note: Live generative LLM responses require GEMINI_API_KEY configured in server environment variables. Our verified sports nutrition and workout protocols remain fully operational.${DISCLAIMER}`,
        source: "alphafit_core_guidance",
      });
    }

    return res.json({
      reply: `Regarding "${query}": prioritize foundational compound movements (Squat, Deadlift, Press, Pull), train 3-5 days per week with structured recovery, and match caloric intake to your primary objective.${DISCLAIMER}`,
      source: "alphafit_core_guidance",
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

