import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware, ROLE } from '@/api/middleware';
import { parseSearchQuery } from '@/lib/parse-search-query';
import prisma from '@/lib/prisma';

export const GET = middleware(
  async (req) => {
    const { searchTerm, page, limit, sort, order, orgId, role } =
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
        orgId,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sort]: order },
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
                experience: true,
                availability: true,
              },
            },
          },
        },
      },
    };

    // Add search term to query if provided
    if (searchTerm) {
      query.where.OR = [
        {
          user: {
            profile: {
              OR: [
                { firstName: { contains: searchTerm, mode: 'insensitive' } },
                { lastName: { contains: searchTerm, mode: 'insensitive' } },
                { title: { contains: searchTerm, mode: 'insensitive' } },
                { bio: { contains: searchTerm, mode: 'insensitive' } },
              ],
            },
          },
        },
        {
          user: {
            skills: {
              some: {
                skill: {
                  name: { contains: searchTerm, mode: 'insensitive' },
                },
              },
            },
          },
        },
        { role: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    // Add role filter if provided
    if (role) {
      query.where.role = role;
    }

    // Execute the query
    const [staff, totalCount] = await prisma.$transaction([
      prisma.organizationStaff.findMany(query),
      prisma.organizationStaff.count({ where: query.where }),
    ]);

    // Prepare pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json(
      jsend.success({
        items: staff,
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
