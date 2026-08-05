export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt, resolution } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    const aiApiKey = process.env.AI_API_KEY;

    if (!aiApiKey) {
        return res.status(500).json({ error: 'API key not configured on server' });
    }

    try {
        const response = await fetch("https://fal.run/fal-ai/wan-t2v", {
            method: "POST",
            headers: {
                "Authorization": `Key ${aiApiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                prompt: prompt,
                resolution: resolution || "720p",
                aspect_ratio: "16:9"
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            return res.status(response.status).json({ error: data.error || 'Generation failed' });
        }

        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}
