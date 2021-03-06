/* global define */
define(["structures/CAPIError", "storages/LocalStorage"], function (CAPIError, LocalStorage) {
    "use strict";

    /**
     * Creates an instance of SessionAuthAgent object
     *
     * Auth agent handles low level implementation of authorization workflow.
     * By providing a `login` and a `password` in the `authInfo` object, the
     * auth agent will try to create a session:
     *
     *     var SessionAuthAgent({login: "admin", password: "publish"});
     *
     * The session auth agent is also able to reuse an existing session, to do
     * that it needs to receive an object with the session info:
     *
     *     var new SessionAuthAgent({
     *            name: "eZSESSID",
     *            identifier: "sessionidentifier",
     *            href: "/api/ezp/v2/users/session/sessionidentifier",
     *            csrfToken: "longCsrfToken",
     *        });
     *
     * @class SessionAuthAgent
     * @constructor
     * @param authInfo {Object} object literal containg the credentials (`login`
     * and `password`) or the session info of an already existing one (`name`,
     * `identifier`, `href` and `csrfToken`)
     * @param authInfo.login {String} user login
     * @param authInfo.password {String} user password
     * @param authInfo.name {String} name of the session
     * @param authInfo.identifier {String} identifier of the session
     * @param authInfo.href {String} refresh resource URI for the session
     * @param authInfo.csrfToken {String} CSRF Token
     * @param storage {StorageAbstraction?} storage to be used. By default a LocalStorage will be utilized
     */
    var SessionAuthAgent = function (authInfo, storage) {
            /**
             * The CAPI instance. It is set by the call to setCAPI() done while
             * instantiating the CAPI.
             *
             * @property _CAPI
             * @type CAPI
             * @protected
             */
            this._CAPI = null;

            /**
             * The login
             *
             * @property _login
             * @type {String}
             * @default ""
             * @protected
             */
            this._login = '';

            /**
             * The password
             *
             * @property _password
             * @type {String}
             * @default ""
             * @protected
             */
            this._password = '';

            /**
             * The storage to use to store the session info.
             *
             * @property _storage
             * @type {StorageAbstraction}
             * @default LocalStorage
             * @protected
             */
            this._storage = storage || new LocalStorage();

            if ( authInfo ) {
                if ( authInfo.login && authInfo.password ) {
                    this.setCredentials(authInfo);
                } else if ( authInfo.csrfToken && authInfo.identifier && authInfo.name && authInfo.href ) {
                    this._storeSessionInfo(authInfo);
                } else {
                    throw new CAPIError("Invalid authInfo parameter");
                }
            }
        },
        SAFE_METHODS = {'GET': 1, 'HEAD': 1, 'OPTIONS': 1, 'TRACE': 1};

    /**
     * Constant to be used as storage key for the sessionName
     *
     * @static
     * @const
     * @type {string}
     */
    SessionAuthAgent.KEY_SESSION_NAME = 'ezpRestClient.sessionName';

    /**
     * Constant to be used as storage key for the sessionId
     *
     * @static
     * @const
     * @type {string}
     */
    SessionAuthAgent.KEY_SESSION_ID = 'ezpRestClient.sessionId';

    /**
     * Constant to be used as storage key for the sessionHref
     *
     * @static
     * @const
     * @type {string}
     */
    SessionAuthAgent.KEY_SESSION_HREF = 'ezpRestClient.sessionHref';

    /**
     * Constant to be used as storage key for the csrfToken
     *
     * @static
     * @const
     * @type {string}
     */
    SessionAuthAgent.KEY_CSRF_TOKEN = 'ezpRestClient.csrfToken';

    /**
     * Checks that the current user is still logged in. To be considered as
     * logged in, the storage should have a session id and the refresh calls
     * should be successful.
     * If the storage does not contain any session info, the callback is called
     * with `true` as its first argument, otherwise, the callback is called
     * with the `error` and `result` from {{#crossLink
     * "UserService/refreshSession:method"}}UserService.refreshSession{{/crossLink}}.
     *
     * @param {Function} callback
     * @method isLoggedIn
     */
    SessionAuthAgent.prototype.isLoggedIn = function (callback) {
        var that = this,
            userService = this._CAPI.getUserService(),
            sessionId = this._storage.getItem(SessionAuthAgent.KEY_SESSION_ID);

        if ( sessionId === null) {
            callback(true, false);
            return;
        }
        userService.refreshSession(sessionId, function (error, result) {
            if ( error ) {
                that._resetStorage();
            }
            callback(error, result);
        });
    };

    /**
     * Called every time a new request cycle is started,
     * to ensure those requests are correctly authenticated.
     *
     * A cycle may contain one or more queued up requests
     *
     * @method ensureAuthentication
     * @param done {Function} Callback function, which is to be called by the implementation to signal the authentication has been completed.
     */
    SessionAuthAgent.prototype.ensureAuthentication = function (done) {
        if (this._storage.getItem(SessionAuthAgent.KEY_SESSION_ID) !== null) {
            done(false, true);
            return;
        }

        var that = this,
            userService = this._CAPI.getUserService(),
            sessionCreateStruct = userService.newSessionCreateStruct(
                this._login,
                this._password
            );

        userService.createSession(
            sessionCreateStruct,
            function (error, sessionResponse) {
                var session;

                if (error) {
                    done(error, sessionResponse);
                    return;
                }

                session = sessionResponse.document.Session;
                that._storeSessionInfo({
                    name: session.name,
                    href: session._href,
                    identifier: session.identifier,
                    csrfToken: session.csrfToken,
                });

                done(false, sessionResponse);
            }
        );
    };

    /**
     * Tries to log in in the REST API. If the storage already contains a
     * session id, first it tries to log out before doing the log in.
     *
     * @method logIn
     * @param {Function} callback
     */
    SessionAuthAgent.prototype.logIn = function (callback) {
        var that = this;

        if ( this._storage.getItem(SessionAuthAgent.KEY_SESSION_ID) !== null ) {
            this.logOut(function (error, result) {
                that.ensureAuthentication(callback);
            });
        } else {
            this.ensureAuthentication(callback);
        }
    };

    /**
     * Hook to allow the modification of any request, for authentication purposes, before
     * sending it out to the backend
     *
     * @method authenticateRequest
     * @param request {Request}
     * @param done {Function}
     */
    SessionAuthAgent.prototype.authenticateRequest = function (request, done) {
        var token = this._storage.getItem(SessionAuthAgent.KEY_CSRF_TOKEN);

        if ( SAFE_METHODS[request.method.toUpperCase()] !== 1 && token !== null ) {
            request.headers["X-CSRF-Token"] = token;
        }

        done(false, request);
    };

    /**
     * Log out. If the client did not logged in yet, the callback is called with
     * `false` and `true` as arguments, otherwise the callback is called with the
     * `error` and the `result` from {{#crossLink
     * "UserService/deleteSession:method"}}userService.deleteSession{{/crossLink}}.
     *
     * @method logOut
     * @param done {Function}
     */
    SessionAuthAgent.prototype.logOut = function (done) {
        var userService = this._CAPI.getUserService(),
            sessionHref = this._storage.getItem(SessionAuthAgent.KEY_SESSION_HREF),
            that = this;

        if ( sessionHref === null ) {
            done(false, true);
            return;
        }

        userService.deleteSession(
            sessionHref,
            function (error, response) {
                if ( !error ) {
                    that._resetStorage();
                }
                done(error, response);
            }
        );
    };

    /**
     * Set the instance of the CAPI to be used by the agent
     *
     * @method setCAPI
     * @param CAPI {CAPI} current instance of the CAPI object
     */
    SessionAuthAgent.prototype.setCAPI = function (CAPI) {
        this._CAPI = CAPI;
    };

    /**
     * Set the credentials
     *
     * @method setCredentials
     * @param {Object} credentials
     * @param {String} credentials.login
     * @param {String} credentials.password
     */
    SessionAuthAgent.prototype.setCredentials = function (credentials) {
        this._login = credentials.login;
        this._password = credentials.password;
    };

    /**
     * Resets the storage associated with this auth agent
     *
     * @method _resetStorage
     * @protected
     */
    SessionAuthAgent.prototype._resetStorage = function () {
        this._storage.removeItem(SessionAuthAgent.KEY_SESSION_NAME);
        this._storage.removeItem(SessionAuthAgent.KEY_SESSION_ID);
        this._storage.removeItem(SessionAuthAgent.KEY_SESSION_HREF);
        this._storage.removeItem(SessionAuthAgent.KEY_CSRF_TOKEN);
    };

    /**
     * Stores the session information in the storage
     *
     * @method _storeSessionInfo
     * @param {Object} session an object describing the session
     * @param session.name {String} the name of the session
     * @param session.identifier {String} the identifier of the session
     * @param session.href {String} the resource uri to refresh the session
     * @param session.csrfToken {String} the CSRF Token associated with the
     * session
     * @protected
     */
    SessionAuthAgent.prototype._storeSessionInfo = function (session) {
        this._storage.setItem(SessionAuthAgent.KEY_SESSION_NAME, session.name);
        this._storage.setItem(SessionAuthAgent.KEY_SESSION_HREF, session.href);
        this._storage.setItem(SessionAuthAgent.KEY_SESSION_ID, session.identifier);
        this._storage.setItem(SessionAuthAgent.KEY_CSRF_TOKEN, session.csrfToken);
    };

    return SessionAuthAgent;
});
