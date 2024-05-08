var el = fl.getDocumentDOM().getTimeline().layers[0].frames[0].elements;
for(var i = 0; i<el.length; i++)
{
    fl.trace(i+" - " + el[i]+", "+el[i].isGroup);
    convertToGraphics(el[i], "shape"+i);
}

//converts all current elements on the current timeline to movie clips with a effectSymbols move to Effect folder in the library and center registration point
function convertToGraphics(el, name)
{
    try
    {
        var symbolName = name;

        var cur_lib = fl.getDocumentDOM().library;
        fl.getDocumentDOM().selectNone();

        fl.getDocumentDOM().selection = [el];
        while(cur_lib.itemExists(symbolName+i))
            symbolName=symbolName+1;
        var newSym = fl.getDocumentDOM().convertToSymbol("movie clip", symbolName+i, "center");
    }
    catch (e)
    {
        fl.trace("Exception in : convertToGraphics" + e);
    }
}