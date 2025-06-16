import { Router, Request, Response } from 'express';

const router = Router();

router.post('/query', async (req: Request, res: Response) => {
  try {
    const { question, game_id } = req.body;

    if (!question || !game_id) {
      return res.status(400).json({
        error: 'Missing required fields: question and game_id are required'
      });
    }

    // TODO: Implement actual rule query logic
    res.json({
      answer: "This is a placeholder response. Rule query logic not yet implemented.",
      sources: [],
      confidence: 0
    });
  } catch (error) {
    console.error('Error querying rules:', error);
    res.status(500).json({
      error: 'Failed to process rule query'
    });
  }
});

export { router as rulesRouter }; 