(function (APP, MOD, TEMPLATES, _, Backbone) {

    // ECMAScript 5 Strict Mode
    "use strict";

    // View over a grid table row.
    MOD.views.GridTableRowView = Backbone.View.extend({
        // Backbone: view DOM element type.
        tagName : "tr",

        // Backbone: view event handlers.
        events : {
            'click > td.row-link' : function () {
                var url;
                
                url = APP.utils.getPageURL(MOD.urls.SIMULATION_PAGE);
                url = url.replace("{uid}", this.simulation.uid);
                url = url.replace("{hashid}", this.simulation.hashid);
                url = url.replace("{tryID}", this.simulation.tryID);
                APP.utils.openURL(url, true);
            },
            'click > td.monitoring' : function () {
                MOD.events.trigger("im:openMonitor", this.simulation);
            },
            'change > td.interMonitoring > input' : function () {
                this.simulation.ext.isSelectedForIM = !this.simulation.ext.isSelectedForIM;
            }
        },
        
        // Backbone: view initializer.
        initialize: function () {
            // Bind to paging related events.
            MOD.events.on("ui:pagination", this._reset, this);
            MOD.events.on("state:simulationListFiltered", this._reset, this);
            MOD.events.on("state:simulationListNull", this._reset, this);           
            // Bind to web-socket related events.
            MOD.events.on("state:simulationStart", this._update, this);
            MOD.events.on("state:simulationComplete", this._update, this);
            MOD.events.on("state:simulationError", this._update, this);
            MOD.events.on("state:jobStart", this._update, this);
            MOD.events.on("state:jobComplete", this._update, this);
            MOD.events.on("state:jobError", this._update, this);            
        },        

        // Backbone: view renderer.
        render : function () {
            APP.utils.renderHTML(TEMPLATES.gridRow, {
                rowID: this.model
            }, this);
            this._reset();
            
            return this;
        },
        
        // Resets state.
        _reset : function() {
            // Reset data.
            if (MOD.state.paging.current &&
                MOD.state.paging.current.data &&
                MOD.state.paging.current.data.length >= this.model + 1) {
                this.simulation = MOD.state.paging.current.data[this.model];                
            } else {
                this.simulation = null;    
            }
            
            // Reset view.
            if (this.simulation) {
                this._updateView(false);            
                this.$el.removeClass("hidden");
            } else {                
                this.$el.addClass("hidden");
            }
        },
        
        // Updates state.
        _update : function (ei) {
            // Escape if not related to the simulation being displayed.
            if (APP.utils.isNone(this.simulation) || 
                this.simulation.uid !== ei.simulation.uid) {
                return;
            }

            // Update data.
            this.simulation = ei.simulation;

            // Reset view.
            this._updateView(true);            
        },          
        
        // Updates user interface.
        _updateView : function (isPartialUpdate) {
            var s = this.simulation;
            
            // Update core fields.
            _.each(MOD.statesCSS, function (stateCSS)  {
                this.$el.removeClass(stateCSS);
            }, this);                
            this.$el.addClass(MOD.getStateCSS(s.executionState));
            this._updateViewOfCell(s.ext, 'executionEndDate');
            this._updateViewOfJobCounts('compute', s.jobs.compute);
            this._updateViewOfJobCounts('post-processing', s.jobs.postProcessing);
            
            // Escape if only partially updating view.  
            if (isPartialUpdate === true) {
                return;
            }
                
            // Update remaining fields.
            this.$el.attr('id', 'simulation-' + s.uid);          
            this._updateViewOfCells(s, [
                'uid',
                'activity',
                'name',
                'tryID',
                'computeNodeLogin']);
            this._updateViewOfCells(s.ext, [
                'computeNodeMachine',
                'model',
                'space',
                'experiment',
                'executionStartDate']);
            if (s.ext.isSelectedForIM) {
                this.$('.interMonitoring > input').attr('checked', true);
            } else {
                this.$('.interMonitoring > input').removeAttr('checked');                    
            }
        },
        
        // Updates job count related cells.
        _updateViewOfJobCounts : function (jobTypeCSS, jobs) {
            var cssSelector;
            
            cssSelector = '.' + jobTypeCSS + '-job-count';
            this.$(cssSelector + ' > small').text(
                jobs.running.length + ' | ' +
                jobs.complete.length + ' | ' +
                jobs.error.length);
            if (jobs.error.length) {
                this.$(cssSelector).addClass('bg-danger');
            } else {
                this.$(cssSelector).removeClass('bg-danger');                    
            }               
        },
        
        // Updates a set of view cells.
        _updateViewOfCells : function (data, fields) {
            _.each(fields, function (field) {
                this._updateViewOfCell(data, field);
            }, this);
        },
        
        // Updates a cell view.
        _updateViewOfCell : function (data, field) {
            this.$('.' + field).attr('title', data[field]).
                                find('small').
                                text(data[field]);                                
        }          
    });

}(
    this.APP,
    this.APP.modules.monitoring,
    this.APP.modules.monitoring.templates,
    this._,
    this.Backbone
));
