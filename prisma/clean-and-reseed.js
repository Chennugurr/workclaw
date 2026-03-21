const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Deletes old seeded data (tasks, batches, projects, screenings, org)
 * so the seed scripts can run fresh.
 */
async function main() {
  console.log('Cleaning old seeded data...\n');

  // Delete tasks, batches, and projects for Workclaw org
  const org = await prisma.organization.findFirst({ where: { name: 'Workclaw' } });
  if (org) {
    const projects = await prisma.project.findMany({
      where: { orgId: org.id },
      select: { id: true, title: true },
    });

    for (const project of projects) {
      // Delete submissions for tasks in this project
      const tasks = await prisma.task.findMany({
        where: { projectId: project.id },
        select: { id: true },
      });
      const taskIds = tasks.map((t) => t.id);

      if (taskIds.length > 0) {
        const delSubmissions = await prisma.submission.deleteMany({
          where: { taskId: { in: taskIds } },
        });
        console.log(`  Deleted ${delSubmissions.count} submissions for ${project.title}`);
      }

      // Delete tasks
      const delTasks = await prisma.task.deleteMany({ where: { projectId: project.id } });
      console.log(`  Deleted ${delTasks.count} tasks for ${project.title}`);

      // Delete task batches
      const delBatches = await prisma.taskBatch.deleteMany({ where: { projectId: project.id } });
      console.log(`  Deleted ${delBatches.count} batches for ${project.title}`);

      // Delete applications
      const delApps = await prisma.application.deleteMany({ where: { projectId: project.id } });
      console.log(`  Deleted ${delApps.count} applications for ${project.title}`);
    }

    // Delete projects
    const delProjects = await prisma.project.deleteMany({ where: { orgId: org.id } });
    console.log(`\nDeleted ${delProjects.count} projects`);
  }

  // Delete screening data
  const screenings = await prisma.screening.findMany({ select: { id: true, title: true } });
  for (const screening of screenings) {
    const delAttempts = await prisma.screeningAttempt.deleteMany({
      where: { screeningId: screening.id },
    });
    console.log(`  Deleted ${delAttempts.count} attempts for screening: ${screening.title}`);

    const delQuestions = await prisma.screeningQuestion.deleteMany({
      where: { screeningId: screening.id },
    });
    console.log(`  Deleted ${delQuestions.count} questions for screening: ${screening.title}`);
  }
  const delScreenings = await prisma.screening.deleteMany({});
  console.log(`Deleted ${delScreenings.count} screenings`);

  console.log('\n✓ Cleanup complete. Run seed scripts to re-populate.');
}

main()
  .catch((e) => {
    console.error('Cleanup failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
