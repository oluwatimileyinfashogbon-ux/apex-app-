module.exports = async function handler(req, res) {
    // Enable CORS headers so your website frontend can talk to it safely
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { prompt, resolution } = req.body || {};

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const aiApiKey = process.env.AI_API_KEY;
        if (!aiApiKey) {
            console.error('AI_API_KEY environment variable is missing on Vercel.');
            return res.status(500).json({ error: 'API key not configured on server' });
        }

        console.log(`Sending prompt to fal.ai: "${prompt}" with resolution: ${resolution || '720p'}`);

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
            console.error('fal.ai error response:', data);
            return res.status(response.status).json({ error: data.error || 'AI generation failed from provider' });
        }

        const videoUrl = data.video?.url || data.video_url || data.url;

        if (!videoUrl) {
            console.error('No video URL found in fal.ai response:', data);
            return res.status(500).json({ error: 'Video URL not returned from AI provider' });
        }

        return res.status(200).json({
            success: true,
            videoUrl: videoUrl,
            resolutionUsed: resolution || "720p"
        });

    } catch (error) {
        console.error('Internal server crash in generate-video function:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
};
