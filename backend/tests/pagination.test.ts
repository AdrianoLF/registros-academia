import { describe, it, expect } from 'vitest';
import {
  buildPageResult,
  parseEnabledFilter,
  parsePageQuery,
  skip,
} from '../src/domain/shared/pagination';

describe('parsePageQuery', () => {
  it('defaults to page 1 and limit 10', () => {
    expect(parsePageQuery({})).toEqual({ page: 1, limit: 10, search: '' });
  });

  it('parses page, limit and search', () => {
    expect(parsePageQuery({ page: '2', limit: '5', search: '  ana  ' })).toEqual({
      page: 2,
      limit: 5,
      search: 'ana',
    });
  });

  it('caps limit at 100', () => {
    expect(parsePageQuery({ limit: '500' }).limit).toBe(100);
  });
});

describe('buildPageResult', () => {
  it('computes total pages', () => {
    const result = buildPageResult([1, 2], 25, 2, 10);
    expect(result.totalPages).toBe(3);
    expect(result.items).toEqual([1, 2]);
  });

  it('returns zero pages when empty', () => {
    expect(buildPageResult([], 0, 1, 10).totalPages).toBe(0);
  });
});

describe('skip', () => {
  it('offsets by page', () => {
    expect(skip(3, 10)).toBe(20);
  });
});

describe('parseEnabledFilter', () => {
  it('parses true and false', () => {
    expect(parseEnabledFilter('true')).toBe(true);
    expect(parseEnabledFilter('false')).toBe(false);
  });

  it('returns undefined when omitted', () => {
    expect(parseEnabledFilter(undefined)).toBeUndefined();
  });
});
