(function (APP, MOD, _) {

    // ECMAScript 5 Strict Mode
    "use strict";

    // Closure vars.
    var
        // Returns colleciton of managed job sets.
        getJobSets = function (simulation) {
            return [
                simulation.jobs.compute,
                simulation.jobs.postProcessing,
                simulation.jobs.postProcessingFromChecker
            ];
        },

        // Sets simulation's submission path information.
        setSubmissionPath = function (simulation) {
            if (simulation.jobs.compute.first) {
                simulation.ext.submissionPath = simulation.jobs.compute.first.submissionPath;
            }
        },

        // Sets simulation's current execution status.
        setExecutionState = function (simulation) {
            simulation.executionState = MOD.getSimulationComputeState(simulation);
            MOD.cv.setFieldDisplayName(simulation, 'simulation_state', 'executionState');
        },

        // Sets simulation's execution end date.
        setExecutionEndDate = function (simulation) {
            var executionEndDate;

            executionEndDate = MOD.getSimulationComputeEndDate(simulation);
            if (executionEndDate) {
                simulation.ext.executionEndDate = executionEndDate.slice(0, 19);
            }
        },

        // Parses a simulation job.
        parseJob = function (simulation, job) {
            simulation.jobs.all.push(job);
            switch (job.typeof) {
            case 'computing':
                simulation.jobs.compute.all.push(job);
                simulation.jobs.compute[job.executionState].push(job);
                if (!simulation.jobs.compute.first) {
                    simulation.jobs.compute.first = job;
                }
                break;
            case 'post-processing':
                simulation.jobs.postProcessing.all.push(job);
                simulation.jobs.postProcessing[job.executionState].push(job);
                if (job.postProcessingName === 'monitoring' &&
                    job.executionEndDate &&
                    job.isError === false &&
                    _.has(MOD.urls.M, simulation.computeNode)) {
                    simulation.hasMonitoring = true;
                }
                break;
            case 'post-processing-from-checker':
                simulation.jobs.postProcessingFromChecker.all.push(job);
                simulation.jobs.postProcessingFromChecker[job.executionState].push(job);
                break;
            default:
                break;
            }
        };

    // Parses a simulation in readiness for processing.
    MOD.parseSimulation = function (simulation, jobList) {
        // Extend simulation.
        MOD.extendSimulation(simulation);

        // Extend jobs.
        _.each(jobList, MOD.extendJob);

        // Parse jobs.
        _.each(jobList, function (job) {
            parseJob(simulation, job);
        });

        // Sort jobs.
        _.each(getJobSets(simulation), MOD.sortJobset);

        // Set job pagination state.
        _.each(getJobSets(simulation), function (jobSet) {
            MOD.setJobsetPagination(jobSet, true);
        });

        // Set derived execution states.
        setExecutionState(simulation);

        // Set derived execution end date.
        setExecutionEndDate(simulation);

        setSubmissionPath(simulation);
    };

}(
    this.APP,
    this.APP.modules.monitoring,
    this._
));
