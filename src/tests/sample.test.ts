
import { describe, expect, test } from '@jest/globals';
import { request_helper } from './request_helper';


describe('Hello World', () => {
    test('Test / route', async () => {
      let hello_data = await request_helper.request('GET', '/', null)
      expect(hello_data.data).toBe('Hello World!')
    });
}
)