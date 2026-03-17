import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware } from '@/api/middleware';
import prisma from '@/lib/prisma';

export const GET = middleware(
  async (req, { params }) => {
    const { jobId } = params;

    const query = {
      where: { id: jobId },
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
      },
    };

    if (req.user) {
      query.include.proposals = {
        where: {
          userId: req.user.id,
        },
        select: {
          id: true,
          status: true,
        },
      };
    }

    const job = await prisma.job.findUnique(query);

    if (!job) {
      return NextResponse.json(jsend.fail({ message: 'Job not found' }), {
        status: 404,
      });
    }

    let res = job;

    if (req.user) {
      res.proposal = job.proposals[0] || null;
      delete res.proposals;
    }

    return NextResponse.json(jsend.success(res));
  },
  { withAuth: true }
);
