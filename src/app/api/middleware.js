import { z } from 'zod';
import jsend from 'jsend';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { hashToken } from '@/lib/hash-token';
import prisma from '@/lib/prisma';

/**
 * Retrieves the user from the request's authorization header.
 *
 * @param {Object} req - The request object containing headers.
 * @returns {Promise<Object|null>} The user object if found and authenticated, or null otherwise.
 */
async function getUserFromReq(req) {
  try {
    // Extract the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    // Extract the token from the header
    const token = authHeader.split(' ')[1];

    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.uid) {
      return null;
    }

    // Hash the token for comparison
    const hashedToken = hashToken(token);

    // Find the active session for the user
    const session = await prisma.session.findFirst({
      where: {
        userId: decoded.uid,
        accessToken: hashedToken,
        status: 'ACTIVE',
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!session) {
      return null;
    }

    // Update the lastSeenAt timestamp
    await prisma.session.update({
      where: { id: session.id },
      data: { lastSeenAt: new Date() },
    });

    // Retrieve and return the user
    return await prisma.user.findUnique({
      where: { id: session.userId },
      include: { profile: true },
    });
  } catch (error) {
    // Return null if any error occurs during the process
    return null;
  }
}

/**
 * Higher-order function that wraps a handler with error handling functionality.
 *
 * @param {Function} handler - The main request handler function.
 * @param {Function} [errorHandler] - Optional custom error handler function.
 * @returns {Function} A wrapped handler with error handling.
 *
 * @example
 * const GET = withErrorHandling(
 *   async (req) => {
 *     // Main handler logic
 *   },
 *   (error, defaultErrorHandler) => {
 *     // Custom error handling logic
 *   }
 * );
 */
function withErrorHandling(handler, errorHandler) {
  return async function (...args) {
    try {
      return await handler(...args);
    } catch (error) {
      console.error(error);

      const defaultErrorHandler = () => {
        if (error instanceof TypeError || error instanceof ReferenceError) {
          return NextResponse.json(jsend.error('ERROR.BAD_REQUEST'), {
            status: 400,
          });
        }

        if (error.name === 'PrismaClientKnownRequestError') {
          return NextResponse.json(jsend.error('ERROR.DATABASE_ERROR'), {
            status: 500,
          });
        }

        return NextResponse.json(jsend.error('ERROR.INTERNAL_SERVER_ERROR'), {
          status: 500,
        });
      };

      if (errorHandler) return errorHandler(error, defaultErrorHandler);
      return defaultErrorHandler();
    }
  };
}

/**
 * Higher-order function that wraps a handler with body validation functionality using Zod.
 *
 * @param {Function} handler - The main request handler function.
 * @param {z.ZodSchema} schema - Zod schema for body validation.
 * @returns {Function} A wrapped handler with body validation.
 *
 * @example
 * const userSchema = z.object({
 *   firstName: z.string(),
 *   lastName: z.string(),
 *   email: z.string().email().optional(),
 * });
 *
 * const POST = withBodyValidation(
 *   async (req) => {
 *     // Main handler logic
 *   },
 *   userSchema
 * );
 */
function withBodyValidation(handler, schema) {
  return async (req, ...rest) => {
    try {
      const body = await req.json();
      req.dto = await schema.parseAsync(body);
      return handler(req, ...rest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          jsend.fail({
            message: 'ERROR.VALIDATION_ERROR',
            errors: error.errors,
          }),
          { status: 400 }
        );
      }
      throw error;
    }
  };
}

/**
 * Higher-order function that wraps a handler with authentication functionality.
 *
 * @param {Function} handler - The main request handler function.
 * @param {Object} [options] - Configuration options.
 * @param {boolean} [options.requireAuth=true] - Whether authentication is required.
 * @returns {Function} A wrapped handler with authentication.
 *
 * @example
 * const GET = withAuth(
 *   async (req) => {
 *     const user = req.user;
 *     // Main handler logic with authenticated user
 *   },
 *   { requireAuth: true }
 * );
 */
