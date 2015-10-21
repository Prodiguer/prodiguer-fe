(function (APP, _, $, moment, numeral) {

    // ECMAScript 5 Strict Mode
    "use strict";

    // Declare module.
    var
        MOD = APP.registerModule("messages", {
            // Module title.
            title: "Simulation Messages",

            // Module short title.
            shortTitle: "Messages",

            // Set of message types related to compute jobs.
            computeMessageTypes: [
                "0000", "0100", "1000", "1100", "1900", "1999"
            ],

            // Set of message types related to post processing jobs.
            postProcessingMessageTypes: [
                "2000", "2100", "2900", "2999", "3000", "3100", "3900", "3999"
            ],

            // Returns flag indicating whether the messages is a compute message or not.
            isComputeMessage: function (msg) {
                return _.indexOf(MOD.computeMessageTypes, msg.typeID) !== -1;
            },

            // Returns flag indicating whether the messages is a post-processing message or not.
            isPostProcessingMessage: function (msg) {
                return _.indexOf(MOD.postProcessingMessageTypes, msg.typeID) !== -1;
            },

            // Set of urls used across module.
            urls: {
                // Fetch simulation messages endpoint.
                FETCH: 'simulation/monitoring/fetch_messages?uid={uid}',

                // Simulation detail page.
                SIMULATION_DETAIL_PAGE: 'simulation.detail.html?uid={uid}&hashid={hashid}&tryID={tryID}',
            },
        }),

        // Returns job post-processing information.
        getPostProcessingInfo = function (job) {
            var ppFields = [];

            if (job.postProcessingName && job.postProcessingName !== 'null') {
                ppFields.push(job.postProcessingName);
            }
            if (job.postProcessingDate && job.postProcessingDate !== 'null') {
                // ppFields.push(job.postProcessingDate);
                ppFields.push(moment(job.postProcessingDate, "YYYYMMDD").format("YYYY-MM-DD"));
            }
            if (job.postProcessingDimension && job.postProcessingDimension !== 'null') {
                ppFields.push(job.postProcessingDimension);
            }
            if (job.postProcessingComponent && job.postProcessingComponent !== 'null') {
                ppFields.push(job.postProcessingComponent);
            }
            if (job.postProcessingFile && job.postProcessingFile !== 'null') {
                ppFields.push(job.postProcessingFile);
            }
            return ppFields.join(".");
        },

        // Parses a message recieved from web-service.
        parseMessage = function (msg) {
            msg.latency = numeral(moment(msg.processed).diff(msg.timestamp, 's')).format("00:00:00");
            if (msg.latency.length === 7) {
                msg.latency = "0" + msg.latency;
            }
            if (msg.typeID === "2000" || msg.typeID === "3000") {
                msg.jobInfo = getPostProcessingInfo($.parseJSON(msg.content));
            } else {
                msg.jobInfo = "--";
            }
        },

        // Returns a mapped message.
        mapMessage = function (i) {
            return {
                content: i[0],
                emailID: i[1],
                jobUID: i[2],
                processed: i[3],
                producerVersion: i[4],
                timestamp: i[5],
                typeID: i[6],
                uid: i[7],
            };
        },

        // Page setup data download event handler.
        onPageSetUpDataDownloaded = function (data) {
            // Map tuples to JSON objects.
            data.messageHistory = _.map(data.messageHistory, mapMessage);

            // Parse data.
            _.each(data.messageHistory, parseMessage);

            // Update module state.
            MOD.state.simulation = data.simulation;
            MOD.state.messageHistory = {
                all: data.messageHistory,
                compute: _.filter(data.messageHistory, function (m) {
                    return MOD.isComputeMessage(m) === true;
                }),
                postProcessing: _.filter(data.messageHistory, function (m) {
                    return MOD.isPostProcessingMessage(m) === true;
                })
            };

            // // Render main view.
            MOD.view = new MOD.views.MainView();
            MOD.view.render();

            // // Update DOM.
            $(".app-content").append(MOD.view.$el);

            // Fire events.
            APP.events.trigger("module:initialized", MOD);
        };

    // Module view state.
    MOD.state = {
        // Application pointer.
        APP: APP,

        // Module pointer.
        MOD: MOD,

        // Copyright year.
        year: new Date().getFullYear(),

        // Simulation.
        simulation: null,

        // Simulation hash identifier.
        simulationUID: APP.utils.getURLParam('simulationUID'),

        // Simulation message history.
        messageHistory: {
            all: [],
            compute: [],
            postProcessing: []
        }
    };

    // Module initialisation event handler.
    MOD.events.on("module:initialization", function () {
        var ep;

        // Fetch page setup data.
        ep = APP.utils.getEndPoint(MOD.urls.FETCH);
        ep  = ep.replace('{uid}', MOD.state.simulationUID);
        $.getJSON(ep, onPageSetUpDataDownloaded);
    });

}(
    this.APP,
    this._,
    this.$,
    this.moment,
    this.numeral
));



