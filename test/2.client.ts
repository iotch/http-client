import 'mocha';
import 'jsdom-global/register';
import { expect } from 'chai';
import { spy, useFakeXMLHttpRequest, SinonFakeXMLHttpRequest } from 'sinon';
import { Promise } from 'es6-promise';
import Client, { errorCodes } from '../src';
import Headers from '../src/Headers';
import Response, { ResponseInterface } from '../src/Response';

describe('Client', () => {

    let request: SinonFakeXMLHttpRequest;

    // mock XMLHttpRequest
    beforeEach('mock XMLHttpRequest', () => {
        (window as any).XMLHttpRequest = useFakeXMLHttpRequest();

        // store request
        (window as any).XMLHttpRequest.onCreate = function(xhr: SinonFakeXMLHttpRequest) {
            request = xhr;
        };
    });

    // restore XMLHttpRequest (do we need it?)
    afterEach('restore XMLHttpRequest', () => {
        const win = (window as any);
        if('restore' in win.XMLHttpRequest) {
            win.XMLHttpRequest.restore();
        }
        request = <any>null;
    });

    describe('Client', () => {

        it('should be able to make requests', () => {
            const client = new Client();
            const promise = client.request('/');
            request.respond(200, {}, '');
            return promise;
        });

        it('should call lifecycle callbacks', () => {

            const onSend = spy();
            const onProgress = spy(() => {});
            const onLoad = spy();

            const client = new Client({
                onSend: onSend,
                onProgress: onProgress,
                onLoad: onLoad,
            });

            const promise = client.request('/');
            request.respond(200, {}, '');

            expect(onSend.called, 'onSend called').to.be.true;
            expect(onProgress.called, 'onProgress called').to.be.true;
            expect(onLoad.called, 'onLoad called').to.be.true;

            return promise;
        });

    });

    describe('Errors', () => {

        it('should call onError() on client errors', () => {
            const client = new Client({
                onSend: () => {
                    throw 'client error';
                },
                onError: (error) => {
                    expect(error.code).eq(errorCodes.CLIENT_ERROR);
                    expect(error.reason).eq('client error');
                }
            });
            const promise = client.request('/').catch((result) => {
                expect(result).eq(undefined);
            });
            return promise;
        });

        it('should call onError() on response processing errors', () => {
            const client = new Client({
                onError: (error) => {
                    expect(error.code).eq(errorCodes.LOAD_ERROR);
                    expect(error.reason).eq('load error');
                }
            });

            client.interceptResponse(() => {
                throw 'load error';
            });

            const promise = client.request('/').catch((result) => {
                expect(result).eq(undefined);
            });
            request.respond(200, {}, '');
            return promise;
        });

        it('should call onError() on network errors', () => {
            const client = new Client({
                onError: (error) => {
                    expect(error.code).eq(errorCodes.NETWORK_ERROR);
                }
            });
            const promise = client.request('/').catch(() => {});
            request.error();
            return promise;
        });

        it('should call onError() on network timeouts', () => {
            const client = new Client({
                timeout: 40,
                onError: (error) => {
                    expect(error.code).eq(errorCodes.NETWORK_TIMEOUT);
                }
            });
            const promise = client.request('/').catch(() => {});
            setTimeout(() => request.respond(200, {}, ''), 50);
            return promise;
        });

        it('should call onError() on request abort', function() {
            const client = new Client({
                onProgress: (progress, abort) => {
                    setTimeout(abort, 50);
                },
                onError: (error) => {
                    expect(error.code).eq(errorCodes.REQUEST_ABORTED);
                }
            });
            return client.request('https://httpbin.org/range/1024').catch(() => {});
        });

    });

    describe('Options', () => {

        it('should merge local options', () => {
            const client = new Client({method: 'POST'});
            client.request('/', { method: 'GET'});
            expect(request.method).eq('GET');
        });

        it('should set xhr headers', () => {
            const client = new Client();

            client.request('/', {
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': ['no-cache', 'no-store'],
                },
            });

            expect(request.requestHeaders['Accept']).eq('application/json');
            expect(request.requestHeaders['Cache-Control']).satisfies((value: string) => {

                // xhr.setRequestHeader implementations may be different?
                return value === 'no-cache,no-store' || value === 'no-cache, no-store';
            });
        });

        it('should allow options interception', () => {
            const client = new Client();
            client.interceptOptions((options) => {
                options.method = 'PUT';
                return options;
            });
            client.request('/');
            expect(request.method).eq('PUT');
        });

        it('should allow url interception', () => {
            const client = new Client();
            client.interceptUrl((url) => {
                return ('//my.api' + url);
            });
            client.request('/test');
            expect(request.url).eq('//my.api/test');
        });

        it('should include search in url', () => {
            const client = new Client();
            client.request('/test', {
                search: {
                    foo: 'bar'
                },
            });
            expect(request.url).eq('/test?foo=bar');
        });

    });

    describe('Responses', () => {

        it('should provide a valid response object', () => {
            const client = new Client();
            const promise = client.request('/').then((response) => {
                expect(response).be.instanceof(Response);
            });
            request.respond(200, {}, '');
            return promise;
        });

        it('should provide a valid response object on server error', () => {
            const client = new Client();
            const promise = client.request('/').catch((result) => {
                expect(result).be.instanceof(Response);
            });
            request.respond(500, {}, '');
            return promise;
        });

        it('should provide a valid response', () => {
            const client = new Client();
            const promise = client.request('/').then((response) => {
                const expected: ResponseInterface = {
                    status: 200,
                    statusText: 'OK',
                    isSuccessStatus: true,
                    type: 'text',
                    body: 'body text',
                    headers: new Headers({Server: 'sinon'}),
                    error: false,
                    errorText: '',
                }
                expect(response).to.deep.equal(expected);
            });
            request.respond(200, {'Server': 'sinon'}, 'body text');
            return promise;
        });

        it('should handle network errors', () => {
            const client = new Client();
            const promise = client.request('/').catch((result) => {
                expect(result).be.instanceof(Response);
                expect(result.errorText).eq('error');
            });
            request.error();
            return promise;
        });

        it('should allow response interception', () => {
            const client = new Client();
            client.interceptResponse((response) => {
                response.body = 'bar';
                return response;
            });
            const promise = client.request('/').then((response) => {
                expect(response.body).equal('bar');
            });
            request.respond(200, {}, 'foo');
            return promise;
        });

        it('should treat codes between 200 and 304 as successful', () => {
            const client = new Client();
            const codes = [200, 201, 202, 204, 205, 206, 300, 301, 302, 303, 304];
            const promises: Promise<any>[] = [];

            for(let i = 0; i < codes.length; i++) {
                const promise = client.request('/').then((response) => {
                    expect(response.isSuccessStatus).be.true;
                });
                promises.push(promise);
                request.respond(codes[i], {}, '');
            }
            return Promise.all(promises);
        });

        it('should report download progress', function() {
            (window as any).XMLHttpRequest.restore();
            const client = new Client({
                onProgress: (progress) => {
                    expect(progress).within(0, 100);
                }
            });
            return client.request('https://httpbin.org/range/1024');
        });

        it('should report upload progress', function() {
            (window as any).XMLHttpRequest.restore();
            const client = new Client({
                method: 'POST',
                payload: {
                    a: 'b',
                },
                onProgress: (progress) => {
                    expect(progress).within(0, 100);
                }
            });
            return client.request('https://httpbin.org/post').catch(() => {});
        });

        it('should not report download progress on remote errors', function() {
            const client = new Client({
                onProgress: (progress) => {
                    expect(progress).eq(0);
                }
            });
            const promise = client.request('/').catch(() => {});
            request.respond(400, {}, '');
            return promise;
        });

        it('should not report upload progress on remote errors', function() {
            const client = new Client({
                method: 'POST',
                payload: {
                    a: 'b',
                },
                onProgress: (progress) => {
                    expect(progress).eq(0);
                }
            });
            const promise = client.request('/').catch(() => {});
            request.respond(400, {}, '');
            return promise;
        });

    });

});