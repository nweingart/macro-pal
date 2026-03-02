import { describe, it, expect } from 'vitest';
import { stripMarkdownWrapper, sanitizeUserInput } from '../ai';

describe('stripMarkdownWrapper', () => {
  it('returns plain JSON unchanged', () => {
    const input = '{"name": "egg"}';
    expect(stripMarkdownWrapper(input)).toBe('{"name": "egg"}');
  });

  it('strips ```json fences', () => {
    const input = '```json\n{"name": "egg"}\n```';
    expect(stripMarkdownWrapper(input)).toBe('{"name": "egg"}');
  });

  it('strips ``` fences without language tag', () => {
    const input = '```\n{"name": "egg"}\n```';
    expect(stripMarkdownWrapper(input)).toBe('{"name": "egg"}');
  });

  it('handles already clean JSON with whitespace', () => {
    const input = '  {"name": "egg"}  ';
    expect(stripMarkdownWrapper(input)).toBe('{"name": "egg"}');
  });

  it('handles multiline JSON inside fences', () => {
    const input = '```json\n{\n  "name": "egg",\n  "servings": 2\n}\n```';
    const result = stripMarkdownWrapper(input);
    expect(JSON.parse(result)).toEqual({ name: 'egg', servings: 2 });
  });
});

describe('sanitizeUserInput', () => {
  it('truncates input at 500 characters', () => {
    const longInput = 'a'.repeat(600);
    expect(sanitizeUserInput(longInput).length).toBe(500);
  });

  it('preserves regular double quotes', () => {
    expect(sanitizeUserInput('"hello"')).toBe('"hello"');
  });

  it('flattens newlines to spaces', () => {
    expect(sanitizeUserInput('line1\nline2\r\nline3')).toBe('line1 line2 line3');
  });

  it('removes backslashes', () => {
    expect(sanitizeUserInput('test\\input')).toBe('testinput');
  });

  it('handles combined sanitization', () => {
    const input = '"hello"\nworld\\!';
    expect(sanitizeUserInput(input)).toBe('"hello" world!');
  });

  it('leaves normal input unchanged', () => {
    expect(sanitizeUserInput('2 eggs and toast')).toBe('2 eggs and toast');
  });
});
