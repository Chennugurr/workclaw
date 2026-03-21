import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware } from '@/api/middleware';
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
      orgId,
      position,
      experience,
      ...params
    } = parseSearchQuery(req);
    let status = params.status;

    if (orgId && req.user) {
      const staff = await prisma.organizationStaff.findUnique({
        where: {
          userId_orgId: {
            userId: req.user.id,
            orgId: orgId,
          },
        },
      });
      if (!staff) status = 'open';
    } else {
      status = 'open';
    }

    // Construct the base query
    let query = {
      where: {},
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sort]: order },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        taskType: true,
        domain: true,
        difficulty: true,
        payModel: true,
        rateAmount: true,
        currency: true,
        capacity: true,
        taskVolume: true,
        requiredTier: true,
        visibility: true,
        organization: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            applications: true,
          },
        },
      },
    };

    // Add search term to query if provided
    if (searchTerm) {
      query.where.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { organization: { name: { contains: searchTerm, mode: 'insensitive' } } },
      ];
    }

    // Add filters if provided
    if (orgId) {
      query.where.orgId = orgId;

      // orgId filter already set above
    }
    if (status) {
      query.where.status = status.toUpperCase();
    }

    // Execute the query
    const [jobs, totalCount] = await prisma.$transaction([
      prisma.project.findMany(query),
      prisma.project.count({ where: query.where }),
    ]);

    // Prepare pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json(
      jsend.success({
        items: jobs,
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
