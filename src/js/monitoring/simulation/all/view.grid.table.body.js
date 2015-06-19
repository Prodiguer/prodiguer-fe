(function (APP, MOD, _, Backbone) {

    // ECMAScript 5 Strict Mode
    "use strict";

    // View over the grid table body.
    MOD.views.GridTableBodyView = Backbone.View.extend({
        // Backbone: view DOM element type.
        tagName : "tbody",

        // Backbone: view initializer.
        initialize: function () {
            MOD.events.on("state:simulationListFiltered", this._onSimulationListFiltered, this);
            MOD.events.on("state:simulationListNull", this._onSimulationListNull, this);

            MOD.events.on("state:simulationStart", this._onMonitoringEvent, this);
            MOD.events.on("state:simulationComplete", this._onMonitoringEvent, this);
            MOD.events.on("state:simulationError", this._onMonitoringEvent, this);
            MOD.events.on("state:jobStart", this._onMonitoringEvent, this);
            MOD.events.on("state:jobComplete", this._onMonitoringEvent, this);
            MOD.events.on("state:jobError", this._onMonitoringEvent, this);

            MOD.events.on("state:simulationStatusUpdate", this._onSimulationStateUpdate, this);
            MOD.events.on("ui:pagination", this._renderPage, this);
        },

        // Backbone: view renderer.
        render : function () {
            this._renderPage();

            return this;
        },

        // Renders current page.
        _renderPage : function () {
            var paging;

            // Remove previous.
            this.$('tr').remove();

            // Render new.
            paging = MOD.state.paging;
            if (paging.current) {
                _.each(paging.current.data, this._renderRow, this);
            }
        },

        // Renders a row.
        _renderRow : function (simulation) {
            APP.utils.render(MOD.views.GridTableRowView, {
                model : simulation
            }, this);
        },

        // Simulation state update event handler.
        // @eventData      Event data.
        _onSimulationStateUpdate: function (eventData) {
            // Get row.
            var $s = this.$('#simulation-' + eventData.s.uid);

            // Update row css.
            $s.removeClass(MOD.getStateCSS(eventData.statePrevious));
            $s.addClass(MOD.getStateCSS(eventData.s.executionState));

            // Update row fields.
            $s.find(".executionEndDate").text(eventData.s.executionEndDate);
            $s.find(".jobCount").text(eventData.s.jobs.count);
            if (eventData.s.jobs.compute.hasLate) {
                $s.find(".jobCount").addClass('bg-danger');
            } else {
                $s.find(".jobCount").removeClass('bg-danger');
            }
        },

        // Simulation list filtered event handler.
        _onSimulationListFiltered: function () {
            this._renderPage();
        },

        // Simulation list null event handler.
        _onSimulationListNull: function () {
            this.$('tr').remove();
        },

        // Updates a row in response to a simulation related event.
        _updateRow: function (ei) {
            // Get row.
            var $s = this.$('#simulation-' + ei.simulation.uid);

            $s.find(".jobCount").text(ei.simulation.jobs.count);
        },

        // Monitoring event handler.
        // @ei      Event information.
        _onMonitoringEvent: function (ei) {
            this._updateRow(ei);
        }
    });

}(this.APP, this.APP.modules.monitoring, this._, this.Backbone));
