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
    '/todos': {
      get: {
        tags: ['Todos'],
        summary: 'List all todos',
        responses: {
          '200': {
            description: 'A list of todos',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Todo',
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Todos'],
        summary: 'Create a todo',
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
    schemas: {
      Todo: {
        type: 'object',
        required: ['id', 'title'],
        properties: {
          id: {
            type: 'integer',
            example: 1,
          },
          title: {
            type: 'string',
            example: 'Learn Hono',
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