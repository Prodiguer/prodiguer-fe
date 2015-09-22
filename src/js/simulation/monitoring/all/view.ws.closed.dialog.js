(function (APP, MOD, TEMPLATES, _, Backbone) {

    // ECMAScript 5 Strict Mode
    "use strict";

    // Modal view displayed upon web-socket channel close event.
    MOD.views.WebSocketClosedDialogView = Backbone.View.extend({
        // Backbone: view CSS class.
        className : 'modal fade',

        // Backbone: view DOM attributes.
        attributes: {
            id: 'wsCloseDialog',
            role: 'dialog',
            'aria-labelledby': 'wsCloseDialogLabel',
            'aria-hidden': true,
            tabindex: -1
        },

        // Backbone: view event handlers.
        events : {
            'click #wsCloseRefreshPageButton' : '_onPageRefresh'
        },

        // Backbone: view initializer.
        initialize: function () {
            MOD.events.on("ws:socketClosed", this._onWebSocketClosed, this);
        },

        // Backbone: view renderer.
        render : function () {
            APP.utils.renderHTML(TEMPLATES.wsClose, {
                app: APP,
                mod: MOD
            }, this);

            return this;
        },

        // On web socket closed event handler.
        _onWebSocketClosed: function () {
            this.$el.modal('show');
        },

        // On page refresh button click event handler.
        _onPageRefresh: function () {
            var baseURL, url;

            // Construct URL.
            url = baseURL = APP.utils.getBaseURL();
            _.each(MOD.state.filters, function (filter) {
                if (filter.cvTerms.current &&
                    filter.cvTerms.current.name !== '*') {
                    url += url === baseURL ? '?' : '&';
                    url += filter.key;
                    url += '=';
                    url += filter.cvTerms.current.name;
                }
            });

            // Redirect.
            APP.utils.openURL(url);
        }
    });
}(
    this.APP,
    this.APP.modules.monitoring,
    this.APP.modules.monitoring.templates,
    this._,
    this.Backbone
));
