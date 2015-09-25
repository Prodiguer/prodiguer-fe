(function (MOD) {

    // ECMAScript 5 Strict Mode
    "use strict";

    MOD.templates = {
        header:
            "<h2>Simulation: <%- simulation.activity.toUpperCase() %> -> <%- simulation.space.toUpperCase() %> -> <%- simulation.name %>\n\
                <span class='pull-right' style='margin-right: 4px;'>\n\
                    <span class='simulation-details glyphicon glyphicon-star' title='View Simulation Details'></span>\n\
                </span>\n\
            </h2>",

        footer:
            "<span>\n\
                <strong><%- simulation.activity.toUpperCase() %> -> <%- simulation.space.toUpperCase() %> -> <%- simulation.name %></strong>\n\
             </span>\n\
             <span class='pull-right'>\n\
                <small><strong>\n\
                    <a href='https://github.com/Prodiguer/prodiguer-docs/wiki' target='blank'><%- APP.title %></a> <%- MOD.title %> v<%- APP.version %> © <%- year %> <a href='<%- APP.institute.homePage %>' target='_blank'>IPSL</a>\n\
                </strong></small>\n\
             </span>",

        messageCollectionHeader:
            "<header class='bg-info'>\n\
                <h3><%- jobType %> Messages</h3>\n\
            </header>",

        tableHeader:
            "<tr class='bg-primary'>\n\
                <th title='UID' class='hidden'>UID</th>\n\
                <th title='ID' class='text-center'>#</th>\n\
                <th title='Type' class='text-center'>Type</th>\n\
                <th title='Job UID' class='text-center'>Job UID</th>\n\
                <th title='Timestamp' class='text-center'>Timestamp</th>\n\
            </tr>",

        tableRow:
            "<td class='uid hidden'><%= message.uid %></td>\n\
             <td style='width: 40px;' class='text-center' title='<%= messageIndex %>'><%= messageIndex %></td>\n\
             <td class='text-center' title='<%= message.typeID %>'><%= message.typeID %></td>\n\
             <td class='text-center' title='<%= message.correlationID2 %>'><%= message.correlationID2 %></td>\n\
             <td class='text-center' title='<%= message.timestamp %>'><%= message.timestamp %></td>"
    };

}(
    this.APP.modules.messages
));