function withAuth(handler, options = { requireAuth: true }) {
  return async function (req, ...args) {
    const user = await getUserFromReq(req);

    if (options.requireAuth && !user) {
      return NextResponse.json(jsend.error('ERROR.UNAUTHORIZED'), {
        status: 401,
      });
    }

    req.user = user;
    return handler(req, ...args);
  };
}

/**
 * Object containing role definitions for the application.
 * @constant
 * @type {Object}
 */
export const ROLE = Object.freeze({
  /** Represents the user's own role */
  SELF: Symbol('self'),

  /** Organization-related roles */
  ORGANIZATION: Object.freeze({
    /** Owner of an organization */
    OWNER: Symbol('organization.owner'),
    /** Admin of an organization */
    ADMIN: Symbol('organization.admin'),
    /** Member of an organization */
    MEMBER: Symbol('organization.member'),
  }),

  /** Recruiter role */
  RECRUITER: Symbol('recruiter'),

  /** Candidate-related roles based on application status */
  CANDIDATE: Object.freeze({
    /** Candidate who has applied */
    APPLIED: Symbol('candidate.applied'),
    /** Candidate who has withdrawn their application */
    WITHDRAWN: Symbol('candidate.withdrawn'),
    /** Candidate who has been shortlisted */
    SHORTLISTED: Symbol('candidate.shortlisted'),
    /** Candidate who has been archived */
    ARCHIVED: Symbol('candidate.archived'),
    /** Candidate who has been hired */
    HIRED: Symbol('candidate.hired'),
  }),
});

// Helper function to get role condition
function getOrganizationRoleCondition(role) {
  switch (role) {
    case ROLE.ORGANIZATION.MEMBER:
      return { in: ['OWNER', 'ADMIN', 'MEMBER'] };
    case ROLE.ORGANIZATION.ADMIN:
      return { in: ['ADMIN', 'OWNER'] };
    case ROLE.ORGANIZATION.OWNER:
      return 'OWNER';
    default:
      return null;
  }
}

// Helper function to get candidate status condition
function getCandidateStatusCondition(role) {
  switch (role) {
    case ROLE.CANDIDATE.APPLIED:
      return 'APPLIED';
    case ROLE.CANDIDATE.WITHDRAWN:
      return 'WITHDRAWN';
    case ROLE.CANDIDATE.SHORTLISTED:
      return 'SHORTLISTED';
    case ROLE.CANDIDATE.ARCHIVED:
      return 'ARCHIVED';
    case ROLE.CANDIDATE.HIRED:
      return 'HIRED';
    default:
      return null;
  }
}

/**
 * Higher-order function that wraps a request handler with role-based access control.
 *
 * @param {Function} handler - The main request handler function.
 * @param {Array<ROLE>} roles - The roles required for access, defined in the ROLE object.
 * @param {Function} [resolve] - Optional function to resolve the resource IDs from the request.
 * @param {Function|string} [validate] - Optional validator function or string. If a function, it should return a boolean. If a string, it can be 'some' or 'every'. Defaults to 'some' if not provided.
 * @returns {Function} A wrapped handler with role-based access control.
 *
 * @throws {NextResponse} Returns a 400 Bad Request response if the resource ID is not provided.
 * @throws {NextResponse} Returns a 401 Unauthorized response if the user is not authenticated.
 * @throws {NextResponse} Returns a 403 Forbidden response if the user doesn't have the required role.
 * @throws {NextResponse} Returns a 404 Not Found response if the job is not found (for RECRUITER role).
 *
 * @example
 * // Basic usage with SELF role
 * export const GET = withRole(
 *   async (req) => {
 *     // Handle GET request for authenticated user
 *   },
 *   [ROLE.SELF]
 * );
 *
 * @example
 * // Usage with ORGANIZATION role and custom ID resolver
 * export const POST = withRole(
 *   async (req) => {
 *     // Handle POST request for organization member
 *   },
 *   [ROLE.SELF, ROLE.ORGANIZATION.OWNER],
 *   (_, { params }) => [params.userId, params.orgId]
 * );
 *
 * @example
 * // Usage with multiple roles and custom validator
 * export const PUT = withRole(
 *   async (req) => {
 *     // Handle PUT request for organization admin or recruiter
 *   },
 *   [ROLE.ORGANIZATION.ADMIN, ROLE.RECRUITER],
 *   (_, { params }) => [params.orgId, params.projectId],
 *   'every'
 * );
 */
