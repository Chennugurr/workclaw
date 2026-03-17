import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware, ROLE } from '@/api/middleware';
import { parseSearchQuery } from '@/lib/parse-search-query';
import prisma from '@/lib/prisma';

export const GET = middleware(
  async (req) => {
    const { searchTerm, page, limit, sort, order, orgId, jobId } =
      parseSearchQuery(req);

    if (!orgId) {
      return NextResponse.json(
        jsend.fail({ message: 'Organization ID is required' }),
        { status: 400 }
      );
    }

    // Construct the base query
    let query = {
      where: {
        staff: {
          orgId,
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sort]: order },
      select: {
        id: true,
        staff: {
          select: {
            id: true,
            role: true,
            user: {
              select: {
                id: true,
                address: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                    title: true,
                    bio: true,
                  },
                },
              },
            },
          },
        },
        job: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    };

    // Add search term to query if provided
    if (searchTerm) {
      query.where.OR = [
        {
          staff: {
            user: {
              profile: {
                OR: [
                  { firstName: { contains: searchTerm, mode: 'insensitive' } },
                  { lastName: { contains: searchTerm, mode: 'insensitive' } },
                  { bio: { contains: searchTerm, mode: 'insensitive' } },
                ],
              },
            },
          },
        },
        { staff: { role: { contains: searchTerm, mode: 'insensitive' } } },
        { job: { title: { contains: searchTerm, mode: 'insensitive' } } },
      ];
    }

    // Add jobId filter if provided
    if (jobId) {
      query.where.jobId = jobId;
    }

    // Execute the query
    const [recruiters, totalCount] = await prisma.$transaction([
      prisma.recruiter.findMany(query),
      prisma.recruiter.count({ where: query.where }),
    ]);

    // Prepare pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json(
      jsend.success({
        items: recruiters,
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
      roles: [ROLE.ORGANIZATION.ADMIN],
      resolve: (req) => {
        const { orgId } = parseSearchQuery(req);
        return [orgId];
      },
    },
  }
);
