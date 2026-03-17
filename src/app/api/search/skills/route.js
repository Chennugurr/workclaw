import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware } from '@/api/middleware';
import { parseSearchQuery } from '@/lib/parse-search-query';
import prisma from '@/lib/prisma';

export const GET = middleware(
  async (req) => {
    const { searchTerm, page, limit, sort, order, userId, projectId } =
      parseSearchQuery(req);

    // Validate that userId and projectId are not both present
    if (userId && projectId) {
      return NextResponse.json(
        jsend.fail({ message: 'userId and projectId cannot be used together' }),
        { status: 400 }
      );
    }

    // Construct the base query
    let query = {
      where: {},
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sort]: order },
    };

    // Add search term to query if provided
    if (searchTerm) {
      query.where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    // If userId or projectId is provided, set up the include structure for associations
    if (userId || projectId) {
      query.include = {
        associations: {
          include: {},
        },
      };
    }

    // Add userId filter if provided
    if (userId) {
      query.where.associations = {
        some: {
          userId,
          ownerType: 'USER',
        },
      };
      query.include.associations.include.user = {
        select: {
          id: true,
          profile: {
            select: {
              firstName: true,
              lastName: true,
              title: true,
            },
          },
        },
      };
    }

    // Add projectId filter if provided
    if (projectId) {
      query.where.associations = {
        some: {
          projectId,
          ownerType: 'PROJECT',
        },
      };
      query.include.associations.include.job = {
        select: {
          id: true,
          title: true,
          budget: true,
          currency: true,
          status: true,
          org: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      };
    }

    // Execute the query
    const [skills, totalCount] = await prisma.$transaction([
      prisma.skill.findMany(query),
      prisma.skill.count({ where: query.where }),
    ]);

    // Prepare pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json(
      jsend.success({
        items: skills,
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
  { withAuth: true }
);
