import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware } from '@/api/middleware';
import prisma from '@/lib/prisma';

export const GET = middleware(
  async (req, { params }) => {
    const { projectId } = await params;

    const query = {
      where: { id: projectId },
      include: {
        org: true,
        skills: {
          select: {
            id: true,
            level: true,
            skill: {
              select: {
                id: true,
                name: true,
                description: true,
                verified: true,
                icon: true,
              },
            },
          },
        },
        screenings: {
          where: { status: 'ACTIVE' },
          select: {
            id: true,
            title: true,
            domain: true,
          },
        },
      },
    };

    if (req.user) {
      query.include.applications = {
        where: {
          userId: req.user.id,
        },
        select: {
          id: true,
          status: true,
        },
      };
    }

    const project = await prisma.project.findUnique(query);

    if (!project) {
      return NextResponse.json(jsend.fail({ message: 'Project not found' }), {
        status: 404,
      });
    }

    let res = { ...project };

    // Map application for authenticated user
    if (req.user) {
      res.application = project.applications?.[0] || null;
      delete res.applications;

      // Check if user has passed required screenings
      if (project.screenings && project.screenings.length > 0) {
        const screeningIds = project.screenings.map((s) => s.id);
        const passedAttempts = await prisma.screeningAttempt.findMany({
          where: {
            userId: req.user.id,
            screeningId: { in: screeningIds },
            passed: true,
          },
          select: { screeningId: true },
        });
        const passedIds = new Set(passedAttempts.map((a) => a.screeningId));
        res.screeningPassed = screeningIds.every((id) => passedIds.has(id));
        res.screeningDetails = project.screenings.map((s) => ({
          ...s,
          passed: passedIds.has(s.id),
        }));
      } else {
        res.screeningPassed = true;
        res.screeningDetails = [];
      }
    }

    // Rename org → organization for frontend consistency
    res.organization = res.org;
    delete res.org;

    return NextResponse.json(jsend.success(res));
  },
  { withAuth: true }
);
