(function (APP, MOD, EVENTS, STATE, _, $) {

    // ECMAScript 5 Strict Mode
    "use strict";

    var getMonitorURL, getInterMonitorURL, getSimulationListForIM;

    // Gets list of simulations for inter-monitoring.
    getSimulationListForIM = function () {
        return _.filter(STATE.simulationList, function (s) {
            return s.ext.isSelectedForIM;
        });
    };

    // Helper function: returns simulation monitor URL.
    getMonitorURL = function (s) {
        var url;

        // Escape if simulation's compute node is not associated with a THREDDS server.
        if (_.has(MOD.urls.M, s.computeNode) === false) {
            return;
        }

        url = [MOD.urls.M[s.computeNode]];
        url.push(s.computeNodeLogin);
        if (s.modelRaw) {
            url.push(s.modelRaw);
        } else if (s.ext.modelSynonyms.length) {
            url.push(s.ext.modelSynonyms[0]);
        } else {
            url.push(s.model);
        }
        url.push(s.spaceRaw || s.space);
        url.push(s.experimentRaw || s.ext.experiment);
        url.push(s.name);
        url.push("MONITORING/index.html");
        url = url.join("/");

        return url;
    };

    // Helper function: returns simulation inter-monitor URL.
    getInterMonitorURL = function (s) {
        var url;

        // Escape if simulation is not associated with an inter-monitoring server.
        if (_.has(MOD.urls.IM, s.computeNode) === false) {
            return;
        }

        url = [MOD.urls.IM[s.computeNode]];
        url.push(s.computeNodeLogin);
        if (s.modelRaw) {
            url.push(s.modelRaw);
        } else if (s.ext.modelSynonyms.length) {
            url.push(s.ext.modelSynonyms[0]);
        } else {
            url.push(s.model);
        }
        url.push(s.spaceRaw || s.space);
        url.push(s.experimentRaw || s.ext.experiment);
        url.push(s.name);
        url = url.join("/");

        return url;
    };

    // Event handler: open monitor link.
    EVENTS.on("m:open", function (simulation) {
        APP.utils.openURL(getMonitorURL(simulation), true);
    });

    // Event handler: clear inter monitoring simulation selection.
    EVENTS.on("im:clear", function () {
        _.each(STATE.simulationListForIM, function (simulation) {
            simulation.ext.isSelectedForIM = false;
        });
        STATE.simulationListForIM = [];
        EVENTS.trigger("im:simulationListCleared");
    });

    // Event handler: open inter-monitoring link.
    EVENTS.on("im:open", function () {
        var urls;

        urls = _.sortBy(_.map(getSimulationListForIM(), getInterMonitorURL));
        if (urls.length) {
            EVENTS.trigger("im:postInterMonitorForm", urls);
        }
    });

    // Event handler: toggle inter-monitoring link.
    EVENTS.on("im:toggleSimulation", function (s) {
        s.ext.isSelectedForIM = !s.ext.isSelectedForIM;
        STATE.simulationListForIM = getSimulationListForIM();
        EVENTS.trigger("im:simulationListUpdated");
    });

}(
    this.APP,
    this.APP.modules.monitoring,
    this.APP.modules.monitoring.events,
    this.APP.modules.monitoring.state,
    this._,
    this.$jq
));
