import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware } from '@/api/middleware';
import { parseSearchQuery } from '@/lib/parse-search-query';
import prisma from '@/lib/prisma';

export const GET = middleware(
  async (req) => {
    const { searchTerm, page, limit, sort, order, userId, type, teamSize } =
      parseSearchQuery(req);

    // Construct the base query
    let query = {
      where: {},
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sort]: order },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        website: true,
        location: true,
        foundedIn: true,
        type: true,
        teamSize: true,
        bio: true,
        logo: true,
        banner: true,
        socials: {
          select: {
            platform: true,
            handleOrUrl: true,
          },
        },
        _count: {
          select: {
            projects: true,
            socials: true,
          },
        },
      },
    };

    // Add search term to query if provided
    if (searchTerm) {
      query.where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { bio: { contains: searchTerm, mode: 'insensitive' } },
        { location: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    // Add userId filter if provided
    if (userId) {
      query.where.staffs = {
        some: { userId },
      };
    }

    // Add type filter if provided
    if (type) {
      query.where.type = type;
    }

    // Add teamSize filter if provided
    if (teamSize) {
      query.where.teamSize = teamSize;
    }

    // Execute the query
    const [organizations, totalCount] = await prisma.$transaction([
      prisma.organization.findMany(query),
      prisma.organization.count({ where: query.where }),
    ]);

    // Prepare pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json(
      jsend.success({
        items: organizations,
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
