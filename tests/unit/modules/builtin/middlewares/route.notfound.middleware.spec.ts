import {
    IRouteTable,
    RouteNotFoundMiddleware,
    IExpressRequest,
    DataUtility,
    RouteNotFoundException
} from '../../../index';
import { Mock } from 'moq.ts';

describe('modules.builtin.route.notfound.middleware.spec', () => {
    let routes = [
        '/get_/api/route/',
        '/get_/api/parse/(:route)',
        '/get_/api/apple/:id',
        '/get_/api/route/:id/one/:name',
        '/get_/api/:id/home/one/:name',
        '/post_///',
        '/post_/:id',
        '/post_/v3/:id/one/:name',
        '/:verb_/api/v1/:id',
        '/:verb_/v1/(:parse)/v2/(:route)'
    ];
    let table = new Mock<IRouteTable>()
        .setup(x => x.getRoutes()).returns(routes);

    it('invoke.route_found_for_get_/api/route/_when_verb_is_get', () => {
        let invoked = false;
        let e;
        new RouteNotFoundMiddleware(table.object())
            .invoke({
                method: 'geT',
                baseUrl: '/api/route',
                path: '/'
            }, null, err => {
                invoked = true;
                e = err;
            });
        // Following expect statements are common and makes sure next handler is invoked properly,
        // Highly recommended not to remove this statements
        expect(invoked).toBeTruthy();
        expect(e).toBeUndefined();
    });
    it('invoke.route_not_found_for_post_/api/route/_when_verb_is_get', () => {
        let req = {
            method: 'post',
            baseUrl: '/api/route',
            path: '/'
        };
        let err: RouteNotFoundException;
        new RouteNotFoundMiddleware(table.object())
            .invoke(req, null, e => err = e);
        expect(err).toBeDefined();
        expect(err instanceof RouteNotFoundException).toBeTruthy();
        // Same expect statements needs to be executed for every invalid route exception.
        // when any code related to exception is changed, following lines fails the test case.
        // Highly advised not to remove these set of lines or this test case
        expect(err.type).toBe(RouteNotFoundException.name);
        expect(err.httpVerb).toBe(req.method);
        expect(err.requestUrl).toBe(`${req.baseUrl}${req.path}`);
    });
    it('invoke.route_found_for_/api/parse/(:route)_when_optional_segment_provided', () => {
        new RouteNotFoundMiddleware(table.object())
            .invoke({
                method: 'get',
                baseUrl: '/api/parse',
                path: '/45'
            }, null, err => expect(err).toBeUndefined());
    });
    it('invoke.route_found_for_/api/parse/(:route)_when_optional_segment_not_provided', () => {
        new RouteNotFoundMiddleware(table.object())
            .invoke({
                method: 'get',
                baseUrl: '/api/parse',
                path: '/'
            }, null, err => expect(err).toBeUndefined());
    });
    it('invoke.route_found_for_/api/apple/:id_when_required_segment_:id_provided', () => {
        new RouteNotFoundMiddleware(table.object())
            .invoke({
                method: 'get',
                baseUrl: '/api/apple',
                path: '/45'
            }, null, err => expect(err).toBeUndefined());
    });
    it('invoke.route_not_found_for_get_/api/apple/:id_when_required_segment_:id_not_provided', () => {
        new RouteNotFoundMiddleware(table.object())
            .invoke({
                method: 'gEt',
                baseUrl: '/api/apple',
                path: '/'
            }, null, err => {
                expect(err).toBeDefined();
                expect(err instanceof RouteNotFoundException).toBeTruthy();
            });
    });
    it('invoke.route_found_for_post_/v3/:id/one/:name_when_/v3/ctrl/one/xyz', () => {
        new RouteNotFoundMiddleware(table.object())
            .invoke({
                method: 'POST',
                baseUrl: '/v3/ctrl/one',
                path: '/xyz'
            }, null, err => expect(err).toBeUndefined());
    });
    it('invoke.route_found_for_post_/v3/:id/one/:name', () => {
        new RouteNotFoundMiddleware(table.object())
            .invoke({
                method: 'POST',
                baseUrl: '/v3/ctrl/one',
                path: '/get'
            }, null, err => expect(err).toBeUndefined());
    });
    it('invoke.route_found_for_post_/', () => {
        new RouteNotFoundMiddleware(table.object())
            .invoke({
                method: 'POST',
                baseUrl: '//',
                path: '/'
            }, null, err => expect(err).toBeUndefined());
    });
    it('invoke.route_not_found_for_get_/', () => {
        new RouteNotFoundMiddleware(table.object())
            .invoke({
                method: 'get',
                baseUrl: '//',
                path: '/'
            }, null, err => {
                expect(err).toBeDefined();
                expect(err instanceof RouteNotFoundException).toBeTruthy();
            });
    });
    it('invoke.route_not_found_for_some_fake_route', () => {
        new RouteNotFoundMiddleware(table.object())
            .invoke({
                method: 'get',
                baseUrl: '/fake/v1',
                path: '/index'
            }, null, err => {
                expect(err).toBeDefined();
                expect(err instanceof RouteNotFoundException).toBeTruthy();
            });
    });
    it('invoke.route_found_for_get_/:verb_/api/v1/:id', () => {
        new RouteNotFoundMiddleware(table.object())
            .invoke({
                method: 'get',
                baseUrl: '/api/v1',
                path: '/abcd'
            }, null, err => expect(err).toBeUndefined());
    });
    it('invoke.route_found_for_post_/:verb_/api/v1/:id', () => {
        new RouteNotFoundMiddleware(table.object())
            .invoke({
                method: 'post',
                baseUrl: '/api/v1',
                path: '/abcd'
            }, null, err => expect(err).toBeUndefined());
    });
});
