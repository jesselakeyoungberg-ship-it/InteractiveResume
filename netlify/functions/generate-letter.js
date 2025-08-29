// This is the server-side code that runs securely on Netlify.
exports.handler = async function (event, context) {
  // Get the job title and company name from the request.
  const { jobTitle, companyName, resumeContext } = JSON.parse(event.body);

  // Securely get the API key from Netlify's environment variables.
  const apiKey = process.env.GEMINI_API_KEY;
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

  const systemPrompt = "You are a professional career assistant. Your task is to write a concise, professional, and compelling cover letter for Jesse S. LakeYoungberg based on his resume information. The letter should be tailored to the specific job title and company provided. Highlight 2-3 of his most relevant qualifications and accomplishments for the role. Keep the tone confident and direct. The letter should be around 200-250 words.";
  const userQuery = `Job Title: ${jobTitle}, Company: ${companyName}.`;

  const payload = {
      contents: [{ parts: [{ text: `Resume Context: ${resumeContext}\n\nTask: ${userQuery}` }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
    }

    const result = await response.json();
    const text = result.candidates[0].content.parts[0].text;

    return {
      statusCode: 200,
      body: JSON.stringify({ letter: text }),
    };
  } catch (error) {
    console.error("Error in serverless function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "An error occurred while generating the cover letter." }),
    };
  }
};