(function (APP, MOD, STATE, EVENTS, _) {

    // ECMAScript 5 Strict Mode
    "use strict";

    // Returns sorted collection of simulations.
    MOD.sortSimulationList = function (simulations) {
        var sortField = STATE.sorting.field.key,
            sortDirection = STATE.sorting.direction.key;

        if (_.isUndefined(sortField)) {
            return simulations;
        }

        if (_.contains(['name', 'accountingProject', 'computeNodeLogin'], sortField)) {
            simulations = _.sortBy(simulations, sortField);
        }

        if (_.contains(['computeNodeMachine', 'model', 'space', 'experiment'], sortField)) {
            simulations = _.sortBy(simulations, function (s) {
                return s.ext[sortField].toLowerCase();
            });
        }

        if (sortField === 'outputDateRange') {
            simulations = _.sortBy(simulations, function (s) {
                return s.ext.outputDateRange || '--';
            });
        }

        if (sortField === 'executionStartDate') {
            simulations = _.sortBy(simulations, function (s) {
                return s.executionStartDate || '--';
            });
        }

        if (sortField === 'outputStartDate') {
            if (sortDirection === 'desc') {
                simulations = simulations.reverse();
            }
        } else if (sortDirection === 'desc') {
            simulations = simulations.reverse();
        }

        return simulations;
    };

    // Returns collection of filtered simulations.
    // @exclusionFilter     Filter to be excluded when determining result.
    MOD.getFilteredSimulationList = function (exclusionFilter, applySort) {
        var re, result, filters;

        // Exclude simulations without a valid start date.
        result = _.reject(STATE.simulationList, function (s) {
            return _.isNull(s.executionStartDate);
        });

        // Apply select filters.
        filters = STATE.filters;
        if (exclusionFilter) {
            filters = _.without(filters, exclusionFilter);
        }
        _.each(filters, function (f) {
            if (f.key !== 'timeslice' &&
                f.cvTerms.current &&
                f.cvTerms.current.name !== "*") {
                result = _.filter(result, function (s) {
                    return s[f.key] === f.cvTerms.current.name;
                });
            }
        });

        // Apply text filter.
        if (STATE.textFilter) {
            re = STATE.textFilter.replace("*", ".*");
            result = _.filter(result, function (s) {
                return s.ext.name.match(re) !== null;
            });
        }

        // Apply monitoring filter.
        if (STATE.monitoredSimulationsOnly === true) {
            result = _.filter(result, function (s) {
                // console.log(s.uid + ' :: ' + s.isIM);
                return s.isIM === true;
            });
        }

        // Sort (when not applying exclusions).
        if (applySort === true) {
            result = MOD.sortSimulationList(result);
        }

        return result;
    };

    // Updates collection of filtered simulations.
    MOD.updateFilteredSimulationList = function () {
        STATE.simulationListFiltered = MOD.getFilteredSimulationList(undefined, true);
    };

    // Updates filtered simulations sort order.
    MOD.updateSortedSimulationList = function () {
        // Apply new sort field.
        STATE.simulationListFiltered = MOD.sortSimulationList(STATE.simulationListFiltered);

        // Update pagination.
        MOD.updatePagination();

        // Notify.
        EVENTS.trigger('simulationListSorted');
    };

    // Sets the paging state.
    MOD.updatePagination = function (currentPage) {
        var pages, page, paging = STATE.paging;

        // Reset pages.
        pages = APP.utils.getPages(STATE.simulationListFiltered, STATE.pageSize);
        paging.count = pages.length;
        paging.current = pages ? pages[0] : null;
        paging.pages = pages;

        // Ensure current page is respected when pages collection changes.
        if (currentPage) {
            page = _.find(pages, function (p) {
                return _.indexOf(p.data, currentPage.data[0]) !== -1;
            });
            if (page) {
                paging.current = page;
            }
        }
    };

}(
    this.APP,
    this.APP.modules.monitoring,
    this.APP.modules.monitoring.state,
    this.APP.modules.monitoring.events,
    this._
));
