import _ from 'lodash';
import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware } from '@/api/middleware';
import { parseSearchQuery } from '@/lib/parse-search-query';
import prisma from '@/lib/prisma';

export const GET = middleware(
  async (req) => {
    const { searchTerm, page, limit, sort, order, availability, ...params } =
      parseSearchQuery(req);
    const skillIds = _.compact(_.split(_.get(params, 'skillIds', ''), ','));
    const experienceLevels = _.compact(
      _.split(_.get(params, 'experienceLevels', ''), ',')
    );

    // Only customers and admins can search contributors
    if (req.user.role !== 'CUSTOMER' && req.user.role !== 'ADMIN') {
      return NextResponse.json(jsend.fail({ message: 'Forbidden' }), { status: 403 });
    }

    // Construct the base query
    let query = {
      where: {},
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sort]: order },
      select: {
        id: true,
        address: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            title: true,
            location: true,
            education: true,
            experience: true,
            availability: true,
            bio: true,
            pfp: true,
          },
        },
        skills: {
          select: {
            level: true,
            skill: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    };

    // Add search term to query if provided
    if (searchTerm) {
      query.where.OR = [
        { address: { contains: searchTerm, mode: 'insensitive' } },
        {
          profile: {
            OR: [
              { firstName: { contains: searchTerm, mode: 'insensitive' } },
              { middleName: { contains: searchTerm, mode: 'insensitive' } },
              { lastName: { contains: searchTerm, mode: 'insensitive' } },
              { title: { contains: searchTerm, mode: 'insensitive' } },
              { bio: { contains: searchTerm, mode: 'insensitive' } },
            ],
          },
        },
        {
          skills: {
            some: {
              skill: { name: { contains: searchTerm, mode: 'insensitive' } },
            },
          },
        },
      ];
    }

    // Add skill filter if provided
    if (skillIds && skillIds.length > 0) {
      query.where.skills = {
        some: {
          skillId: { in: skillIds },
        },
      };
    }

    // Add experience level filter if provided
    if (experienceLevels && experienceLevels.length > 0) {
      query.where.profile = {
        ...query.where.profile,
        experience: { in: experienceLevels },
      };
    }

    // Add availability filter if provided
    if (availability) {
      query.where.profile = {
        ...query.where.profile,
        availability: availability === 'AVAILABLE' ? 'AVAILABLE' : undefined,
      };
    }

    // Execute the query
    const [candidates, totalCount] = await prisma.$transaction([
      prisma.user.findMany(query),
      prisma.user.count({ where: query.where }),
    ]);

    // Prepare pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json(
      jsend.success({
        items: candidates,
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
