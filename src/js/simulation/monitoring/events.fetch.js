(function (APP, MOD, _) {

    // ECMAScript 5 Strict Mode
    "use strict";

    // Controlled vocabularies loaded event handler.
    // @data    Data loaded from remote server.
    MOD.events.on("setup:cvDataLoaded", function (data) {
        // Update module state.
        MOD.state.cvTerms = APP.utils.parseCVTerms(data.cvTerms);

        // Initialise filter cv terms sets.
        MOD.initFilterCvTermsets();

        // Fetch timeslice.
        MOD.fetchTimeSlice();
    });

    // Timeslice loaded event handler.
    // @data    Data loaded from remote server.
    MOD.events.on("state:timesliceLoaded", function (data) {
        // Map simulations.
        MOD.log("timeslice simulations = " + data.simulationList.length);
        data.simulationList = _.map(data.simulationList, MOD.mapSimulation);
        MOD.log("timeslice simulations unpacked");

        // Map jobs.
        MOD.log("timeslice jobs = " + data.jobList.length);
        data.jobList = _.map(data.jobList, MOD.mapJob);
        MOD.log("timeslice jobs unpacked");

        // Update module state.
        MOD.state.simulationList = data.simulationList;
        MOD.state.simulationSet = _.indexBy(data.simulationList, "id");
        MOD.log("timeslice assigned");

        // Parse timeslice.
        MOD.parseTimeslice(data.simulationList, data.jobList);
        MOD.log("timeslice parsed");

        // Update filtered simulations.
        MOD.updateFilteredSimulationList();

        // Update active filter terms.
        MOD.updateActiveFilterTerms();

        // Update pagination.
        MOD.updatePagination();

        // Fire event.
        if (MOD.view) {
            MOD.events.trigger("state:simulationListUpdate", this);
        } else {
            MOD.events.trigger("setup:complete", this);
        }
    });

}(
    this.APP,
    this.APP.modules.monitoring,
    this._
));
