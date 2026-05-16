import { Router, Request, Response, NextFunction } from 'express';
import AgentOrchestrator from '@agents/orchestrator';
import logger from '@utils/logger';

const router = Router();
const orchestrator = new AgentOrchestrator();

// List available agents
router.get('/', (req: Request, res: Response) => {
  const agents = orchestrator.getAvailableAgents();
  res.json({ success: true, data: agents });
});

// Execute agent task
router.post('/execute', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { agentType, useCase, payload } = req.body;

    if (!agentType || !useCase) {
      return res.status(400).json({
        success: false,
        message: 'agentType and useCase are required',
      });
    }

    const result = await orchestrator.executeAgent(agentType, useCase, payload);
    logger.info(`Agent executed: ${agentType} - ${useCase}`);
    
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// Get agent status
router.get('/status/:agentId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = await orchestrator.getAgentStatus(req.params.agentId);
    res.json({ success: true, data: status });
  } catch (error) {
    next(error);
  }
});

export default router;
