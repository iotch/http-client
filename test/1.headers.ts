import Headers from '../src/Headers';
import 'mocha';
import { expect } from 'chai';

describe('Headers', () => {

    describe('Constructor', () => {
        it('should handle empty object', () => {
            const headers = new Headers({});
            expect(headers.getAll()).deep.equals({});
        });

        it('should handle empty string', () => {
            const headers = new Headers('');
            expect(headers.getAll()).deep.equals({});
        });

        it('should accept headers object', () => {
            const headers = new Headers({
                'Transfer-Encoding': 'chunked',
                'Connection': 'keep-alive',
            });

            expect(headers.getAll()).deep.equals({
                'Transfer-Encoding': 'chunked',
                'Connection': 'keep-alive',
            });
        });

        it('should parse headers string', () => {

            const strings: string[] = [];

            strings.push(`
                Cache-Control: no-cache, no-store, must-revalidate
                Connection : keep-alive
                ETag:W/"598cc43a-11bbf"
                Content-Encoding:gzip
            `);

            strings.push('Cache-Control: no-cache,no-store,must-revalidate\nConnection : keep-alive \r\n ' +
                'ETag: W/"598cc43a-11bbf" \n\rContent-Encoding :gzip');

            strings.forEach((string) => {
                const headers = new Headers(string);
                expect(headers.getAll()).deep.equals({
                    'Cache-Control': ['no-cache', 'no-store', 'must-revalidate'],
                    'Connection': 'keep-alive',
                    'ETag': 'W/"598cc43a-11bbf"',
                    'Content-Encoding': 'gzip',
                });
            });
        });
    });

    describe('has()', () => {
        const headers = new Headers({'cache-control': 'public'});

        it('should return true if header found', () => {
            expect(headers.has('cache-control')).true;
        });

        it('should return false if header not found', () => {
            expect(headers.has('accept')).false;
        });

        it('should return false on invalid header name', () => {
            expect(headers.has('')).false;
        });
    });

    describe('get()', () => {
        const headers = new Headers({'cache-control': 'public'});

        it('should return correct value', () => {
            expect(headers.get('cache-control')).equals('public');
        });

        it('should be case-insensitive', () => {
            expect(headers.get('Cache-Control')).equals('public');
        });

        it('should return default value if provided and no header found', () => {
            expect(headers.get('not-exist', 'default')).equals('default');
        });
    });

    describe('getAll()', () => {
        it('should return a new copy of the object', () => {
            const obj = {};

            const headers = new Headers(obj);
            expect(headers.getAll()).not.equals(obj);

            const returned = headers.getAll();
            (returned as any).foo = 'bar';
            expect(headers.getAll()).not.deep.equals({foo: 'bar'});
        });
    });

    describe('set()', () => {
        const headers = new Headers({'cache-control': 'public'});

        it('should set value', () => {
            headers.set('cache-control', 'private');
            expect(headers.get('cache-control')).equals('private');
        });

        it('should be case-insensitive', () => {
            headers.set('Cache-Control', 'private');
            expect(headers.get('cache-control')).equals('private');
        });

        it('should not set invalid headers', () => {
            headers.set('Cache-Control', '');
            expect(headers.get('cache-control')).equals('private');

            headers.set('', 'no-store');
            expect(headers.get('cache-control')).equals('private');
        });
    });

    describe('add()', () => {
        const headers = new Headers({});

        it('should set value if no header found', () => {
            headers.add('Cache-Control', 'no-cache');
            expect(headers.get('cache-control')).equals('no-cache');
        });

        it('should create an array of values and add new', () => {
            headers.add('Cache-Control', 'no-store');
            headers.add('Cache-Control', 'max-age=31536000');
            expect(headers.get('cache-control')).deep.equals(['no-cache', 'no-store', 'max-age=31536000']);
        });
    });

    describe('remove()', () => {
        const headers = new Headers({
            'Cache-Control': ['no-cache', 'no-store', 'must-revalidate'],
            'Connection': 'keep-alive',
        });

        it('should do nothing on non-existent header', () => {
            headers.remove('accept');
            expect(headers.get('cache-control')).deep.equals(['no-cache', 'no-store', 'must-revalidate']);
        });

        it('should delete value if header has multiple values', () => {
            headers.remove('cache-control', 'no-cache');
            expect(headers.get('cache-control')).deep.equals(['no-store', 'must-revalidate']);
        });

        it('should delete value and convert to string if single value left', () => {
            headers.remove('cache-control', 'no-store');
            expect(headers.get('cache-control')).equals('must-revalidate');
        });

        it('should delete header if no values left', () => {
            headers.remove('cache-control', 'must-revalidate');
            expect(headers.get('cache-control')).equals(null);
        });

        it('should delete header if value to delete is not set', () => {
            headers.remove('connection');
            expect(headers.get('connection')).equals(null);
        });
    });

    describe('matches()', () => {
        const headers = new Headers({'cache-control': 'public'});

        it('should return false if no header found', () => {
            expect(headers.matches('foo', '/.*?/')).equals(false);
        });

        it('should return true on match', () => {
            expect(headers.matches('cache-control', /^public$/)).equals(true);
        });

        it('should return false if no match', () => {
            expect(headers.matches('cache-control', /^[x]/)).equals(false);
        });
    });

});