function withRole(handler, roles = [], resolve = null, validate = 'some') {
  return async function (req, ...args) {
    const { params } = args[0];

    let ids = [];
    if (resolve) {
      if (typeof resolve === 'function') {
        ids = await resolve(req, ...args);
      } else {
        ids = resolve;
      }
      if (!Array.isArray(ids) || ids.length !== roles.length) {
        return NextResponse.json(jsend.error('ROLE.INVALID_RESOLVER_OUTPUT'), {
          status: 400,
        });
      }
    } else {
      ids = new Array(roles.length).fill(null);
    }

    // Check if user is authenticated
    if (!req.user) {
      return NextResponse.json(jsend.error('ERROR.UNAUTHORIZED'), {
        status: 401,
      });
    }

    const roleChecks = new Array(roles.length).fill(false);

    for (let index = 0; index < roles.length; index++) {
      const role = roles[index];
      const organizationRole = Object.values(ROLE.ORGANIZATION);
      const candidateRole = Object.values(ROLE.CANDIDATE);

      const isSelf = role === ROLE.SELF;
      const isOrganization = organizationRole.includes(role);
      const isCandidate = candidateRole.includes(role);
      const isRecruiter = role === ROLE.RECRUITER;

      if (isSelf) {
        const id = ids[index] || params?.userId || params?.candidateId;
        roleChecks[index] = id && id === req.user.id;
      } else if (isOrganization) {
        const id = ids[index] || params?.orgId || params?.organizationId;

        if (!id) {
          roleChecks[index] = false;
          continue;
        }

        // Check if user has the required role in the organization
        const staff = await prisma.organizationStaff.findUnique({
          where: {
            userId_orgId: {
              userId: req.user.id,
              orgId: id,
            },
            role: getOrganizationRoleCondition(role),
          },
        });
        roleChecks[index] = !!staff;
      } else if (isRecruiter) {
        const id = ids[index] || params?.projectId;

        if (!id) {
          roleChecks[index] = false;
          continue;
        }

        // Check if job exists
        const job = await prisma.project.findUnique({
          where: { id },
        });
        if (!job) {
          roleChecks[index] = false;
          continue;
        }

        // Check if user is part of the organization
        const staff = await prisma.organizationStaff.findUnique({
          where: {
            userId_orgId: {
              userId: req.user.id,
              orgId: job.orgId,
            },
          },
        });
        if (!staff) {
          roleChecks[index] = false;
          continue;
        }

        // Check if user is a recruiter for the job
        const recruiter = await prisma.reviewerAssignment.findUnique({
          where: {
            staffId_projectId: {
              staffId: staff.id,
              projectId: id,
            },
          },
        });
        roleChecks[index] = !!recruiter;
      } else if (isCandidate) {
        const id = ids[index] || params?.projectId;

        if (!id) {
          roleChecks[index] = false;
          continue;
        }

        // Check if user has a proposal for the job with the required status
        const proposal = await prisma.application.findUnique({
          where: {
            userId_projectId: {
              userId: req.user.id,
              projectId: id,
            },
            status: getCandidateStatusCondition(role),
          },
        });
        roleChecks[index] = !!proposal;
      } else {
        return NextResponse.json(jsend.error('ROLE.NOT_RECOGNIZED'), {
          status: 403,
        });
      }
    }

    if (typeof validate === 'function') {
      if (!validate(roleChecks)) {
        return NextResponse.json(jsend.error('ERROR.FORBIDDEN'), {
          status: 403,
        });
      }
    } else if (validate === 'every') {
      if (!roleChecks.every((check) => check)) {
        return NextResponse.json(jsend.error('ERROR.FORBIDDEN'), {
          status: 403,
        });
      }
    } else {
      if (!roleChecks.some((check) => check)) {
        return NextResponse.json(jsend.error('ERROR.FORBIDDEN'), {
          status: 403,
        });
      }
    }

    // If all checks pass, call the original handler
    return handler(req, ...args);
  };
}

