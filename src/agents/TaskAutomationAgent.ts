import Task from '@database/models/Task';
import Activity from '@database/models/Activity';
import logger from '@utils/logger';

export class TaskAutomationAgent {
  public async createTasksFromWorkflow(workflowId: string, trigger: any, tenantId: string): Promise<any> {
    try {
      const tasks = [];

      // Example: Auto-create follow-up tasks based on trigger
      if (trigger.event === 'deal_created') {
        tasks.push({
          tenantId,
          dealId: trigger.dealId,
          contactId: trigger.contactId,
          title: 'Send deal confirmation email',
          priority: 'high',
          status: 'open',
          dueDate: new Date(Date.now() + 1 * 60 * 60 * 1000),
          automationTriggerId: workflowId,
        });

        tasks.push({
          tenantId,
          dealId: trigger.dealId,
          contactId: trigger.contactId,
          title: 'Schedule discovery meeting',
          priority: 'high',
          status: 'open',
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          automationTriggerId: workflowId,
        });
      }

      const createdTasks = await Task.bulkCreate(tasks);
      logger.info(`Tasks created from workflow: ${workflowId}, Count: ${createdTasks.length}`);

      return {
        workflowId,
        tasksCreated: createdTasks.length,
        taskIds: createdTasks.map(t => t.id),
      };
    } catch (error) {
      logger.error('Task automation failed:', error);
      throw error;
    }
  }

  public async prioritizeTasks(tenantId: string): Promise<any> {
    try {
      const tasks = await Task.findAll({
        where: { status: 'open', tenantId },
      });

      const prioritized = tasks.map(task => ({
        ...task.toJSON(),
        priority: this.calculatePriority(task),
      })).sort((a, b) => {
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority as keyof typeof priorityOrder] - 
               priorityOrder[b.priority as keyof typeof priorityOrder];
      });

      logger.info(`Tasks prioritized for tenant: ${tenantId}`);
      return prioritized.slice(0, 10); // Return top 10
    } catch (error) {
      logger.error('Task prioritization failed:', error);
      throw error;
    }
  }

  private calculatePriority(task: Task): string {
    const now = new Date();
    if (task.priority === 'urgent') return 'urgent';

    if (task.dueDate) {
      const hoursUntilDue = (task.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      if (hoursUntilDue < 24) return 'urgent';
      if (hoursUntilDue < 72) return 'high';
    }

    return task.priority;
  }
}

export default new TaskAutomationAgent();
