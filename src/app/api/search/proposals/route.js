import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware, ROLE } from '@/api/middleware';
import { parseSearchQuery } from '@/lib/parse-search-query';
import prisma from '@/lib/prisma';

export const GET = middleware(
  async (req) => {
    const {
      searchTerm,
      page,
      limit,
      sort,
      order,
      userId,
      orgId,
      jobId,
      status,
    } = parseSearchQuery(req);

    // Construct the base query
    let query = {
      where: {},
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sort]: order },
      select: {
        id: true,
        budget: true,
        statement: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        completedAt: true,
        user: {
          select: {
            id: true,
            address: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                title: true,
              },
            },
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            budget: true,
            currency: true,
            status: true,
            position: true,
            location: true,
            org: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
          },
        },
      },
    };

    // Add search term to query if provided
    if (searchTerm) {
      query.where.OR = [
        { statement: { contains: searchTerm, mode: 'insensitive' } },
        {
          user: {
            profile: {
              OR: [
                { firstName: { contains: searchTerm, mode: 'insensitive' } },
                { lastName: { contains: searchTerm, mode: 'insensitive' } },
              ],
            },
          },
        },
        { job: { title: { contains: searchTerm, mode: 'insensitive' } } },
        {
          job: {
            org: { name: { contains: searchTerm, mode: 'insensitive' } },
          },
        },
      ];
    }

    // Add filters based on provided IDs
    if (userId) query.where.userId = userId;
    if (orgId) query.where.job = { orgId };
    if (jobId) query.where.jobId = jobId;

    // Add status filter if provided
    if (status) query.where.status = status.toUpperCase();

    // Execute the query
    const [proposals, totalCount] = await prisma.$transaction([
      prisma.proposal.findMany(query),
      prisma.proposal.count({ where: query.where }),
    ]);

    // Prepare pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json(
      jsend.success({
        items: proposals,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage,
          hasPrevPage,
        },
      })
    );
  },
  {
    requireAuth: true,
    role: {
      roles: [ROLE.SELF, ROLE.ORGANIZATION.MEMBER, ROLE.RECRUITER],
      resolve: (req) => {
        const { userId, orgId, jobId } = parseSearchQuery(req);
        return [userId, orgId, jobId];
      },
    },
  }
);
