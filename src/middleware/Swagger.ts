import { Hono } from 'hono'

const openApiDoc = {
  openapi: '3.0.0', // This is the required version field
  info: {
    title: 'Todo API',
    version: '1.0.0',
    description: 'API documentation for the Todo service',
  },
  tags: [
    {
      name: 'Authentication',
      description: 'Register accounts and issue access tokens',
    },
    {
      name: 'Todos',
      description: 'Create and manage todo items',
    },
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        responses: {
          '200': {
            description: 'OK',
            content: {
              'text/plain': {
                schema: {
                  type: 'string',
                  example: 'OK',
                },
              },
            },
          },
        },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register an account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Credentials' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Account created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          '400': { description: 'Invalid request body' },
          '409': { description: 'Email is already registered' },
          '429': { description: 'Too many authentication requests' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Sign in and receive an access token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Credentials' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Signed in',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          '400': { description: 'Invalid request body' },
          '401': { description: 'Invalid email or password' },
          '429': { description: 'Too many authentication requests' },
        },
      },
    },
    '/todos': {
      get: {
        tags: ['Todos'],
        summary: 'List todos with pagination',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            description: 'One-based page number (maximum 1,000,000)',
            schema: { type: 'integer', minimum: 1, maximum: 1000000, default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Number of todos per page',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          },
        ],
        responses: {
          '200': {
            description: 'A page of todos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TodoPage' },
              },
            },
          },
          '400': { description: 'Invalid query parameters' },
        },
      },
      post: {
        tags: ['Todos'],
        summary: 'Create a todo',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateTodo',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Todo created',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Todo',
                },
              },
            },
          },
          '400': {
            description: 'Invalid request body',
          },
        },
      },
    },
    '/todos/{id}': {
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Todo ID',
          schema: {
            type: 'integer',
            minimum: 1,
          },
        },
      ],
      get: {
        tags: ['Todos'],
        summary: 'Get a todo by ID',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': {
            description: 'Todo found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Todo',
                },
              },
            },
          },
          '404': {
            description: 'Todo not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
      put: {
        tags: ['Todos'],
        summary: 'Update a todo',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UpdateTodo',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Todo updated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Todo',
                },
              },
            },
          },
          '400': {
            description: 'Invalid request body',
          },
          '404': {
            description: 'Todo not found',
          },
        },
      },
      delete: {
        tags: ['Todos'],
        summary: 'Delete a todo',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': {
            description: 'Todo deleted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['message'],
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Todo deleted',
                    },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Todo not found',
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Credentials: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', maxLength: 254 },
          password: { type: 'string', minLength: 12, maxLength: 128 },
        },
      },
      AuthResponse: {
        type: 'object',
        required: ['accessToken', 'tokenType', 'expiresIn', 'user'],
        properties: {
          accessToken: { type: 'string' },
          tokenType: { type: 'string', example: 'Bearer' },
          expiresIn: { type: 'integer', example: 3600 },
          user: { $ref: '#/components/schemas/User' },
        },
      },
      User: {
        type: 'object',
        required: ['id', 'email'],
        properties: {
          id: { type: 'integer', example: 1 },
          email: { type: 'string', format: 'email', example: 'person@example.com' },
        },
      },
      Todo: {
        type: 'object',
        required: ['id', 'title', 'userId'],
        properties: {
          id: {
            type: 'integer',
            example: 1,
          },
          title: {
            type: 'string',
            example: 'Learn Hono',
          },
          userId: {
            type: 'integer',
            example: 1,
          },
        },
      },
      TodoPage: {
        type: 'object',
        required: ['data', 'pagination'],
        properties: {
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/Todo' },
          },
          pagination: {
            type: 'object',
            required: ['page', 'limit', 'totalItems', 'totalPages'],
            properties: {
              page: { type: 'integer', example: 1 },
              limit: { type: 'integer', example: 20 },
              totalItems: { type: 'integer', example: 42 },
              totalPages: { type: 'integer', example: 3 },
            },
          },
        },
      },
      CreateTodo: {
        type: 'object',
        required: ['title'],
        properties: {
          title: {
            type: 'string',
            example: 'Learn Hono',
          },
        },
      },
      UpdateTodo: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            example: 'Learn OpenAPI',
          },
        },
      },
      Error: {
        type: 'object',
        required: ['error'],
        properties: {
          error: {
            type: 'string',
            example: 'Todo not found',
          },
        },
      },
    },
  },
}

const app = new Hono()
// Serve the OpenAPI document
app.get('/doc', (c) => c.json(openApiDoc))

app.get('/health', (c) => c.text('OK'))

export default app