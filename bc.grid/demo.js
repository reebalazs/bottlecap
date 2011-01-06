var grid, dataView;

var columns = [
    {id:"type", name:"Type", field:"type", width: 40, cssClass: "cell-type"},
    {id:"title", name:"Title", field:"title", width: 400},
    {id:"modified", name:"Modified", field:"modified"}
];

var options = {
    enableCellNavigation: true,
    enableColumnReorder: false
};

$(function() {
    var data = [];
    for (var i = 0; i < 500; i++) {
        data[i] = {
            id: "id_" + i,
            title: "Task " + i,
            type: '',
            modified: "01/01/2009"
        };
    }

    dataView = new Slick.Data.DataView();
    grid = new Slick.Grid(".grid-body", dataView, columns, options);

    // wire up model events to drive the grid
    dataView.onRowCountChanged.subscribe(function(e, args) {
        grid.updateRowCount();
        grid.render();
    });

    dataView.beginUpdate();
    dataView.setItems(data);
    dataView.endUpdate();

})

window._karl_client_data = {"filegrid": {"sortColumn": "modified_date", "totalRecords": 5, "sortDirection": "desc", "columns": [
    {"width": 64, "id": "mimetype", "label": "Type"},
    {"width": 474, "id": "title", "label": "Title"},
    {"width": 128, "id": "modified_date", "label": "Last Modified"}
], "records": [
    ["<img src=\"https://karl.soros.org/static/r6556/images/doc_small.gif\" alt=\"icon\" title=\"Word\"/>", "Meeting Agenda_final draft<a href=\"https://karl.soros.org/communities/karl-core-team/files/2010/karl-meeting-agenda-jan809.doc/\" style=\"display: none;\"/>", "01/08/2010"],
    ["<img src=\"https://karl.soros.org/static/r6556/images/doc_small.gif\" alt=\"icon\" title=\"Word\"/>", "Culture of Learning_DEC09<a href=\"https://karl.soros.org/communities/karl-core-team/files/2010/working-group-meeting-notes-on-the-culture-of-continuous-learning.doc/\" style=\"display: none;\"/>", "01/08/2010"],
    ["<img src=\"https://karl.soros.org/static/r6556/images/doc_small.gif\" alt=\"icon\" title=\"Word\"/>", "Information Management_Outcomes_NOV09<a href=\"https://karl.soros.org/communities/karl-core-team/files/2010/meeting-follow-up_23nov09.doc/\" style=\"display: none;\"/>", "01/08/2010"],
    ["<img src=\"https://karl.soros.org/static/r6556/images/jpg_small.gif\" alt=\"icon\" title=\"JPEG Image\"/>", "KM Graphic_v1<a href=\"https://karl.soros.org/communities/karl-core-team/files/2010/km-graphic-01.jpg/\" style=\"display: none;\"/>", "01/08/2010"],
    ["<img src=\"https://karl.soros.org/static/r6556/images/doc_small.gif\" alt=\"icon\" title=\"Word\"/>", "Description of KM Graphic<a href=\"https://karl.soros.org/communities/karl-core-team/files/2010/description-of-km-graphic.doc/\" style=\"display: none;\"/>", "01/08/2010"]
]}, "tagbox": {"records": [], "docid": -1331575170}};
