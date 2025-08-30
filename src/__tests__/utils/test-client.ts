/**
 * TASK-110: Catch-up Plan API Implementation - Test Client Utility (TDD Red Phase)
 * 
 * このファイルは意図的に失敗するテストを含みます。
 * 実装が完了するまでテストは失敗し続けます。
 */

interface RequestOptions {
  body?: any;
  headers?: Record<string, string>;
}

interface TestResponse {
  status: number;
  data: any;
  headers: Record<string, string>;
}

/**
 * Test client for API requests during testing
 * This will fail until the actual API endpoints are implemented
 */
export const testClient = {
  async get(url: string, options: RequestOptions = {}): Promise<TestResponse> {
    // This will fail until GET /api/catchup-plans is implemented
    throw new Error(`GET ${url} not implemented yet - waiting for implementation`);
  },

  async post(url: string, options: RequestOptions = {}): Promise<TestResponse> {
    // This will fail until POST /api/catchup-plans is implemented
    throw new Error(`POST ${url} not implemented yet - waiting for implementation`);
  },

  async put(url: string, options: RequestOptions = {}): Promise<TestResponse> {
    // This will fail until PUT endpoints are implemented
    throw new Error(`PUT ${url} not implemented yet - waiting for implementation`);
  },

  async delete(url: string, options: RequestOptions = {}): Promise<TestResponse> {
    // This will fail until DELETE endpoints are implemented
    throw new Error(`DELETE ${url} not implemented yet - waiting for implementation`);
  }
};