/**
 * Middleware function that combines authentication, body validation, role-based access control, and error handling.
 *
 * @param {Function} handler - The main request handler function.
 * @param {Function} [errorHandler] - Optional custom error handler function.
 * @param {Object} [options] - Configuration options.
 * @param {boolean} [options.withAuth=false] - Whether to apply authentication.
 * @param {boolean} [options.requireAuth=false] - Whether authentication is required.
 * @param {z.ZodSchema} [options.bodySchema] - Zod schema for body validation.
 * @param {Object} [options.role] - Role for access control.
 * @param {Array<ROLE>} [options.role.roles=[]] - Array of ROLE enums for access control.
 * @param {Function} [options.role.resolve] - Function to resolve the resource ID from the request.
 * @param {Function|string} [options.role.validate='some'] - Function to validate role checks or 'some'/'every' string.
 * @returns {Function} A wrapped handler with error handling, optional authentication, body validation, and role-based access control.
 *
 * @example
 * // Basic usage without authentication
 * export const GET = middleware(async (req) => {
 *   // Handle GET request
 * });
 *
 * @example
 * // With authentication required, body validation, and role-based access
 * const userSchema = z.object({
 *   name: z.string(),
 *   email: z.string().email(),
 * });
 *
 * export const POST = middleware(
 *   async (req) => {
 *     const user = req.user; // authenticated user is guaranteed
 *     // Handle POST request with authenticated user and validated body
 *   },
 *   {
 *     requireAuth: true,
 *     bodySchema: userSchema,
 *     role: {
 *       roles: [ROLE.SELF],
 *       resolve: (_, { params }) => [params.userId],
 *       validate: 'some',
 *     }
 *   }
 * );
 *
 * @example
 * // With custom error handling and optional authentication
 * export const PUT = middleware(
 *   async (req) => {
 *     const user = req.user; // authenticated user can be null
 *     // Handle PUT request
 *   },
 *   (error, defaultErrorHandler) => {
 *     // Custom error handling logic
 *     return defaultErrorHandler();
 *   },
 *   { withAuth: true }
 * );
 */
export function middleware(...args) {
  // Extract the main handler function from the first argument
  let handler = args[0];

  // Initialize variables for error handler and options
  let errorHandler = null;
  let options = {
    withAuth: false,
    requireAuth: false,
    bodySchema: null,
    role: {
      roles: [],
      resolve: null,
      validate: 'some',
    },
  };

  // Check if the second argument is a function (custom error handler)
  if (typeof args[1] === 'function') {
    errorHandler = args[1];
    // If there's a third argument and it's an object, use it as options
    if (typeof args[2] === 'object') {
      options = {
        ...options,
        ...args[2],
        role: {
          ...options.role,
          ...args[2].role,
        },
      };
    }
  } else if (typeof args[1] === 'object') {
    // If the second argument is an object, use it as options
    options = {
      ...options,
      ...args[1],
      role: {
        ...options.role,
        ...args[1].role,
      },
    };
  }

  // Apply role-based access control if roles are provided
  if (
    options.role &&
    Array.isArray(options.role.roles) &&
    options.role.roles.length > 0
  ) {
    handler = withRole(
      handler,
      options.role.roles,
      options.role.resolve,
      options.role.validate
    );
  }

  // Apply body validation if bodySchema is provided
  if (options.bodySchema) {
    handler = withBodyValidation(handler, options.bodySchema);
  }

  // Ensure withAuth is true if requireAuth is true
  if (!options.withAuth && options.requireAuth) options.withAuth = true;

  // Apply authentication if withAuth is true
  if (options.withAuth) {
    handler = withAuth(handler, {
      requireAuth: options.requireAuth,
    });
  }

  // Return the handler wrapped with error handling
  return withErrorHandling(handler, errorHandler);
}
