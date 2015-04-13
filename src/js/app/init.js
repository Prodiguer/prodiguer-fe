(function (APP, document, $, _) {

    // ECMAScript 5 Strict Mode
    "use strict";

    var initApp = function () {
        var mainView;

        // Compile templates.
        APP.utils.compileTemplates(APP.templates);
        _.each(APP.state.moduleList, function (mod) {
            APP.utils.compileTemplates(mod.templates);
        });

        // Render main view.
        mainView = new APP.views.MainView();
        mainView.render();

        // Initialise DOM.
        $("body").append(mainView.$el);

        // Activate default module.
        APP.events.trigger("module:activating", APP.getModule(APP.constants.defaultModule));
    };

    // Document ready event handler.
    $(document).ready(initApp);
}(
    this.APP,
    this.document,
    this.$,
    this._
));