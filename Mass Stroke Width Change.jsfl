var replaceWidth = parseInt(prompt("Stroke size to replace:", "8"));
var stroke_width = parseInt(prompt("New stroke width:", "6"));


function changeStroke(element, width)
{
    if (element.elementType == "shape") {
        var stroke = element.getCustomStroke();
		if(stroke.thickness != replaceWidth) return;
        stroke.thickness = width;
        element.setCustomStroke(stroke);

        // recurse for groups
        for (var iSubE in element.members) {
            var sub_element = element.members[iSubE];
            changeStroke(sub_element, width);
        }
    }
}

var libItems = fl.getDocumentDOM().library.items;
for (var item_it in libItems)
{
    var item = libItems[item_it];
    if (item == undefined || item.symbolType == undefined)
    {
        continue;
    }

    var timeline = item.timeline;
    for (var layer_it in timeline.layers)
    {
        var layer = timeline.layers[layer_it];
        var frame = layer.frames[0];
        for (var element_it in frame.elements)
        {
            var element = frame.elements[element_it];
            changeStroke(element, stroke_width);
        }
    }
}

fl.getDocumentDOM().getTimeline().addNewLayer("_temp"); 
fl.getDocumentDOM().getTimeline().deleteLayer(fl.getDocumentDOM().getTimeline().findLayerIndex("_temp")[0]);

fl.trace("Changed all stroke widths in document to "  + stroke_width);
