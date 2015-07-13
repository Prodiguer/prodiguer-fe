(function (APP, MOD, _, moment, numeral) {

    // ECMAScript 5 Strict Mode
    "use strict";

    // Extends a job in readiness for processing.
    MOD.extendJob = function (job) {
        // Escape if already extended.
        if (_.has(job, 'ext')) {
            return;
        }

        // Initialise extension fields.
        _.extend(job, {
            accountingProject: undefined,
            executionState: undefined,
            ext: {
                id: undefined,
                duration: '--',
                executionEndDate: '--',
                expectedExecutionEndDate: '--',
                executionStartDate: '--',
                executionState: undefined,
                type: job.typeof || 'computing'
            },
            isLate: undefined
        });

        // Format date fields.
        APP.utils.formatDateTimeField(job, "executionStartDate");
        APP.utils.formatDateTimeField(job, "expectedExecutionEndDate");
        APP.utils.formatDateTimeField(job, "executionEndDate");

        // Set duration (in seconds).
        if (job.executionStartDate && job.executionEndDate) {
            job.ext.duration = job.executionEndDate.diff(job.executionStartDate, 'seconds');
            job.ext.duration = numeral(job.ext.duration).format('00:00:00');
        }

        // Set execution state.
        if (job.isError) {
            job.executionState = 'error';
        } else if (job.executionEndDate) {
            job.executionState = 'complete';
        } else {
            job.executionState = 'running';
        }

        // Set is late flag.
        if (job.executionEndDate) {
            job.isLate = job.wasLate;
        } else {
            job.isLate = moment().valueOf() > job.expectedExecutionEndDate.valueOf();
        }

        // Set accounting project.
        if (job.accountingProject === 'None' || _.isNull(job.accountingProject)) {
            job.ext.accountingProject = "--";
        } else {
            job.ext.accountingProject = job.accountingProject;
        }
    };

    // Extends a simulation in readiness for processing.
    MOD.extendSimulation = function (simulation) {
        var model;

        // Initialise extension fields.
        _.extend(simulation, {
            executionState: undefined,
            ext: {
                accountingProject: undefined,
                activity: undefined,
                caption: undefined,
                computeNode: undefined,
                computeNodeLogin: undefined,
                computeNodeMachine: undefined,
                executionEndDate: "--",
                executionState: undefined,
                executionStartDate: "--",
                experiment: undefined,
                hasRunningJob: false,
                isSelectedForIM: false,
                imURL: undefined,
                isRestart: simulation.tryID > 1,
                model: undefined,
                modelSynonyms: [],
                mURL: undefined,
                outputEndDate: "--",
                outputStartDate: "--",
                space: undefined
            },
            jobs: {
                compute: {
                    all: [],
                    complete: [],
                    error: [],
                    hasLate: false,
                    running: [],
                },
                count: "--",
                global: {
                    all: [],
                    complete: [],
                    error: [],
                    running: []
                },
                postProcessing: {
                    all: [],
                    complete: [],
                    error: [],
                    running: []
                },
                postProcessingFromChecker: {
                    all: [],
                    complete: [],
                    error: [],
                    running: []
                }
            }
        });

        // Format date fields.
        APP.utils.formatDateTimeField(simulation, "executionStartDate");
        APP.utils.formatDateTimeField(simulation, "executionEndDate");
        APP.utils.formatDateField(simulation, "outputStartDate");
        APP.utils.formatDateField(simulation, "outputEndDate");

        // Update case sensitive CV fields.
        MOD.cv.setFieldDisplayName(simulation, 'activity');
        MOD.cv.setFieldDisplayName(simulation, 'compute_node', 'computeNode');
        MOD.cv.setFieldDisplayName(simulation, 'compute_node_login', 'computeNodeLogin');
        MOD.cv.setFieldDisplayName(simulation, 'compute_node_machine', 'computeNodeMachine');
        MOD.cv.setFieldDisplayName(simulation, 'experiment');
        MOD.cv.setFieldDisplayName(simulation, 'model');
        MOD.cv.setFieldDisplayName(simulation, 'simulation_space', 'space');

        // Set accounting project.
        if (simulation.accountingProject === 'None' || _.isNull(simulation.accountingProject)) {
            simulation.ext.accountingProject = "--";
        } else {
            simulation.ext.accountingProject = simulation.accountingProject;
        }

        // Set model synonyms.
        // TODO - derive at click time ?
        model = MOD.cv.getTerm('model', simulation.model);
        if (model && model.synonyms) {
            simulation.ext.modelSynonyms = model.synonyms.split(", ");
        }

        // Set monitoring / inter-monitoring URLs.
        // TODO - derive at click time ?
        if (_.has(MOD.urls.M, simulation.computeNode)) {
            simulation.ext.mURL = MOD.urls.M[simulation.computeNode];
        }
        if (_.has(MOD.urls.IM, simulation.computeNode)) {
            simulation.ext.imURL = MOD.urls.IM[simulation.computeNode];
        }
    };

}(
    this.APP,
    this.APP.modules.monitoring,
    this._,
    this.moment,
    this.numeral
));