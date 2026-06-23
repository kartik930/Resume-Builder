const { optimizeResume } = require("../services/aiService");

/**
 * Handle POST /api/ai/optimize
 * Optimizes the resume fields using Gemini AI
 */
exports.optimizeResumeData = async (req, res) => {
    try {
        const { resumeData } = req.body;

        if (!resumeData) {
            return res.status(400).json({ 
                success: false, 
                message: "No resume data provided for optimization." 
            });
        }

        const optimizedData = await optimizeResume(resumeData);

        res.json({
            success: true,
            message: "Resume optimized successfully",
            optimizedData
        });
    } catch (error) {
        console.error("AI Controller Error:", error.message);
        
        // Differentiate between API Key configuration issues and other errors
        const isConfigError = error.message.includes("Gemini API key is not configured");
        res.status(isConfigError ? 400 : 500).json({
            success: false,
            message: error.message,
            code: isConfigError ? "API_KEY_MISSING" : "AI_OPTIMIZATION_FAILED"
        });
    }
};
