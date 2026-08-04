export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const { prompt, resolution } = req.body;

    if (!prompt) {
        return res.status(400).json({ success: false, error: 'Prompt is required' });
    }

    try {
        const aiApiKey = process.env.AI_API_KEY;

        if (!aiApiKey) {
            return res.status(500).json({ success: false, error: 'API key (AI_API_KEY) missing in Vercel/Render settings!' });
        }

        console.log(`Generating real video for prompt: "${prompt}"`);

        // Real API call to Fal.ai Wan v2.1
        const response = await fetch("https://fal.run/fal-ai/wan/v2.1/text-to-video", {
            method: "POST",
            headers: {
                "Authorization": `Key ${aiApiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                prompt: prompt,
                resolution: "720p",
                aspect_ratio: "16:9"
            })
        });

        const data = await response.json();

        const videoUrl = data.video?.url || data.images?.[0]?.url || data.url;

        if (!videoUrl) {
            console.error("Fal API Error:", data);
            return res.status(500).json({ 
                success: false, 
                error: data.detail || data.error || 'Failed to generate video' 
            });
        }

        return res.status(200).json({
            success: true,
            resolutionUsed: resolution || '720p',
            videoUrl: videoUrl
        });

    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
